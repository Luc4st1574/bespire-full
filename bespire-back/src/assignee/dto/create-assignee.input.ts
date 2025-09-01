import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAssigneeInput {
  @Field()
  linkedToId: string;

  @Field({ defaultValue: 'request' })
  linkedToType: string; // 'request', 'sales', etc.

  @Field()
  user: string; // userId a asignar
}
