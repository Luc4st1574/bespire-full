import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { Comment } from './schema/comments.schema';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { Permissions } from 'src/auth/permissions.decorator';

@Resolver()
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @Query(() => [Comment], { name: 'getCommentsForEntity' })
  @UseGuards(GqlAuthGuard)
  async getCommentsForEntity(
    @Args('linkedToId', { type: () => ID }) linkedToId: string,
  ): Promise<Comment[]> {
    return this.commentsService.findAllByLinkedTo(linkedToId);
  }

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_WORKSPACE)
  async createComment(
    @Args('input') input: CreateCommentInput,
    @Context('req') req,
  ): Promise<Comment> {
    const userId = req.user?.sub;
    return this.commentsService.create(input, userId);
  }
}
