/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UsersService } from './users.service';
import {
  CreateUserInput,
  CreateUserInputByAdmin,
} from './dto/create-user.input';
import { PreRegisterClientInput } from './dto/pre-register-client.input';
import { PreRegisterClientResponse } from './dto/pre-register-client.response';
import { AddClientToCompanyInput } from './dto/add-client-to-company.input';
import { AddClientToCompanyResponse } from './dto/add-client-to-company.response';
import { EditClientInfoInput } from './dto/edit-client-info.input';
import { EditClientInfoResponse } from './dto/edit-client-info.response';
import { LoginUserInput } from './dto/login-user.input';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { OnboardingInput } from './dto/onboarding.input';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { UserProfileOutput } from './dto/user-profile.output';
import { LoginResponse } from './dto/login-response.dto';
import { UpdatePreferencesInput } from './dto/update-preferences.input';
import { Roles } from 'src/auth/roles.decorator';
import { USER_ROLES } from 'src/auth/roles.constants';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAssigned } from 'src/requests/entities/request.entity';
import { TEAM_ROLES, teamRoleLabels } from './schemas/user.schema';
import { UpdateUserInput } from './dto/update-user.input';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { ClientWithWorkspaceInfo } from './dto/client-with-workspace-info.output';
import { UpdateClientInfoInput } from './dto/update-client-info.input';
import { UpdateClientInfoResponse } from './dto/update-client-info.response';
import { ClientExtended, ClientListAdmin } from './dto/client-extended.output';
import { ClientDetail } from './dto/client-detail.output';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(() => CreateUserDto)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.CREATE_USERS)
  async CreateUser(
    @Args('input') input: CreateUserInputByAdmin,
  ): Promise<CreateUserDto> {
    console.log('Create user:', input);
    const user = await this.usersService.createByAdmin(input);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user2 = await this.usersService.findByEmail(input.email);
    console.log('User found:', user2);
    return {
      //@ts-ignore
      user: user2,
    };
  }

  // Mutation para update del usuario logueado
  @Mutation(() => String)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_PROFILE)
  async updateUser(
    @Args('input') input: UpdateUserInput,
    @Context('req') req: any,
  ): Promise<string> {
    // Obtén el userId desde el contexto del request (req.user o como lo manejes en tu auth)
    const userId = req.user.sub;
    return this.usersService.updateUser(userId, input);
  }

  @Mutation(() => LoginResponse)
  async register(
    @Args('input') input: CreateUserInput,
  ): Promise<LoginResponse> {
    console.log('Registering user:', input);
    //@ts-ignore
    return this.usersService.registerUserClient(input);
  }

  @Mutation(() => PreRegisterClientResponse)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.CREATE_USERS)
  async preRegisterClient(
    @Args('input') input: PreRegisterClientInput,
  ): Promise<PreRegisterClientResponse> {
    console.log('Pre-registering client:', input);
    return this.usersService.preRegisterClient(input);
  }

  @Mutation(() => AddClientToCompanyResponse)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.CREATE_USERS)
  async addClientToCompany(
    @Args('input') input: AddClientToCompanyInput,
  ): Promise<AddClientToCompanyResponse> {
    console.log('Adding client to existing company:', input);
    return this.usersService.addClientToCompany(input);
  }

  @Mutation(() => EditClientInfoResponse)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_USERS)
  async editClientInfo(
    @Args('input') input: EditClientInfoInput,
  ): Promise<EditClientInfoResponse> {
    console.log('Editing client info:', input);
    return this.usersService.editClientInfo(input);
  }

  @Mutation(() => UpdateClientInfoResponse)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_USERS)
  async updateClientInfo(
    @Args('input') input: UpdateClientInfoInput,
  ): Promise<UpdateClientInfoResponse> {
    console.log('Updating client info:', input);
    return this.usersService.updateClientInfo(input);
  }

  @Mutation(() => Boolean)
  @Roles(USER_ROLES.CLIENT)
  @UseGuards(GqlAuthGuard, RolesGuard)
  async updateOnboardingProgress(
    @Args('input', { type: () => GraphQLJSON }) input: any,
    @Context('req') req: any,
  ): Promise<boolean> {
    console.log('Onboarding progress:', input, req);
    const userId = req.user.sub;
    await this.usersService.updateOnboardingProgress(userId, input);
    return true;
  }
  @Query(() => UserProfileOutput)
  @UseGuards(GqlAuthGuard)
  async getUserProfile(@Context('req') req: any): Promise<UserProfileOutput> {
    // console.log('Fetching user profile');
    const userId = req.user.sub;
    const user = await this.usersService.findById(userId);
    //@ts-ignore
    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      contactNumber: user.contactNumber || null,
      avatarUrl: user.avatarUrl || null,
      teamRole: teamRoleLabels[user.teamRole] || null,
      registrationStatus: user.registrationStatus,
      hasVisitedDashboard: user.hasVisitedDashboard,
      role: user.role,
      workspaceSelected: user.workspaceSelected.toString() || null,
      preferences: user.preferences,
    };
  }
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async completeOnboarding(
    @Args('input') input: OnboardingInput,
    @Context('req') req: any,
  ): Promise<boolean> {
    const userId = req.user.sub; // El user id del token JWT
    await this.usersService.completeOnboarding(userId, input);
    return true;
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginUserInput): Promise<LoginResponse> {
    //@ts-ignore
    return this.usersService.loginUser(input);
  }

  //refresh token
  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  async refreshToken(@Context('req') req: any): Promise<LoginResponse> {
    const userId = req.user.sub; // El user id del token JWT
    //@ts-ignore
    return this.usersService.refreshToken(userId);
  }

  // dentro del @Resolver
  @Query(() => String)
  healthCheck() {
    return 'API is working!';
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markUserAsPaid(@Context('req') req: any): Promise<boolean> {
    const userId = req.user.sub;
    await this.usersService.markUserAsPaid(userId);
    return true;
  }

  @Query(() => Boolean)
  async checkUserExists(
    @Args('email', { type: () => String }) email: string,
  ): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    return !!user;
  }

  @Query(() => [UserAssigned], { name: 'searchMembersBespire' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER_ASSIGNMENTS)
  async searchMembersBespire(
    @Args('search', { type: () => String }) search: string,
  ): Promise<UserAssigned[]> {
    const users = await this.usersService.searchMembers(search);
    return users.map(
      (r): UserAssigned => ({
        id: r._id.toString(),
        name: `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.email,
        avatarUrl: r.avatarUrl || null,
        teamRole: teamRoleLabels[r.teamRole] || null,
      }),
    );
  }

  @Query(() => [UserAssigned], { name: 'getSuccessManagers' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.VIEW_USERS)
  async getSuccessManagers(): Promise<UserAssigned[]> {
    const users = await this.usersService.getSuccessManagers();
    return users.map(
      (r): UserAssigned => ({
        id: r._id.toString(),
        name: `${r.firstName || ''} ${r.lastName || ''}`.trim() || r.email,
        avatarUrl: r.avatarUrl || null,
        teamRole: teamRoleLabels[r.teamRole] || null,
      }),
    );
  }

  @Query(() => [ClientWithWorkspaceInfo], { name: 'getAllClients' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.VIEW_USERS)
  async getAllClients(): Promise<ClientWithWorkspaceInfo[]> {
    return this.usersService.getAllClientsWithWorkspaceInfo();
  }

  @Query(() => [ClientListAdmin], { name: 'getClientListAdmin' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.VIEW_USERS)
  async getClientListAdmin(): Promise<ClientListAdmin[]> {
    return this.usersService.getClientListAdmin();
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args('email') email: string): Promise<boolean> {
    return this.usersService.forgotPassword(email);
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    return this.usersService.resetPassword(token, newPassword);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.EDIT_PROFILE)
  async updateUserPreferences(
    @Args('input') input: UpdatePreferencesInput,
    @Context('req') req: any,
  ): Promise<boolean> {
    const userId = req.user.sub; // Asegúrate que el guard te pasa el user en req.user
    return this.usersService.setUserPreferences(userId, input);
  }

  @Query(() => ClientDetail, { name: 'getClient' })
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.VIEW_USERS)
  async getClient(
    @Args('id', { type: () => String }) id: string,
  ): Promise<ClientDetail | null> {
    return this.usersService.getClientById(id);
  }
}
