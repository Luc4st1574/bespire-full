import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { PreRegisterClientInput } from '../dto/pre-register-client.input';
import { AddClientToCompanyInput } from '../dto/add-client-to-company.input';
import { EditClientInfoInput } from '../dto/edit-client-info.input';
import { UpdateClientInfoInput } from '../dto/update-client-info.input';
import { MailService } from 'src/mail/mail.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { CompaniesService } from 'src/companies/companies.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CompanyManagementService {
  constructor(
    // @ts-ignore
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailService: MailService,
    // @ts-ignore
    private workspaceService: WorkspaceService,
    // @ts-ignore
    private readonly companiesService: CompaniesService,
  ) {}

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
    // @ts-ignore
    const existingUser = await this.userModel.findOne({
      email: input.email,
    });
    if (existingUser) {
      // @ts-ignore
      throw new BadRequestException('User with this email already exists');
    }

    //verficar que la compañia no existe
    // @ts-ignore
    const existingCompany = await this.companiesService.findByName(
      input.companyName,
    );
    if (existingCompany) {
      // @ts-ignore
      throw new BadRequestException('Company with this name already exists');
    }

    // Crear password temporal
    // @ts-ignore
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
      // @ts-ignore
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

    // @ts-ignore
    const user = await this.create(userObj);
    // @ts-ignore
    if (!user) {
      // @ts-ignore
      throw new BadRequestException('Error creating user');
    }

    // 3. Actualizar la company con el createdBy
    // @ts-ignore
    companyData.createdBy = user._id;
    // @ts-ignore
    const company = await this.companiesService.create(companyData);
    // @ts-ignore
    if (!company) {
      throw new BadRequestException('Error creating company');
    }

    // 4. Crear workspace asociado a la company
    // @ts-ignore
    const workspace = await this.workspaceService.createDefaultForClient(
      user,
      company._id.toString(), // Pasar el ID de la company en lugar del nombre
      input.roleTitle,
      input.successManager, // Pasar el success manager ID
    );

    // @ts-ignore
    if (!workspace) {
      throw new BadRequestException('Error creating workspace');
    }

    // Actualizar el workspaceSelected en user y el token
    const token = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    // @ts-ignore
    await this.userModel.updateOne(
      // @ts-ignore
      { _id: user._id },
      // @ts-ignore
      { workspaceSelected: workspace._id, resetToken: token, resetTokenExpiry },
    );

    // Enviar email de invitación si se solicita
    if (input.sendInvitation) {
      const invitationLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
      // @ts-ignore
      await this.mailService.sendClientInvitation(
        // @ts-ignore
        user.email,
        input.clientName,
        input.companyName,
        invitationLink,
      );
    }

    return {
      success: true,
      message: 'Client pre-registered successfully',
      // @ts-ignore
      userId: user._id.toString(),
      // @ts-ignore
      companyId: company._id.toString(),
      // @ts-ignore
      workspaceId: workspace._id.toString(),
    };
  }

  async addClientToCompany(input: AddClientToCompanyInput) {
    // Verificar si el usuario ya existe
    // @ts-ignore
    const existingUser = await this.userModel.findOne({
      email: input.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Verificar que el workspace existe
    // @ts-ignore
    const workspace = await this.workspaceService.getWorkspaceById(
      input.workspaceId,
    );
    if (!workspace) {
      throw new BadRequestException('Workspace not found');
    }

    // Crear password temporal
    // @ts-ignore
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

    // @ts-ignore
    const user = await this.create(userObj);
    // @ts-ignore
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
      // @ts-ignore
      userId: user._id.toString(),
      workspaceId: input.workspaceId,
    };
  }

  async editClientInfo(input: EditClientInfoInput) {
    // Buscar el usuario
    // @ts-ignore
    const user = await this.userModel.findById(input.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Buscar el workspace del usuario para obtener la company
    // @ts-ignore
    const workspace = await this.workspaceService.getWorkspaceById(
      // @ts-ignore
      user.workspaceSelected?.toString(),
    );
    if (!workspace) {
      throw new BadRequestException('User workspace not found');
    }

    // Actualizar datos del usuario si se proporcionan
    const userUpdates: any = {};

    if (input.email) {
      // Verificar que el nuevo email no esté en uso por otro usuario
      // @ts-ignore
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
      // @ts-ignore
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
      // @ts-ignore
      await this.companiesService.update(
        // @ts-ignore
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
      // @ts-ignore
      companyId: workspace.company.toString(),
      // @ts-ignore
      workspaceId: workspace._id.toString(),
    };
  }

  async updateClientInfo(input: UpdateClientInfoInput) {
    console.log('updateClientInfo input:', input);
    // 1. Buscar el cliente
    // @ts-ignore
    const client = await this.userModel.findById(input.clientId);
    if (!client) {
      throw new BadRequestException('Client not found');
    }

    // 2. Obtener workspace del cliente
    // @ts-ignore
    const workspace = await this.workspaceService.getWorkspaceById(
      // @ts-ignore
      client.workspaceSelected?.toString(),
    );
    if (!workspace) {
      throw new BadRequestException('Client workspace not found');
    }

    // 3. Determinar si es owner del workspace
    // @ts-ignore
    const isWorkspaceOwner =
      // @ts-ignore
      workspace.owner.toString() === client._id.toString();

    // 4. Actualizar datos del usuario si se proporcionan
    const userUpdates: any = {};

    if (input.email) {
      // Verificar que el nuevo email no esté en uso por otro usuario
      // @ts-ignore
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
      // @ts-ignore
      await this.userModel.findByIdAndUpdate(input.clientId, userUpdates);
    }

    // 5. Si es owner del workspace, puede actualizar datos de la company
    // @ts-ignore
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
        // @ts-ignore
        await this.companiesService.update(
          // @ts-ignore
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
      // @ts-ignore
      await this.workspaceService.updateWorkspaceById(
        // @ts-ignore
        workspace._id.toString(),
        workspaceUpdates,
      );
    }

    // 7. Actualizar role del miembro en el workspace si se proporciona
    if (input.workspaceRole || input.roleTitle) {
      // @ts-ignore
      const memberIndex = workspace.members.findIndex(
        // @ts-ignore
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
          // @ts-ignore
          await this.workspaceService.updateWorkspaceById(
            // @ts-ignore
            workspace._id.toString(),
            memberUpdates,
          );
        }
      }
    }

    // 8. Enviar email de confirmación si se solicita
    if (input.sendConfirmation) {
      const dashboardLink = `${process.env.FRONTEND_URL}/dashboard`;
      // @ts-ignore
      const clientName =
        // @ts-ignore
        `${client.firstName || ''} ${client.lastName || ''}`.trim() ||
        // @ts-ignore
        client.email;
      // @ts-ignore
      const companyName = workspace.company
        ? // @ts-ignore
          (await this.companiesService.findById(workspace.company.toString()))
            ?.name || workspace.name
        : // @ts-ignore
          workspace.name;

      // @ts-ignore
      await this.mailService.sendClientUpdateConfirmation(
        // @ts-ignore
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
      // @ts-ignore
      workspaceId: workspace._id.toString(),
      // @ts-ignore
      companyId: workspace.company?.toString() || null,
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

  private async addTeamMemberToWorkspace(input: PreRegisterClientInput) {
    // Esta función debería ser inyectada desde TeamManagementService
    throw new Error(
      'addTeamMemberToWorkspace should be injected from TeamManagementService',
    );
  }
}
