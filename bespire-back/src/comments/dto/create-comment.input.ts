// src/comments/dto/create-comment.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field(() => ID)
  linkedToId: string;

  @Field(() => String)
  linkedToType: 'request' | 'subtask' | 'brand' | 'other';

  @Field(() => String, { nullable: true })
  text?: string;
}
