import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Plan {
  @Field()
  id: string;

  @Field(() => String)
  slug: string; // 'starter', 'growth', 'pro'

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => String)
  stripePriceId: string; // Relaciona con el Price ID de Stripe

  @Field(() => Int)
  price: number; // Para mostrar el precio, no para facturar

  @Field(() => Int)
  creditsPerMonth: number;

  @Field(() => Int, { defaultValue: 1 })
  brandsAllowed: number;

  @Field(() => Int, { defaultValue: 1 })
  activeOrdersAllowed: number;

  @Field(() => [String], { defaultValue: [] })
  includedServices: string[]; // ['all', 'branding', ...]

  @Field(() => [String], { defaultValue: [] })
  excludedServices: string[]; // ['advanced_video', ...]

  @Field(() => Boolean, { defaultValue: true })
  active: boolean;
}
