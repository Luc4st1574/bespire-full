import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AssigneeService } from './assignee.service';
import { Assignee } from './schema/assignee.schema';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CreateAssigneeInput } from './dto/create-assignee.input';
import { AssigneeOutput } from './dto/assignee-output.dto';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { Permissions } from 'src/auth/permissions.decorator';
@Resolver()
export class AssigneeResolver {
  constructor(private readonly assigneesService: AssigneeService) {}
  @Mutation(() => AssigneeOutput)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER_ASSIGNMENTS)
  async addAssignee(
    @Args('input') input: CreateAssigneeInput,
    @Context('req') req,
  ) {
    const assignedBy = req.user?.sub;
    return this.assigneesService.addAssignee(input, assignedBy);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER_ASSIGNMENTS)
  async removeAssignee(
    @Args('linkedToId') linkedToId: string,
    @Args('linkedToType') linkedToType: string,
    @Args('user') user: string,
    @Context('req') req,
  ) {
    const role = req.user?.role;
    if (role !== 'admin' && req.user?.sub === user) {
      throw new Error(
        'You cannot remove yourself as an assignee unless you are an admin.',
      );
    }
    return this.assigneesService.removeAssignee(linkedToId, linkedToType, user);
  }

  @Query(() => [AssigneeOutput])
  @UseGuards(GqlAuthGuard)
  async assigneesByEntity(
    @Args('linkedToId') linkedToId: string,
    @Args('linkedToType') linkedToType: string,
  ) {
    return this.assigneesService.getAssignees(linkedToId, linkedToType);
  }
}
