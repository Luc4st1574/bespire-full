import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReviewsService } from './reviews.service';
import { ReviewResponse } from './dto/review-response.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CreateReviewInput } from './dto/create-review.input';

@Resolver()
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Mutation(() => ReviewResponse)
  @UseGuards(GqlAuthGuard)
  async leaveReview(
    @Args('input') input: CreateReviewInput,
    @Context('req') req: any,
  ): Promise<ReviewResponse> {
    return this.reviewsService.create(input, req.user.sub);
  }

  @Query(() => [ReviewResponse], { name: 'reviewsByRequest' })
  @UseGuards(GqlAuthGuard)
  async reviewsByRequest(
    @Args('requestId') requestId: string,
  ): Promise<ReviewResponse[]> {
    return this.reviewsService.findByRequest(requestId);
  }
}
