import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { PlansService } from 'src/plans/plans.service';
import { UsersService } from 'src/users/users.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import Stripe from 'stripe';

@Controller('stripe/webhook')
export class StripeController {
  // Asegúrate de definir STRIPE_SECRET_KEY2 y STRIPE_WEBHOOK_SECRET en tu .env
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY2 as string, {
    apiVersion: '2025-03-31.basil',
  });

  constructor(
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  // Utilidad: suma intervalo (Stripe usa timestamps en segundos, UTC)
  private addIntervalFromEpoch(
    epochSeconds: number,
    interval: 'day' | 'week' | 'month' | 'year',
    count = 1,
  ): Date {
    const d = new Date(epochSeconds * 1000);
    switch (interval) {
      case 'day':
        d.setUTCDate(d.getUTCDate() + count);
        break;
      case 'week':
        d.setUTCDate(d.getUTCDate() + 7 * count);
        break;
      case 'month':
        d.setUTCMonth(d.getUTCMonth() + count);
        break;
      case 'year':
        d.setUTCFullYear(d.getUTCFullYear() + count);
        break;
    }
    return d;
  }

  @Post()
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;
    try {
      // OJO: debes tener rawBody habilitado en Nest para webhooks de Stripe
      event = this.stripe.webhooks.constructEvent(
        (req as any).rawBody,
        signature,
        endpointSecret,
      );
    } catch (err: any) {
      console.error(
        'Webhook signature verification failed:',
        err?.message || err,
      );
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const workspaceId = session.metadata?.workspaceId;
      const planSelected = session.metadata?.planSelected;
      const customerId = session.customer as string | null;
      const subscriptionId = session.subscription as string | null;

      if (!workspaceId) {
        console.error('No workspaceId in session metadata');
        return res.status(400).send('workspace ID not provided.');
      }

      const planDb = await this.plansService.findOne({ slug: planSelected });
      if (!planDb) {
        console.error('Invalid plan slug:', planSelected);
        return res.status(400).send('Invalid plan.');
      }

      // --- Calcular planEndsAt de forma robusta ---
      let planEndsAt: Date | null = null;

      if (subscriptionId) {
        try {
          // Expandimos invoice y líneas para poder leer period.end de la línea
          const subscription = await this.stripe.subscriptions.retrieve(
            subscriptionId,
            {
              expand: [
                'latest_invoice',
                'latest_invoice.lines.data',
                'items.data.plan',
              ],
            },
          );

          // 1) Si hay cancel_at (cancelación programada), usamos eso
          const cancelAt = (subscription as any).cancel_at as number | null;
          if (cancelAt) {
            planEndsAt = new Date(cancelAt * 1000);
          }

          // 2) Si existe current_period_end, úsalo directamente
          if (!planEndsAt) {
            const cpe = (subscription as any).current_period_end as
              | number
              | null;
            if (cpe) {
              planEndsAt = new Date(cpe * 1000);
            }
          }

          // 3) Cálculo: anchor + interval/interval_count (del plan)
          if (!planEndsAt) {
            const anchorTs =
              ((subscription as any).current_period_start as number | null) ??
              ((subscription as any).billing_cycle_anchor as number | null) ??
              ((subscription as any).start_date as number | null);

            // Tomamos intervalo del plan del item principal
            const planInfo =
              (subscription.items?.data?.[0] as any)?.plan ??
              (subscription as any).plan ??
              null;

            const interval: 'day' | 'week' | 'month' | 'year' =
              planInfo?.interval ?? 'month';
            const intervalCount: number = planInfo?.interval_count ?? 1;

            if (anchorTs) {
              planEndsAt = this.addIntervalFromEpoch(
                anchorTs,
                interval,
                intervalCount,
              );
            }
          }

          // 4) (Opcional / respaldo): usar la última invoice -> lines[0].period.end
          if (!planEndsAt) {
            const inv = subscription.latest_invoice as Stripe.Invoice | null;
            const end = inv?.lines?.data?.[0]?.period?.end ?? null; // fin del período de la línea
            if (end) {
              planEndsAt = new Date(end * 1000);
            }
          }

          console.log(
            `Stripe subscription retrieved for workspace ${workspaceId}:`,
            {
              id: subscription.id,
              cancel_at: (subscription as any).cancel_at,
              current_period_end: (subscription as any).current_period_end,
              current_period_start: (subscription as any).current_period_start,
              billing_cycle_anchor: (subscription as any).billing_cycle_anchor,
              computed_planEndsAt: planEndsAt,
            },
          );
        } catch (err: any) {
          console.warn(
            'Could not retrieve stripe subscription:',
            err?.message || err,
          );
        }
      }

      // Actualizamos el workspace; solo seteamos planEndsAt si lo pudimos calcular
      await this.workspaceService.findByIdAndUpdate(workspaceId, {
        hasPaid: true,
        stripeCustomerId: customerId ?? undefined,
        stripeSubscriptionId: subscriptionId ?? undefined,
        plan: new Types.ObjectId(planDb._id.toString()),
        credits: planDb.creditsPerMonth || 0,
        onboardingCompleted: true,
        ...(planEndsAt ? { planEndsAt } : {}),
      });

      console.log(
        `Workspace ${workspaceId} marked as paid with plan ${planSelected}; planEndsAt=${planEndsAt?.toISOString()}`,
      );
    }

    return res.json({ received: true });
  }
}
