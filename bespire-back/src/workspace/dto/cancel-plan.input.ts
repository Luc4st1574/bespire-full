import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CancelPlanInput {
  @Field()
  workspaceId: string;

  @Field()
  reason: string;

  @Field({ nullable: true })
  other?: string;
}
