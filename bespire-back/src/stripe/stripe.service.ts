import { Injectable } from '@nestjs/common';
import { PlansService } from 'src/plans/plans.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  constructor(
    private readonly plansService: PlansService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY2, {
    apiVersion: '2025-03-31.basil',
  });

  async createCheckoutSession(
    plan: string,
    userEmail: string,
    userId: string,
    workspaceId: string,
    successUrl?: string,
    cancelUrl?: string,
  ) {
    const workspace = await this.workspaceService.getWorkspaceById(workspaceId);
    if (!workspace) throw new Error('Workspace not found');

    const planDb = await this.plansService.findOne({ slug: plan });
    if (!planDb) throw new Error('Invalid plan');
    if (!planDb.stripePriceId)
      throw new Error('Plan not available for Stripe payments');

    const priceId = planDb.stripePriceId;
    const stripeCustomerId = workspace.stripeCustomerId;

    const sessionParams: any = {
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url:
        successUrl ||
        `${process.env.FRONTEND_URL}/auth/onboarding/stripe-success`,
      cancel_url:
        cancelUrl || `${process.env.FRONTEND_URL}/auth/onboarding/step-4`,
      metadata: {
        workspaceId,
        planSelected: plan,
      },
    };

    // Si ya tienes customerId, pásalo a Stripe
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
      // Stripe ignora customer_email si pasas customer, así que es seguro.
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async createSetupIntent(stripeCustomerId: string) {
    const intent = await this.stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: 'off_session', // recomendado para pagos futuros
    });
    return { clientSecret: intent.client_secret };
  }

  async createCustomerPortalSession(customerId: string) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`, // después de salir del portal vuelve al dashboard
    });

    return session.url;
  }
}
