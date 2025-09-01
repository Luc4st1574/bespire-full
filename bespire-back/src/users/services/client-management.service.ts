import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { CompaniesService } from 'src/companies/companies.service';
import { PlansService } from 'src/plans/plans.service';
import { ReviewsService } from 'src/reviews/reviews.service';
import { RequestsService } from 'src/requests/requests.service';

@Injectable()
export class ClientManagementService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private workspaceService: WorkspaceService,
    private readonly companiesService: CompaniesService,
    private readonly plansService: PlansService,
    private readonly reviewsService: ReviewsService,
    private readonly requestsService: RequestsService,
  ) {}

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

  //necesito un servicio para obtener el id del admin
  async findAdminId(): Promise<string | null> {
    const adminUser = await this.userModel.findOne({ role: 'admin' }).exec();
    return adminUser ? adminUser._id.toString() : null;
  }
}
