// src/reviews/dto/review-response.dto.ts
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class ReviewResponse {
  @Field(() => ID) _id: string;
  @Field(() => ID) linkedToId: string;
  @Field() linkedToType: string;
  @Field(() => Int) rating: number;
  @Field({ nullable: true }) feedback?: string;
  @Field(() => Date) createdAt: Date;
}
