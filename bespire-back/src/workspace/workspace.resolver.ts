import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WorkspaceService } from './workspace.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Workspace } from './schema/workspace.schema';
import { UpdateWorkspaceCompanyInput } from './dto/update-workspace-company.input';
import { WorkspaceBasic, WorkspaceEntity } from './entities/workspace.entity';
import { InviteMemberInput } from './dto/invite-member.input';
import { WorkspaceMemberDto } from './dto/workspace-member.dto';
import { WorkspaceCompanyQuery } from './dto/workspace.dto';
import { UpdateWorkspaceSettingsInput } from './dto/update-workspace-settings.input';
import { RemoveMemberInput } from './dto/remove-member.input';
import { UpdateMemberRoleInput } from './dto/update-member-role.input';
import { InvoiceDto, WorkspaceBillingDto } from './dto/billing.dto';
import { CancelPlanInput } from './dto/cancel-plan.input';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { UserAssigned } from 'src/requests/entities/request.entity';
import { AssignSuccessManagerInput } from './dto/assign-success-manager.input';
@Resolver()
export class WorkspaceResolver {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async updateWorkspaceCompany(
    @Args('workspaceId') workspaceId: string,
    @Args('input') input: UpdateWorkspaceCompanyInput,
    @Context('req') req: any,
  ): Promise<string> {
    // El userId viene del contexto (token)
    const userId = req.user.sub;
    return this.workspaceService.updateCompanyData(workspaceId, input, userId);
  }

  //get workspace by id

  @Query(() => WorkspaceBasic)
  @UseGuards(GqlAuthGuard)
  async getWorkspaceBasisById(
    @Args('workspaceId') workspaceId: string,
    @Context('req') req: any,
  ): Promise<WorkspaceBasic> {
    // El userId viene del contexto (token)
    const userId = req.user.sub;
    return this.workspaceService.findWorkspaceBasicById(workspaceId, userId);
  }

  //updateFocusAreas
  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async updateFocusAreas(
    @Args('workspaceId') workspaceId: string,
    @Args({ name: 'focusAreas', type: () => [String] }) focusAreas: string[],
    @Context('req') req: any,
  ): Promise<string> {
    // El userId viene del contexto (token)
    const userId = req.user.sub;
    return this.workspaceService.updateFocusAreas(
      workspaceId,
      focusAreas,
      userId,
    );
  }

  //updateCurrentStep
  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async updateCurrentStep(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('currentStep', { type: () => Number }) currentStep: number,
    @Context('req') req: any,
  ): Promise<string> {
    // El userId viene del contexto (token)
    const userId = req.user.sub;
    return this.workspaceService.updateCurrentStep(
      workspaceId,
      currentStep,
      userId,
    );
  }

  //invite member

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.INVITE_MEMBERS)
  async inviteMember(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('member') member: InviteMemberInput,
    @Context('req') req: any,
  ): Promise<string> {
    // El userId viene del contexto (token)
    const userId = req.user.sub;
    return this.workspaceService.inviteMember(workspaceId, member, userId);
  }

  @Query(() => [UserAssigned])
  @UseGuards(GqlAuthGuard)
  @Permissions(PERMISSIONS.USER_ASSIGNMENTS)
  async getMembersBespire(
    @Context('req') req: any,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<UserAssigned[]> {
    const userId = req.user.sub;
    return this.workspaceService.getMembersBespire(userId, search);
  }

  @Query(() => [UserAssigned])
  async membersByLinkedTo(
    @Args('linkedToId') linkedToId: string,
  ): Promise<UserAssigned[]> {
    return this.workspaceService.getAssignedMembersByLinkedTo(linkedToId);
  }

  //checkMemberExist
  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean)
  async checkMemberExist(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('email', { type: () => String }) email: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    // El userId viene del contexto (token)
    const userId = req.user.sub;
    return this.workspaceService.checkMemberExist(workspaceId, email);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [WorkspaceMemberDto])
  async getWorkspaceMembers(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Context('req') req: any,
  ): Promise<WorkspaceMemberDto[]> {
    const userId = req.user.sub;
    return this.workspaceService.getMembersWorkspace(workspaceId, userId);
  }

  //getCompanyDataByWorkspaceId
  @UseGuards(GqlAuthGuard)
  @Query(() => WorkspaceCompanyQuery)
  async getCompanyDataByWorkspaceId(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
  ): Promise<WorkspaceCompanyQuery> {
    return this.workspaceService.getCompanyDataByWorkspaceId(workspaceId);
  }

  //updateCompanyData
  @UseGuards(GqlAuthGuard)
  @Mutation(() => String)
  async updateCompanyData(
    @Args('workspaceId', { type: () => String }) workspaceId: string,
    @Args('input') input: UpdateWorkspaceCompanyInput,
    @Context('req') req: any,
  ): Promise<string> {
    const userId = req.user.sub;
    return this.workspaceService.updateCompanyData(workspaceId, input, userId);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_WORKSPACE)
  async updateWorkspaceSettings(
    @Args('workspaceId') workspaceId: string,
    @Args('input') input: UpdateWorkspaceSettingsInput,
    @Context('req') req: any,
  ): Promise<string> {
    const userId = req.user.sub;
    return this.workspaceService.updateWorkspaceSettings(
      workspaceId,
      input,
      userId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.DELETE_MEMBERS)
  async removeMember(
    @Args('input') input: RemoveMemberInput,
    @Context('req') req: any,
  ): Promise<boolean> {
    const userId = req.user.sub;
    return this.workspaceService.removeMember(
      input.workspaceId,
      input.memberId,
      userId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_MEMBERS)
  async updateMemberRole(
    @Args('input') input: UpdateMemberRoleInput,
    @Context('req') req: any,
  ): Promise<boolean> {
    const userId = req.user.sub;
    return this.workspaceService.updateMemberRole(
      input.workspaceId,
      input.memberId,
      input.role as 'admin' | 'user' | 'viewer',
      userId,
    );
  }

  //billing
  @Query(() => WorkspaceBillingDto)
  async getWorkspaceBilling(
    @Args('workspaceId') workspaceId: string,
  ): Promise<WorkspaceBillingDto> {
    return this.workspaceService.getBillingInfo(workspaceId);
  }

  @Query(() => [InvoiceDto])
  async getWorkspaceInvoices(
    @Args('workspaceId') workspaceId: string,
  ): Promise<InvoiceDto[]> {
    return this.workspaceService.getInvoices(workspaceId);
  }

  @Mutation(() => String)
  async createCustomerPortalSession(
    @Args('workspaceId') workspaceId: string,
  ): Promise<string> {
    return this.workspaceService.createCustomerPortalSession(workspaceId);
  }
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateDefaultCard(
    @Args('workspaceId') workspaceId: string,
    @Args('paymentMethodId') paymentMethodId: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const userId = req.user.sub;
    console.log(
      `Updating default card for workspace ${workspaceId} with payment method ${paymentMethodId} by user ${userId}`,
    );
    // (Verifica permisos si quieres)

    return this.workspaceService.updateDefaultCard(
      workspaceId,
      paymentMethodId,
    );
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async createSetupIntent(
    @Args('workspaceId') workspaceId: string,
    @Context('req') req: any,
  ) {
    // Busca el workspace y su stripeCustomerId
    return this.workspaceService.createSetupIntentByWorkspace(workspaceId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async cancelWorkspacePlan(
    @Args('input') input: CancelPlanInput,
    @Context('req') req: any,
  ): Promise<boolean> {
    // Aquí puedes asegurar que sólo el owner/admin pueda cancelar
    await this.workspaceService.cancelWorkspacePlan(input, req.user.sub);
    return true;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.ASSIGN_SUCCESS_MANAGER) // agrega este permiso a tus enums/constants
  async assignSuccessManager(
    @Args('input') input: AssignSuccessManagerInput,
  ): Promise<boolean> {
    return this.workspaceService.assignSuccessManager(input);
  }
}
