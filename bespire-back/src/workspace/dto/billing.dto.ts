// src/workspace/dto/billing.dto.ts
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethodDto {
  @Field()
  brand: string;

  @Field()
  last4: string;
}

@ObjectType()
export class WorkspaceBillingDto {
  @Field()
  name: string;

  @Field()
  currentPlan: string;

  @Field()
  creditUsage: string;

  @Field()
  hasPaid: boolean;

  @Field({ nullable: true })
  stripeCustomerId?: string;

  @Field(() => PaymentMethodDto, { nullable: true })
  paymentMethod?: PaymentMethodDto;
}

@ObjectType()
export class InvoiceDto {
  @Field()
  id: string;

  @Field()
  date: string; // O Date si prefieres

  @Field()
  amount: string;

  @Field()
  status: string;

  @Field()
  pdfUrl: string;

  @Field()
  plan: string;
}
