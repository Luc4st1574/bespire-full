import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class FeedbackEntity {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  category: string;

  @Field()
  title: string;

  @Field()
  details: string;

  @Field()
  sendCopy: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
