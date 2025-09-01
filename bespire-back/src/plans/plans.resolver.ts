import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlansService } from './plans.service';
import { Plan } from './entities/plan.entity';
import { CreatePlanInput } from './dto/create-plan.input';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Permissions } from 'src/auth/permissions.decorator';

@Resolver(() => Plan)
export class PlansResolver {
  constructor(private readonly plansService: PlansService) {}

  @Mutation(() => Plan)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.MANAGE_PLAN)
  createPlan(@Args('createPlanInput') createPlanInput: CreatePlanInput) {
    return this.plansService.create(createPlanInput);
  }
}
