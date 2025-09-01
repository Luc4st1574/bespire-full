import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { CreateUserInput } from '../dto/create-user.input';
import { LoginUserInput } from '../dto/login-user.input';
import { InviteMemberInput } from 'src/workspace/dto/invite-member.input';
import { JwtService } from '@nestjs/jwt';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { CompaniesService } from 'src/companies/companies.service';
import { getEffectivePermissions } from 'src/auth/get-permissions.util';
import { buildUserJwtPayload } from 'src/auth/utils/buildUserJwtPayload.util';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private workspaceService: WorkspaceService,
    private readonly companiesService: CompaniesService,
  ) {}

  async createNewUserMemberInvited(
    input: InviteMemberInput,
    workspaceId: string,
  ): Promise<User> {
    console.log(
      'createNewUserMemberInvited',
      input.email,
      input.role,
      workspaceId,
    );
    // Verifica si el usuario ya existe
    // @ts-ignore
    const existingUser = await this.userModel.findOne({
      email: input.email,
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    // Crea un nuevo usuario con el email proporcionado
    // @ts-ignore
    const passwordHash = await this.createPasswordHash('passwordDefault**()&^');
    //verficar si viene teamRole en el input y si es asi cambiar el role a team_member
    const role = input.teamRole ? 'team_member' : 'client';
    // Si es team_member, asignar teamRole
    const objUserMember = {
      email: input.email,
      passwordHash,
      role: role, // Asigna el role según el input
      registrationStatus: 'in_progress', // Estado de invitación
      workspaceSelected: new Types.ObjectId(workspaceId), // Asigna el workspace
    };
    // @ts-ignore
    const newUser = await this.create(objUserMember);
    //@ts-ignore
    return newUser;
  }

  async registerUserClient(input: CreateUserInput) {
    //crear password
    // @ts-ignore
    const passwordHash = await this.createPasswordHash(input.password);
    //crear objeto de usuario
    const userObj = {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: 'client',
      registrationStatus: 'completed', // Estado de registro
    };
    // @ts-ignore
    const user = await this.create(userObj);
    //@ts-ignore
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 1. Crear la Company primero
    const companyData = {
      name: input.companyName,
      // @ts-ignore
      createdBy: user._id as Types.ObjectId,
    };

    // @ts-ignore
    const company = await this.companiesService.create(companyData);
    // @ts-ignore
    if (!company) {
      throw new BadRequestException('Error creating company');
    }

    // 2. Crear workspace asociado a la company
    // @ts-ignore
    const workspace = await this.workspaceService.createDefaultForClient(
      user,
      company._id.toString(),
      input.companyRole,
    );
    // @ts-ignore
    if (!workspace) {
      throw new BadRequestException('Error creating workspace');
    }

    console.log('Workspace created:', workspace);
    console.log('User created:', user);

    //ahora actualizar el workspaceSelected en user
    // @ts-ignore
    // @ts-ignore
    await this.userModel.updateOne(
      // @ts-ignore
      { _id: user._id },
      // @ts-ignore
      { workspaceSelected: workspace._id },
      { new: true },
    );

    // @ts-ignore
    const memberInfo = workspace.members.find((m) => m.user.equals(user._id));
    // @ts-ignore
    const workspaceRole = memberInfo?.role || null;
    // @ts-ignore
    const workspaceTeamRole = memberInfo?.teamRole || null;

    // @ts-ignore
    const permissions = getEffectivePermissions({
      // @ts-ignore
      role: user.role,
      // @ts-ignore
      teamRole: workspaceTeamRole,
      // @ts-ignore
      workspaceRole,
    });

    // @ts-ignore
    const payload = buildUserJwtPayload({
      user: {
        // @ts-ignore
        id: user._id.toString(),
        // @ts-ignore
        email: user.email,
        // @ts-ignore
        role: user.role,
        // @ts-ignore
        teamRole: user.teamRole,
      },
      // @ts-ignore
      workspaceRole,
      // @ts-ignore
      permissions,
    });
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: user,
    };
  }

  async refreshToken(userId: string) {
    console.log('Refreshing token for user:', userId);
    // @ts-ignore
    const user = await this.findById(userId);
    // @ts-ignore
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    //buscar workspace
    // @ts-ignore
    if (!user.workspaceSelected) {
      throw new UnauthorizedException('User has no workspace selected');
    }

    // @ts-ignore
    // @ts-ignore
    const workspace = await this.workspaceService.getWorkspaceById(
      // @ts-ignore
      user.workspaceSelected.toString(),
    );
    if (!workspace) {
      throw new UnauthorizedException('Workspace not found');
    }
    //@ts-ignore
    // @ts-ignore
    const memberInfo = workspace.members.find((m) => m.user.equals(user._id));
    console.log('Member info:', memberInfo);
    // @ts-ignore
    const workspaceRole = memberInfo?.role || null;
    // @ts-ignore
    const workspaceTeamRole = memberInfo?.teamRole || null;
    // @ts-ignore
    const permissions = getEffectivePermissions({
      // @ts-ignore
      role: user.role,
      // @ts-ignore
      teamRole: workspaceTeamRole,
      // @ts-ignore
      workspaceRole,
    });

    // @ts-ignore
    const payload = buildUserJwtPayload({
      user: {
        // @ts-ignore
        id: user._id.toString(),
        // @ts-ignore
        email: user.email,
        // @ts-ignore
        role: user.role,
        // @ts-ignore
        teamRole: workspaceTeamRole,
      },
      // @ts-ignore
      workspaceRole,
      // @ts-ignore
      permissions,
    });
    const token = this.jwtService.sign(payload);

    return {
      token,
      user,
    };
  }

  async loginUser(input: LoginUserInput) {
    console.log('Logging in user:', input);
    // @ts-ignore
    const user = await this.findByEmail(input.email);
    // @ts-ignore
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    //console.log('User found:', user);

    // @ts-ignore
    // @ts-ignore
    const isPasswordValid = await bcrypt.compare(
      input.password,
      // @ts-ignore
      user.passwordHash,
    );
    // @ts-ignore
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    //buscar workspace
    // @ts-ignore
    if (!user.workspaceSelected) {
      throw new UnauthorizedException('User has no workspace selected');
    }

    // @ts-ignore
    // @ts-ignore
    const workspace = await this.workspaceService.getWorkspaceById(
      // @ts-ignore
      user.workspaceSelected.toString(),
    );
    if (!workspace) {
      throw new UnauthorizedException('Workspace not found');
    }
    //@ts-ignore
    // @ts-ignore
    const memberInfo = workspace.members.find((m) => m.user.equals(user._id));
    // @ts-ignore
    const workspaceRole = memberInfo?.role || null;
    // @ts-ignore
    const workspaceTeamRole = memberInfo?.teamRole || null;
    // @ts-ignore
    const permissions = getEffectivePermissions({
      // @ts-ignore
      role: user.role,
      // @ts-ignore
      teamRole: workspaceTeamRole,
      // @ts-ignore
      workspaceRole,
    });

    // @ts-ignore
    const payload = buildUserJwtPayload({
      user: {
        // @ts-ignore
        id: user._id.toString(),
        // @ts-ignore
        email: user.email,
        // @ts-ignore
        role: user.role,
        // @ts-ignore
        teamRole: workspaceTeamRole,
      },
      // @ts-ignore
      workspaceRole,
      // @ts-ignore
      permissions,
    });
    const token = this.jwtService.sign(payload);

    return {
      token,
      user,
    };
  }

  // NOTA: Estas funciones dependientes del servicio principal
  private async createPasswordHash(password: string): Promise<string> {
    // Esta función debería ser inyectada desde UserAuthService
    throw new Error(
      'createPasswordHash should be injected from UserAuthService',
    );
  }

  private async create(userObj: any) {
    // Esta función debería ser inyectada desde UserManagementService
    throw new Error('create should be injected from UserManagementService');
  }

  private async findById(userId: string) {
    // Esta función debería ser inyectada desde UserManagementService
    throw new Error('findById should be injected from UserManagementService');
  }

  private async findByEmail(email: string) {
    // Esta función debería ser inyectada desde UserManagementService
    throw new Error(
      'findByEmail should be injected from UserManagementService',
    );
  }
}
