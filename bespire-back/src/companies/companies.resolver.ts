import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { UpdateCompanyInput } from './dto/update-company.input';

@Resolver()
export class CompaniesResolver {
  constructor(private readonly companiesService: CompaniesService) {}

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_COMPANIES)
  async updateCompany(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateCompanyInput,
  ): Promise<string> {
    await this.companiesService.update(id, input as any);
    return 'OK';
  }
}
