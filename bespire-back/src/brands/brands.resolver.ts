import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { BrandsService } from './brands.service';
import { Brand } from './entities/brand.entity';
import { CreateBrandInput } from './dto/create-brand.input';
import { UpdateBrandInput } from './dto/update-brand.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { Permissions } from 'src/auth/permissions.decorator';

@Resolver(() => Brand)
export class BrandsResolver {
  constructor(private readonly brandsService: BrandsService) {}

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.CREATE_BRANDS)
  async createBrand(
    @Args('createBrandInput') createBrandInput: CreateBrandInput,
    @Context('req') req: any,
  ) {
    console.log('createBrandInput', createBrandInput);
    // El userId viene del contexto (token)
    const userId = req.user.sub;
    const brand = await this.brandsService.create(createBrandInput, userId);
    return 'Brand created successfully with ID: ';
  }

  @Query(() => [Brand])
  @UseGuards(GqlAuthGuard)
  async brandsForCurrentUser(@Context('req') req) {
    return this.brandsService.findByUser(req.user.sub);
  }

  @Query(() => [Brand])
  @UseGuards(GqlAuthGuard)
  async brandsForWorkspace(@Args('workspaceId') workspaceId: string) {
    return this.brandsService.findByWorkspace(workspaceId);
  }

  @Query(() => [Brand], { name: 'getAllBrands' })
  @UseGuards(GqlAuthGuard)
  findAllBrands(@Args('workspace', { type: () => String }) workspace: string) {
    return this.brandsService.findAll(workspace);
  }

  @Mutation(() => Brand)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_BRANDS)
  updateBrand(@Args('updateBrandInput') updateBrandInput: UpdateBrandInput) {
    return this.brandsService.update(updateBrandInput);
  }

  //remove brand
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.DELETE_BRANDS)
  async removeBrand(
    @Args('id', { type: () => String }) id: string,
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Context('req') req: any,
  ): Promise<string> {
    await this.brandsService.remove(id, workspaceId, req.user.sub);
    return 'Brand removed successfully';
  }
}
