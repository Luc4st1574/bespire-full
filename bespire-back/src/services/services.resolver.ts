// src/services/services.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { CreateServiceInput } from './dto/create-service.input';
import { UpdateServiceInput } from './dto/update-service.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { Permissions } from 'src/auth/permissions.decorator';

@Resolver(() => Service)
export class ServicesResolver {
  constructor(private readonly servicesService: ServicesService) {}

  @Mutation(() => Service)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.CREATE_SERVICES)
  async createService(@Args('input') input: CreateServiceInput) {
    return this.servicesService.create(input);
  }

  @Query(() => [Service])
  @UseGuards(GqlAuthGuard)
  async servicesActive() {
    return this.servicesService.findAllActive();
  }

  @Query(() => [Service])
  @UseGuards(GqlAuthGuard)
  async services() {
    return this.servicesService.findAll();
  }

  @Query(() => Service)
  @UseGuards(GqlAuthGuard)
  async service(@Args('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Mutation(() => Service)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_SERVICES)
  async updateService(@Args('input') input: UpdateServiceInput) {
    return this.servicesService.update(input.id, input);
  }

  @Mutation(() => Service)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.DELETE_SERVICES)
  async removeService(@Args('id') id: string) {
    return this.servicesService.remove(id);
  }
}
