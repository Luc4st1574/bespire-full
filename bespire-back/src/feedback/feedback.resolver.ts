import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { FeedbackService } from './feedback.service';
import { FeedbackEntity } from './entities/feedback.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CreateFeedbackInput } from './dto/create-feedback.input';

@Resolver(() => FeedbackEntity)
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Mutation(() => FeedbackEntity)
  @UseGuards(GqlAuthGuard)
  async createFeedback(
    @Args('input') input: CreateFeedbackInput,
    @Context('req') req: any,
  ) {
    const userId = req.user.sub;
    return this.feedbackService.create(userId, input);
  }
}
