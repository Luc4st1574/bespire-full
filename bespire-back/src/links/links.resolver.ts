import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LinksService } from './links.service';
import { CreateLinkInput } from './dto/create-link.input';
import { Link } from './schema/links.schema';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';

@Resolver()
export class LinksResolver {
  constructor(private readonly linksService: LinksService) {}

  @Mutation(() => Link)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.CREATE_LINKS)
  async createLink(@Args('input') input: CreateLinkInput, @Context('req') req) {
    const userId = req.user?.sub;
    return this.linksService.create(input, userId);
  }

  @Query(() => [Link])
  @UseGuards(GqlAuthGuard)
  async linksByLinkedToId(@Args('linkedToId') linkedToId: string) {
    return this.linksService.findByLinkedToId(linkedToId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.DELETE_LINKS)
  async deleteLink(@Args('linkId') linkId: string, @Context('req') req) {
    const userId = req.user?.sub;
    return this.linksService.delete(linkId, userId);
  }
}
