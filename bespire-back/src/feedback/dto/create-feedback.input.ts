import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateFeedbackInput {
  @Field()
  category: string;

  @Field()
  title: string;

  @Field()
  details: string;

  @Field()
  sendCopy: boolean;
}
