import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateActivityLogInput {
  @Field()
  linkedToId: string;

  @Field()
  linkedToType: 'request' | 'subtask' | 'brand' | 'other';

  @Field()
  action: string;

  @Field({ nullable: true })
  meta?: Object; // JSON.stringify de info extra

  @Field({ nullable: true })
  activityText?: string;
}
