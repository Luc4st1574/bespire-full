/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import {
  CreateUserInput,
  CreateUserInputByAdmin,
} from './dto/create-user.input';
import { PreRegisterClientInput } from './dto/pre-register-client.input';
import { AddClientToCompanyInput } from './dto/add-client-to-company.input';
import { EditClientInfoInput } from './dto/edit-client-info.input';
import { UpdateClientInfoInput } from './dto/update-client-info.input';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'crypto';
import { UpdateUserInput } from './dto/update-user.input';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { JwtService } from '@nestjs/jwt';
import { UpdatePreferencesInput } from './dto/update-preferences.input';
import { LoginUserInput } from './dto/login-user.input';
import { getEffectivePermissions } from 'src/auth/get-permissions.util';
import { buildUserJwtPayload } from 'src/auth/utils/buildUserJwtPayload.util';
import { InviteMemberInput } from 'src/workspace/dto/invite-member.input';
import { CompaniesService } from 'src/companies/companies.service';
import { Workspace } from 'src/workspace/schema/workspace.schema';
import { PlansService } from 'src/plans/plans.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { RequestsService } from 'src/requests/requests.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => WorkspaceService))
    private workspaceService: WorkspaceService,
    private readonly companiesService: CompaniesService,
    private readonly jwtService: JwtService,
    private readonly plansService: PlansService,
    private readonly reviewsService: ReviewsService,
    private readonly requestsService: RequestsService,
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
    const existingUser = await this.userModel.findOne({
      email: input.email,
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    // Crea un nuevo usuario con el email proporcionado
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
    const newUser = await this.create(objUserMember);
    return newUser;
  }
  async registerUserClient(input: CreateUserInput) {
    //crear password
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
    const user = await this.create(userObj);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 1. Crear la Company primero
    const companyData = {
      name: input.companyName,
      createdBy: user._id as Types.ObjectId,
    };

    const company = await this.companiesService.create(companyData);
    if (!company) {
      throw new BadRequestException('Error creating company');
    }

    // 2. Crear workspace asociado a la company
    const workspace = await this.workspaceService.createDefaultForClient(
      user,
      company._id.toString(),
      input.companyRole,
    );
    if (!workspace) {
      throw new BadRequestException('Error creating workspace');
    }

    console.log('Workspace created:', workspace);
    console.log('User created:', user);

    //ahora actualizar el workspaceSelected en user
    await this.userModel.updateOne(
      { _id: user._id },
      { workspaceSelected: workspace._id },
      { new: true },
    );

    //@ts-ignore
    const memberInfo = workspace.members.find((m) => m.user.equals(user._id));
    const workspaceRole = memberInfo?.role || null;
    const workspaceTeamRole = memberInfo?.teamRole || null;

    const permissions = getEffectivePermissions({
      role: user.role,
      teamRole: workspaceTeamRole,
      workspaceRole,
    });

    const payload = buildUserJwtPayload({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        teamRole: user.teamRole,
      },
      workspaceRole,
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
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    //buscar workspace
    if (!user.workspaceSelected) {
      throw new UnauthorizedException('User has no workspace selected');
    }

    const workspace = await this.workspaceService.getWorkspaceById(
      user.workspaceSelected.toString(),
    );
    if (!workspace) {
      throw new UnauthorizedException('Workspace not found');
    }
    //@ts-ignore
    const memberInfo = workspace.members.find((m) => m.user.equals(user._id));
    console.log('Member info:', memberInfo);
    const workspaceRole = memberInfo?.role || null;
    const workspaceTeamRole = memberInfo?.teamRole || null;
    const permissions = getEffectivePermissions({
      role: user.role,
      teamRole: workspaceTeamRole,
      workspaceRole,
    });

    const payload = buildUserJwtPayload({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        teamRole: workspaceTeamRole,
      },
      workspaceRole,
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
    const user = await this.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    //console.log('User found:', user);

    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    //buscar workspace
    if (!user.workspaceSelected) {
      throw new UnauthorizedException('User has no workspace selected');
    }

    const workspace = await this.workspaceService.getWorkspaceById(
      user.workspaceSelected.toString(),
    );
    if (!workspace) {
      throw new UnauthorizedException('Workspace not found');
    }
    //@ts-ignore
    const memberInfo = workspace.members.find((m) => m.user.equals(user._id));
    const workspaceRole = memberInfo?.role || null;
    const workspaceTeamRole = memberInfo?.teamRole || null;
    const permissions = getEffectivePermissions({
      role: user.role,
      teamRole: workspaceTeamRole,
      workspaceRole,
    });

    const payload = buildUserJwtPayload({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        teamRole: workspaceTeamRole,
      },
      workspaceRole,
      permissions,
    });
    const token = this.jwtService.sign(payload);

    return {
      token,
      user,
    };
  }

  async createPasswordHash(password: string): Promise<string> {
    if (!password || password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  }

  async create(input: any): Promise<User> {
    return this.userModel.create(input);
  }

  async createByAdmin(input: CreateUserInputByAdmin): Promise<User> {
    const passwordHash = await bcrypt.hash(input.password, 10);

    // 1. Crear usuario
    const createdUser = new this.userModel({
      email: input.email,
      passwordHash,
      role: input.role,
      // Solo asignar teamRole si es team_member
      ...(input.role === 'team_member' && input.teamRole
        ? { teamRole: input.teamRole }
        : {}),
      registrationStatus: 'completed',
      isInternalTeam: input.role === 'team_member', // opcional, si tienes este campo
    });

    await createdUser.save();

    // 2. Crear workspace SÓLO si es team_member
    let workspace = null;
    if (input.role === 'team_member') {
      workspace = await this.workspaceService.createWorkspace({
        // Ajusta los campos según tu schema/servicio:
        name: `Team Work`,
        owner: createdUser._id.toString(),
        members: [
          {
            user: createdUser._id.toString(),
            role: 'admin', // o "user", depende de tu lógica
            title: input.teamRole || 'Team Member',
            joinedAt: new Date(),
          },
        ],
        companyName: 'Team Workspace', // o el nombre que quieras
        hasPaid: true,
        onboardingCompleted: true,
        currentStep: 4,
        credits: 100,
        quickLinks: true,
        getStarted: true,
        // ...otros campos default que necesites
      });

      // 3. Actualiza el user con el workspace creado
      createdUser.workspaceSelected = workspace._id;
      await createdUser.save();
    }

    return createdUser;
  }

  // Actualiza los campos modificados, solo los que recibe en input
  async updateUser(userId: string, input: UpdateUserInput): Promise<string> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new UnauthorizedException('User not found');

      // Cambio de contraseña
      if (input.currentPassword || input.newPassword) {
        if (!input.currentPassword || !input.newPassword) {
          throw new UnauthorizedException(
            'You must provide both current and new passwords.',
          );
        }
        // Verifica que la contraseña actual es correcta
        const match = await bcrypt.compare(
          input.currentPassword,
          user.passwordHash,
        );
        if (!match)
          throw new UnauthorizedException('Current password is incorrect.');

        // Cambia la contraseña
        user.passwordHash = await bcrypt.hash(input.newPassword, 10);
      }

      // Actualiza sólo los campos que llegaron en input (patch)
      if (input.firstName !== undefined) user.firstName = input.firstName;
      if (input.lastName !== undefined) user.lastName = input.lastName;
      if (input.profilePicture !== undefined)
        user.avatarUrl = input.profilePicture;

      // Guarda los cambios
      await user.save();
      return 'User updated successfully';
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async setUserPreferences(userId: string, input: UpdatePreferencesInput) {
    console.log('setUserPreferences', userId, input);
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Mezcla las prefs viejas y las nuevas (deep merge para objetos anidados)
    user.preferences = {
      ...(user.preferences || {}),
      ...(input || {}),
      //@ts-ignore
      channels: {
        ...(user.preferences?.channels || {}),
        ...(input.channels || {}),
      },
      //@ts-ignore
      specific: {
        ...(user.preferences?.specific || {}),
        ...(input.specific || {}),
      },
    };

    await user.save();
    return true;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(query: any): Promise<User | null> {
    return this.userModel.findOne(query).exec();
  }

  async completeOnboarding(userId: string, input: any) {
    await this.userModel.findByIdAndUpdate(userId, {
      registrationStatus: 'completed',
      onboardingData: input,
    });
  }

  async updateStripeCustomerId(userId: string, customerId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      stripeCustomerId: customerId,
    });
  }

  async searchMembers(search: string) {
    return this.userModel
      .find({
        role: 'team_member',
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { teamRole: { $regex: search, $options: 'i' } },
        ],
      })
      .exec();
  }

  async getSuccessManagers() {
    // 1. Obtener el ID del admin
    const adminId = await this.findAdminId();
    if (!adminId) {
      throw new NotFoundException('Admin user not found');
    }

    // 2. Buscar el workspace del admin
    const adminUser = await this.userModel.findById(adminId);
    if (!adminUser || !adminUser.workspaceSelected) {
      throw new NotFoundException('Admin workspace not found');
    }

    const adminWorkspace = await this.workspaceService.getWorkspaceById(
      adminUser.workspaceSelected.toString(),
    );
    if (!adminWorkspace) {
      throw new NotFoundException('Admin workspace not found');
    }

    // 3. Filtrar miembros con teamRole 'success_manager' y obtener sus datos de usuario
    const successManagerMembers = adminWorkspace.members.filter(
      (member: any) => member.teamRole === 'success_manager',
    );

    // 4. Obtener los datos completos de los usuarios que son success managers
    const successManagerIds = successManagerMembers.map(
      (member: any) => member.user,
    );
    const successManagers = await this.userModel
      .find({
        _id: { $in: successManagerIds },
      })
      .exec();

    return successManagers;
  }

  async getAllClientsWithWorkspaceInfo() {
    // 1. Buscar todos los usuarios clientes que tienen workspaceSelected
    const clients = await this.userModel
      .find({ role: 'client', workspaceSelected: { $exists: true } })
      .exec();

    const clientsWithInfo = [];

    for (const client of clients) {
      if (!client.workspaceSelected) continue;

      // 2. Obtener workspace del cliente
      const workspace = await this.workspaceService.getWorkspaceById(
        client.workspaceSelected.toString(),
      );
      if (!workspace) continue;

      // 3. Obtener información de la company
      const company = await this.companiesService.findById(
        workspace.company.toString(),
      );
      if (!company) continue;

      // 4. Determinar si es owner del workspace
      const isWorkspaceOwner =
        workspace.owner.toString() === client._id.toString();

      // 5. Obtener role del usuario en el workspace
      const memberInfo = workspace.members.find(
        (m: any) => m.user.toString() === client._id.toString(),
      );

      // 6. Obtener información del success manager si existe
      let successManagerName = null;
      if (workspace.successManager) {
        const successManager = await this.userModel.findById(
          workspace.successManager,
        );
        if (successManager) {
          successManagerName =
            `${successManager.firstName || ''} ${successManager.lastName || ''}`.trim() ||
            successManager.email;
        }
      }

      clientsWithInfo.push({
        id: client._id.toString(),
        name:
          `${client.firstName || ''} ${client.lastName || ''}`.trim() ||
          client.email,
        email: client.email,
        avatarUrl: client.avatarUrl || null,
        roleTitle: memberInfo?.title || null,
        workspaceId: workspace._id.toString(),
        workspaceName: workspace.name,
        companyId: company._id.toString(),
        companyName: company.name,
        companyWebsite: company.website || null,
        companyLocation: company.location || null,
        planId: workspace.plan.toString(),
        isWorkspaceOwner,
        workspaceRole: memberInfo?.role || null,
        phoneNumber: client.contactNumber || null,
        countryCode: client.countryCode || null,
        notes: client.notes || null,
        successManagerId: workspace.successManager?.toString() || null,
        successManagerName,
      });
    }

    return clientsWithInfo;
  }

  async getClientListAdmin() {
    // 1. Buscar todos los usuarios clientes que tienen workspaceSelected
    const clients = await this.userModel
      .find({ role: 'client', workspaceSelected: { $exists: true } })
      .exec();

    const clientsWithInfo = [];

    for (const client of clients) {
      if (!client.workspaceSelected) continue;

      const workspace = await this.workspaceService.getWorkspaceById(
        client.workspaceSelected.toString(),
      );
      if (!workspace) continue;

      const company = await this.companiesService.findById(
        workspace.company.toString(),
      );
      if (!company) continue;

      const isWorkspaceOwner =
        workspace.owner.toString() === client._id.toString();

      const memberInfo = workspace.members.find(
        (m: any) => m.user.toString() === client._id.toString(),
      );

      const plan = await this.plansService.getPlanById(
        workspace.plan.toString(),
      );
      //sino tiene plan dejarlo vacio

      const planInfo = plan
        ? {
            id: plan._id.toString(),
            name: plan.name,
            price: plan.price,
            icon: plan.icon || null, // URL del icono del plan
            bg: plan.bg || null, // URL de la imagen de fondo del plan
          }
        : { id: '', name: 'No Plan', price: 0, icon: null, bg: null };
      //@ts-ignore
      const contractStart = plan ? plan.createdAt : 'N/A';

      const averageRating =
        await this.reviewsService.getAverageRatingByReviewer(
          client._id.toString(),
        );

      const timeRequest = await this.requestsService.getAverageTimePerRequest(
        client.workspaceSelected.toString(),
      );

      const revisions = await this.requestsService.getRevisionStatsByWorkspace(
        client.workspaceSelected.toString(),
      );

      //ahora el lastSession del user obtener el updatedAt del user
      const user = await this.userModel.findById(client.id);
      //@ts-ignore
      const lastSession = user && user.updatedAt ? user.updatedAt : null;

      //ahora el isNew para saber si es un cliente nuevo o recurrente, podriamos sacarlo del createdAt del user
      //@ts-ignore
      const isNew = user
        ? //@ts-ignore
          user.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : false;

      clientsWithInfo.push({
        id: client._id.toString(),
        name:
          `${client.firstName || ''} ${client.lastName || ''}`.trim() ||
          client.email,
        email: client.email,
        avatarUrl: client.avatarUrl || null,
        roleTitle: memberInfo?.title || null,
        workspaceId: workspace._id.toString(),
        workspaceName: workspace.name,
        companyId: company._id.toString(),
        companyName: company.name,
        plan: planInfo,
        rating: Math.round(averageRating * 100) / 100, // Redondear a 2 decimales
        timeRequest: `${timeRequest} hours`,
        revisions: `${revisions.avg} revisions`,
        lastSession: lastSession,
        contractStart: contractStart,
        status: isNew ? 'New' : 'Recurring',
      });
    }

    return clientsWithInfo;
  }

  async getAllClientsExtended() {
    // 1. Obtener clientes básicos
    const basicClients = await this.getAllClientsWithWorkspaceInfo();

    const extendedClients = [];

    for (const client of basicClients) {
      // 2. Obtener el plan del workspace
      if (!client.workspaceId) continue; // Si no tiene workspace, saltar

      //obtener el plan
      const plan = await this.plansService.getPlanById(client.planId);
      //sino tiene plan dejarlo vacio

      const planInfo = plan
        ? {
            id: plan._id.toString(),
            name: plan.name,
            price: plan.price,
            icon: plan.icon || null, // URL del icono del plan
            bg: plan.bg || null, // URL de la imagen de fondo del plan
          }
        : { id: '', name: 'No Plan', price: 0, icon: null, bg: null };

      //el contractStart es el createdAt del plan del workspace
      //@ts-ignore
      const contractStart = plan ? plan.createdAt : 'N/A';

      const averageRating =
        await this.reviewsService.getAverageRatingByReviewer(client.id);

      const timeRequest = await this.requestsService.getAverageTimePerRequest(
        client.workspaceId,
      );

      const revisions = await this.requestsService.getRevisionStatsByWorkspace(
        client.workspaceId,
      );

      //ahora el lastSession del user obtener el updatedAt del user
      const user = await this.userModel.findById(client.id);
      //@ts-ignore
      const lastSession = user && user.updatedAt ? user.updatedAt : null;

      //ahora el isNew para saber si es un cliente nuevo o recurrente, podriamos sacarlo del createdAt del user
      //@ts-ignore
      const isNew = user
        ? //@ts-ignore
          user.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : false;

      extendedClients.push({
        ...client,
        plan: planInfo,
        rating: Math.round(averageRating * 100) / 100, // Redondear a 2 decimales
        timeRequest: `${timeRequest} hours`,
        revisions: `${revisions.avg} revisions`,
        lastSession: lastSession,
        contractStart: contractStart,
        status: isNew ? 'New' : 'Recurring',
      });
    }

    return extendedClients;
  }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }
  async findByIdAndUpdate(
    userId: string,
    updateData: any,
  ): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
  }
  async updateOnboardingProgress(userId: string, partialData: any) {
    const { currentStep, ...onboardingFields } = partialData;

    const updateData: any = {
      $set: Object.keys(onboardingFields).reduce((acc, key) => {
        acc[`onboardingData.${key}`] = onboardingFields[key];
        return acc;
      }, {} as any),
    };

    if (currentStep !== undefined) {
      updateData.$set.currentStep = currentStep; // 👈 Guardamos currentStep al nivel raíz
    }

    await this.userModel.findByIdAndUpdate(userId, updateData);
  }

  async markUserAsPaid(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      hasPaid: true,
    });
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');

    const token = randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await this.mailService.sendResetPasswordEmail(email, resetUrl);

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return true;
  }

  //funcion find similar a model.find
  async findByQuery(query: any): Promise<User[]> {
    return this.userModel.find(query).exec();
  }

  async preRegisterClient(input: PreRegisterClientInput) {
    // Log temporal para debugging
    console.log('=== DEBUG: preRegisterClient input ===');
    console.log('isTeamMember:', input.isTeamMember);
    console.log('companyName:', input.companyName);
    console.log('email:', input.email);
    console.log('=======================================');

    // Si es un team member, usar lógica diferente
    if (input.isTeamMember) {
      return await this.addTeamMemberToWorkspace(input);
    }

    // Lógica original para pre-registrar cliente (crear nueva company)
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({
      email: input.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    //verficar que la compañia no existe
    const existingCompany = await this.companiesService.findByName(
      input.companyName,
    );
    if (existingCompany) {
      throw new BadRequestException('Company with this name already exists');
    }

    // Crear password temporal
    const passwordHash = await this.createPasswordHash('tempPassword123!');

    // Separar nombre completo en firstName y lastName
    const nameParts = input.clientName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // 1. Primero crear la Company
    const companyData = {
      name: input.companyName,
      website: input.companyWebsite || null,
      location: input.companyLocation || null,
      notes: input.notes || null,
      createdBy: null, // Se asignará después de crear el usuario
    };

    // 2. Crear objeto de usuario
    const userObj = {
      email: input.email,
      passwordHash,
      firstName,
      lastName,
      role: 'client',
      registrationStatus: 'in_progress', // Estado de pre-registro
      contactNumber: input.phoneNumber,
      countryCode: input.countryCode,
      notes: input.notes,
    };

    const user = await this.create(userObj);
    if (!user) {
      throw new BadRequestException('Error creating user');
    }

    // 3. Actualizar la company con el createdBy
    companyData.createdBy = user._id;
    const company = await this.companiesService.create(companyData);
    if (!company) {
      throw new BadRequestException('Error creating company');
    }

    // 4. Crear workspace asociado a la company
    const workspace = await this.workspaceService.createDefaultForClient(
      user,
      company._id.toString(), // Pasar el ID de la company en lugar del nombre
      input.roleTitle,
      input.successManager, // Pasar el success manager ID
    );

    if (!workspace) {
      throw new BadRequestException('Error creating workspace');
    }

    // Actualizar el workspaceSelected en user y el token
    const token = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    await this.userModel.updateOne(
      { _id: user._id },
      { workspaceSelected: workspace._id, resetToken: token, resetTokenExpiry },
    );

    // Enviar email de invitación si se solicita
    if (input.sendInvitation) {
      const invitationLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      await this.mailService.sendClientInvitation(
        user.email,
        input.clientName,
        input.companyName,
        invitationLink,
      );
    }

    return {
      success: true,
      message: 'Client pre-registered successfully',
      userId: user._id.toString(),
      companyId: company._id.toString(),
      workspaceId: workspace._id.toString(),
    };
  }

  async addTeamMemberToWorkspace(input: PreRegisterClientInput) {
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({
      email: input.email,
    });

    if (existingUser) {
      // Si el usuario ya existe, solo agregarlo al workspace
      return await this.addExistingUserToWorkspace(existingUser, input);
    }

    // Si el usuario no existe, crearlo y agregarlo al workspace
    return await this.createUserAndAddToWorkspace(input);
  }

  private async addExistingUserToWorkspace(
    existingUser: any,
    input: PreRegisterClientInput,
  ) {
    console.log('=== addExistingUserToWorkspace DEBUG ===');
    console.log('Looking for workspace with company name:', input.companyName);

    // Buscar el workspace por el nombre de la company usando populate
    const workspaces = await this.workspaceModel
      .find({})
      .populate('company')
      .exec();
    console.log('Found workspaces:', workspaces.length);

    workspaces.forEach((ws, index) => {
      console.log(`Workspace ${index}:`, {
        id: ws._id,
        name: ws.name,
        companyName: ws.company ? (ws.company as any).name : 'NO COMPANY',
      });
    });

    const workspace = workspaces.find(
      (ws) => ws.company && (ws.company as any).name === input.companyName,
    );

    if (!workspace) {
      console.log('❌ No workspace found for company:', input.companyName);
      throw new BadRequestException(
        `Workspace for company '${input.companyName}' not found`,
      );
    }

    console.log('✅ Found workspace:', workspace.name, 'ID:', workspace._id);
    console.log('=======================================');

    // Verificar si el usuario ya está en este workspace
    const isAlreadyMember = workspace.members.some(
      (member) => member.user.toString() === existingUser._id.toString(),
    );

    if (isAlreadyMember) {
      throw new BadRequestException(
        'User is already a member of this workspace',
      );
    }

    // Agregar el usuario al workspace usando MongoDB directamente
    console.log('📝 Adding existing user to workspace...', {
      workspaceId: workspace._id,
      userId: existingUser._id,
      role: input.roleTitle || 'user',
      teamRole: input.teamRole,
    });

    const updateResult = await this.workspaceModel.updateOne(
      { _id: workspace._id },
      {
        $push: {
          members: {
            user: existingUser._id,
            role: input.roleTitle || 'user',
            title: input.roleTitle,
            teamRole: input.teamRole,
            joinedAt: new Date(),
          },
        },
      },
    );

    console.log('📝 Workspace update result:', updateResult);

    // Actualizar notas del usuario si se proporcionaron
    if (input.notes) {
      await this.userModel.updateOne(
        { _id: existingUser._id },
        { notes: input.notes },
      );
    }

    // Enviar email de invitación si se solicita
    if (input.sendInvitation) {
      const invitationLink = `${process.env.FRONTEND_URL}/workspace-invitation?workspaceId=${workspace._id.toString()}`;
      await this.mailService.sendClientInvitation(
        existingUser.email,
        input.clientName,
        input.companyName,
        invitationLink,
      );
    }

    return {
      success: true,
      message: 'Existing user added to workspace successfully',
      userId: existingUser._id.toString(),
      companyId: workspace.company.toString(), // Agregar companyId del workspace
      workspaceId: workspace._id.toString(),
    };
  }

  private async createUserAndAddToWorkspace(input: PreRegisterClientInput) {
    console.log('=== createUserAndAddToWorkspace DEBUG ===');
    console.log('Looking for workspace with company name:', input.companyName);

    // Buscar el workspace por el nombre de la company usando populate
    const workspaces = await this.workspaceModel
      .find({})
      .populate('company')
      .exec();
    console.log('Found workspaces:', workspaces.length);

    workspaces.forEach((ws, index) => {
      console.log(`Workspace ${index}:`, {
        id: ws._id,
        name: ws.name,
        companyName: ws.company ? (ws.company as any).name : 'NO COMPANY',
      });
    });

    const workspace = workspaces.find(
      (ws) => ws.company && (ws.company as any).name === input.companyName,
    );

    if (!workspace) {
      console.log('❌ No workspace found for company:', input.companyName);
      throw new BadRequestException(
        `Workspace for company '${input.companyName}' not found`,
      );
    }

    console.log('✅ Found workspace:', workspace.name, 'ID:', workspace._id);
    console.log('=======================================');

    // Crear password temporal
    const passwordHash = await this.createPasswordHash('tempPassword123!');

    // Separar nombre completo en firstName y lastName
    const nameParts = input.clientName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Crear objeto de usuario
    const userObj = {
      email: input.email,
      passwordHash,
      firstName,
      lastName,
      role: 'client',
      registrationStatus: 'in_progress',
      contactNumber: input.phoneNumber,
      countryCode: input.countryCode,
      notes: input.notes,
      workspaceSelected: workspace._id,
    };

    const user = await this.create(userObj);
    if (!user) {
      throw new BadRequestException('Error creating user');
    }

    console.log('✅ User created successfully:', user._id);

    // Agregar el usuario al workspace usando MongoDB directamente
    console.log('📝 Adding user to workspace...', {
      workspaceId: workspace._id,
      userId: user._id,
      role: input.roleTitle || 'user',
      teamRole: input.teamRole,
    });

    const updateResult = await this.workspaceModel.updateOne(
      { _id: workspace._id },
      {
        $push: {
          members: {
            user: user._id,
            role: input.roleTitle || 'user',
            title: input.roleTitle,
            teamRole: input.teamRole,
            joinedAt: new Date(),
          },
        },
      },
    );

    console.log('📝 Workspace update result:', updateResult);

    // Enviar email de invitación si se solicita
    if (input.sendInvitation) {
      const invitationLink = `${process.env.FRONTEND_URL}/complete-registration?token=${user._id.toString()}`;
      await this.mailService.sendClientInvitation(
        user.email,
        input.clientName,
        input.companyName,
        invitationLink,
      );
    }

    return {
      success: true,
      message: 'Team member created and added to workspace successfully',
      userId: user._id.toString(),
      companyId: workspace.company.toString(), // Agregar companyId del workspace
      workspaceId: workspace._id.toString(),
    };
  }

  async addClientToCompany(input: AddClientToCompanyInput) {
    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({
      email: input.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Verificar que el workspace existe
    const workspace = await this.workspaceService.getWorkspaceById(
      input.workspaceId,
    );
    if (!workspace) {
      throw new BadRequestException('Workspace not found');
    }

    // Crear password temporal
    const passwordHash = await this.createPasswordHash('tempPassword123!');

    // Separar nombre completo en firstName y lastName
    const nameParts = input.clientName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Crear objeto de usuario
    const userObj = {
      email: input.email,
      passwordHash,
      firstName,
      lastName,
      role: 'client',
      registrationStatus: 'in_progress', // Estado de pre-registro
      workspaceSelected: new Types.ObjectId(input.workspaceId),
    };

    const user = await this.create(userObj);
    if (!user) {
      throw new BadRequestException('Error creating user');
    }

    // Agregar el usuario como miembro del workspace existente
    // TODO: Implementar addMemberToWorkspace en WorkspaceService
    // await this.workspaceService.addMemberToWorkspace(input.workspaceId, {
    //   userId: user._id.toString(),
    //   role: 'user', // Role por defecto para clientes agregados
    //   title: input.roleTitle,
    //   teamRole: null,
    // });

    // TODO: Enviar email de invitación si se solicita
    // if (input.sendInvitation) {
    //   await this.mailService.sendClientInvitation({
    //     email: user.email,
    //     clientName: input.clientName,
    //     workspaceName: workspace.name,
    //     invitationLink: `${process.env.FRONTEND_URL}/complete-registration?token=${user._id}`,
    //   });
    // }

    return {
      success: true,
      message: 'Client added to company successfully',
      userId: user._id.toString(),
      workspaceId: input.workspaceId,
    };
  }

  async editClientInfo(input: EditClientInfoInput) {
    // Buscar el usuario
    const user = await this.userModel.findById(input.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Buscar el workspace del usuario para obtener la company
    const workspace = await this.workspaceService.getWorkspaceById(
      user.workspaceSelected?.toString(),
    );
    if (!workspace) {
      throw new BadRequestException('User workspace not found');
    }

    // Actualizar datos del usuario si se proporcionan
    const userUpdates: any = {};

    if (input.email) {
      // Verificar que el nuevo email no esté en uso por otro usuario
      const existingUser = await this.userModel.findOne({
        email: input.email,
        _id: { $ne: input.userId },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use by another user');
      }
      userUpdates.email = input.email;
    }

    if (input.clientName) {
      const nameParts = input.clientName.trim().split(' ');
      userUpdates.firstName = nameParts[0];
      userUpdates.lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }

    // Actualizar usuario si hay cambios
    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(input.userId, userUpdates);
    }

    // Actualizar información de la company si se proporciona
    const companyUpdates: any = {};

    if (input.companyName) companyUpdates.name = input.companyName;
    if (input.companyWebsite) companyUpdates.website = input.companyWebsite;
    if (input.companyLocation) companyUpdates.location = input.companyLocation;
    if (input.notes) companyUpdates.notes = input.notes;

    // Actualizar company si hay cambios
    if (Object.keys(companyUpdates).length > 0) {
      await this.companiesService.update(
        workspace.company.toString(),
        companyUpdates,
      );
    }

    // Actualizar role/title en el workspace si se proporciona
    // TODO: Implementar updateMemberTitle en WorkspaceService
    // if (input.roleTitle) {
    //   await this.workspaceService.updateMemberTitle(
    //     workspace._id.toString(),
    //     input.userId,
    //     input.roleTitle
    //   );
    // }

    // TODO: Actualizar Success Manager si se proporciona
    // if (input.successManager) {
    //   await this.workspaceService.updateSuccessManager(
    //     workspace._id.toString(),
    //     input.successManager
    //   );
    // }

    return {
      success: true,
      message: 'Client information updated successfully',
      userId: input.userId,
      companyId: workspace.company.toString(),
      workspaceId: workspace._id.toString(),
    };
  }

  async updateClientInfo(input: UpdateClientInfoInput) {
    console.log('updateClientInfo input:', input);
    // 1. Buscar el cliente
    const client = await this.userModel.findById(input.clientId);
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // 2. Obtener workspace del cliente
    const workspace = await this.workspaceService.getWorkspaceById(
      client.workspaceSelected?.toString(),
    );
    if (!workspace) {
      throw new BadRequestException('Client workspace not found');
    }

    // 3. Determinar si es owner del workspace
    const isWorkspaceOwner =
      workspace.owner.toString() === client._id.toString();

    // 4. Actualizar datos del usuario si se proporcionan
    const userUpdates: any = {};

    if (input.email) {
      // Verificar que el nuevo email no esté en uso por otro usuario
      const existingUser = await this.userModel.findOne({
        email: input.email,
        _id: { $ne: input.clientId },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use by another user');
      }
      userUpdates.email = input.email;
    }

    if (input.clientName) {
      const nameParts = input.clientName.trim().split(' ');
      userUpdates.firstName = nameParts[0];
      userUpdates.lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }

    if (input.phoneNumber !== undefined) {
      userUpdates.contactNumber = input.phoneNumber;
    }

    if (input.countryCode !== undefined) {
      userUpdates.countryCode = input.countryCode;
    }

    if (input.notes !== undefined) {
      userUpdates.notes = input.notes;
    }

    // Actualizar usuario si hay cambios
    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(input.clientId, userUpdates);
    }

    // 5. Si es owner del workspace, puede actualizar datos de la company
    if (isWorkspaceOwner && workspace.company) {
      const companyUpdates: any = {};

      if (input.companyName) companyUpdates.name = input.companyName;
      if (input.companyWebsite !== undefined)
        companyUpdates.website = input.companyWebsite;
      if (input.companyLocation !== undefined)
        companyUpdates.location = input.companyLocation;
      if (input.notes !== undefined) companyUpdates.notes = input.notes;

      // Actualizar company si hay cambios
      if (Object.keys(companyUpdates).length > 0) {
        await this.companiesService.update(
          workspace.company.toString(),
          companyUpdates,
        );
      }
    }

    // 6. Actualizar información del workspace (role, success manager)
    const workspaceUpdates: any = {};

    // Actualizar success manager si se proporciona
    if (input.successManager !== undefined) {
      workspaceUpdates.successManager = input.successManager
        ? new Types.ObjectId(input.successManager)
        : null;
    }

    // Actualizar workspace si hay cambios
    if (Object.keys(workspaceUpdates).length > 0) {
      await this.workspaceService.updateWorkspaceById(
        workspace._id.toString(),
        workspaceUpdates,
      );
    }

    // 7. Actualizar role del miembro en el workspace si se proporciona
    if (input.workspaceRole || input.roleTitle) {
      const memberIndex = workspace.members.findIndex(
        (m: any) => m.user.toString() === client._id.toString(),
      );

      if (memberIndex !== -1) {
        const memberUpdates: any = {};

        if (input.workspaceRole) {
          memberUpdates[`members.${memberIndex}.role`] = input.workspaceRole;
        }

        if (input.roleTitle) {
          memberUpdates[`members.${memberIndex}.title`] = input.roleTitle;
        }

        if (Object.keys(memberUpdates).length > 0) {
          await this.workspaceService.updateWorkspaceById(
            workspace._id.toString(),
            memberUpdates,
          );
        }
      }
    }

    // 8. Enviar email de confirmación si se solicita
    if (input.sendConfirmation) {
      const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
      const clientName =
        `${client.firstName || ''} ${client.lastName || ''}`.trim() ||
        client.email;
      const companyName = workspace.company
        ? (await this.companiesService.findById(workspace.company.toString()))
            ?.name || workspace.name
        : workspace.name;

      await this.mailService.sendClientUpdateConfirmation(
        client.email,
        clientName,
        companyName,
        dashboardLink,
      );
    }

    return {
      success: true,
      message: 'Client information updated successfully',
      clientId: input.clientId,
      workspaceId: workspace._id.toString(),
      companyId: workspace.company?.toString() || null,
    };
  }

  async getClientById(id: string) {
    // Buscar usuario
    const client = await this.userModel.findById(id).exec();
    if (!client) return null;

    if (!client.workspaceSelected) return null;

    const workspace = await this.workspaceService.getWorkspaceById(
      client.workspaceSelected.toString(),
    );
    if (!workspace) return null;

    const company = await this.companiesService.findById(
      workspace.company.toString(),
    );

    const memberInfo = workspace.members.find(
      (m: any) => m.user.toString() === client._id.toString(),
    );

    const plan = workspace.plan
      ? await this.plansService.getPlanById(workspace.plan.toString())
      : null;

    const planInfo = plan
      ? {
          name: plan.name,
          icon: plan.icon || null,
          bg: plan.bg || null,
        }
      : null;

    //@ts-ignore
    const contractStart = plan ? plan.createdAt : null;

    // contractRenew si manejan renovaciones en workspace.planEndsAt
    const contractRenew = workspace.planEndsAt || null;

    // success manager nombre o id
    let successManager = null;
    if (workspace.successManager) {
      const sm = await this.userModel.findById(workspace.successManager);
      if (sm)
        successManager =
          `${sm.firstName || ''} ${sm.lastName || ''}`.trim() || sm.email;
    }
    const companyData = company;
    companyData._id = company ? company._id.toString() : null;

    return {
      id: client._id.toString(),
      name:
        `${client.firstName || ''} ${client.lastName || ''}`.trim() ||
        client.email,
      email: client.email,
      phone: company?.contactNumber || null,
      website: company?.website || null,
      location: company?.location || null,
      timezone: client.preferences?.timezone || null,
      role: memberInfo?.role || client.role,
      organization: company?.name || null,
      plan: planInfo,
      contractStart: contractStart,
      contractRenew: contractRenew,
      successManager,
      companyId: company ? company._id.toString() : null,
      companyData: companyData,
    };
  }

  //necesito un servicio para obtener el id del admin
  async findAdminId(): Promise<string | null> {
    const adminUser = await this.userModel.findOne({ role: 'admin' }).exec();
    return adminUser ? adminUser._id.toString() : null;
  }
}
