// src/reviews/dto/create-review.input.ts
import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field(() => ID) linkedToId: string;
  @Field() linkedToType: string; // e.g. 'request'
  @Field(() => Int) rating: number;
  @Field({ nullable: true }) feedback?: string;
}
