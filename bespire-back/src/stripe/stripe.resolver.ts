/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { StripeService } from './stripe.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UsersService } from 'src/users/users.service';

@Resolver()
export class StripeResolver {
  constructor(
    private readonly stripeService: StripeService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async createCheckoutSession(
    @Args('plan') plan: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Context('req') req: any,
    @Args('successUrl', { type: () => String, nullable: true })
    successUrl?: string,
    @Args('cancelUrl', { type: () => String, nullable: true })
    cancelUrl?: string,
  ): Promise<string> {
    const email = req.user.email;
    const userId = req.user.sub;

    const { url } = await this.stripeService.createCheckoutSession(
      plan,
      email,
      userId,
      workspaceId,
      successUrl,
      cancelUrl,
    );

    return url;
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async createCustomerPortalSession(@Context('req') req: any): Promise<string> {
    const user = await this.usersService.findById(req.user.sub);
    //@ts-ignore
    if (!user.stripeCustomerId) {
      throw new Error('No Stripe customer ID found.');
    }

    return this.stripeService.createCustomerPortalSession(
      //@ts-ignore
      user.stripeCustomerId,
    );
  }
}
