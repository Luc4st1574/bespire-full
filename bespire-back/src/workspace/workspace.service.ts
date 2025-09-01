/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Workspace } from './schema/workspace.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { UpdateWorkspaceCompanyInput } from './dto/update-workspace-company.input';
import { UsersService } from 'src/users/users.service';
import { InviteMemberInput } from './dto/invite-member.input';
import { UpdateMemberRoleInput } from './dto/update-member-role.input';
import { title } from 'process';
import { WorkspaceBasic } from './entities/workspace.entity';
import { randomBytes } from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { WorkspaceMemberDto } from './dto/workspace-member.dto';
import { WorkspaceCompanyQuery } from './dto/workspace.dto';
import { UpdateWorkspaceSettingsInput } from './dto/update-workspace-settings.input';
import Stripe from 'stripe';
import { InvoiceDto, WorkspaceBillingDto } from './dto/billing.dto';
import { PlansService } from 'src/plans/plans.service';
import { PlanCancellationService } from 'src/plan-cancellation/plan-cancellation.service';
import { CancelPlanInput } from './dto/cancel-plan.input';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { AssigneeService } from 'src/assignee/assignee.service';
import { UserAssigned } from 'src/requests/entities/request.entity';
import { AssignSuccessManagerInput } from './dto/assign-success-manager.input';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class WorkspaceService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY2, {
    apiVersion: '2025-03-31.basil',
  });
  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<Workspace>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private readonly mailService: MailService,
    private readonly plansService: PlansService,
    private readonly planCancellationService: PlanCancellationService,
    private readonly assigneesService: AssigneeService,
    private readonly notificationsService: NotificationsService,
    private readonly companiesService: CompaniesService,
  ) {}

  //funcion find que haga lo mismo
  async find(
    query: Record<string, any>,
    populate?: string,
  ): Promise<Workspace[]> {
    const options: any = {};
    if (populate) {
      options.populate = populate;
    }
    return this.workspaceModel.find(query, null, options);
  }

  async findByIdAndUpdate(
    workspaceId: string,
    updateData: Partial<Workspace>,
  ): Promise<Workspace> {
    const workspace = await this.workspaceModel.findByIdAndUpdate(
      workspaceId,
      updateData,
      { new: true, runValidators: true },
    );
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }

  async getMembersWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberDto[]> {
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .populate('members.user', '_id firstName lastName email avatarUrl');

    if (!workspace) throw new NotFoundException('Workspace not found');

    // Validar que el usuario sea owner o miembro del workspace
    const isMember = workspace.members.some((m) => m.user.equals(userId));
    if (workspace.owner.toString() !== userId && !isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
    //retornar lista de miembros con datos básicos
    return workspace.members.map((member) => {
      return {
        _id: member.user._id.toString(),
        role: member.role,
        //@ts-ignore
        firstName: member.user.firstName || '',
        //@ts-ignore
        lastName: member.user.lastName || '',
        // @ts-ignore
        email: member.user.email,
        // @ts-ignore
        avatarUrl: member.user.avatarUrl || '',
        title: member.title || '', // Título del miembro (ej: 'Gerente de Marketing')
        teamRole: member.teamRole || '', // Rol del miembro en el equipo (ej: 'Marketing', 'Desarrollo', etc)
        joinedAt: member.joinedAt,
      };
    });
  }

  async createDefaultForClient(
    user: User,
    companyId: string,
    companyRole: string,
    successManagerId?: string,
  ): Promise<Workspace> {
    // Nombre por defecto puede ser el nombre de la empresa o el email
    const workspaceName = user.email.split('@')[0] || 'My Workspace';

    // Crea el workspace con el usuario como owner y miembro admin
    const workspace = new this.workspaceModel({
      name: workspaceName,
      owner: user._id,
      company: new Types.ObjectId(companyId), // Asociar con la company
      successManager: successManagerId
        ? new Types.ObjectId(successManagerId)
        : null,
      members: [
        {
          user: user._id,
          role: 'admin',
          title: companyRole || 'Workspace Owner',
          joinedAt: new Date(),
        },
      ],
    });

    await workspace.save();

    return workspace;
  }

  /**
   * Actualiza los datos de empresa del workspace.
   * @param workspaceId ID del workspace a actualizar
   * @param input Datos a actualizar (parcial)
   * @param userId (opcional) Si quieres validar que el user sea owner/admin
   */
  async updateCompanyData(
    workspaceId: string,
    input: UpdateWorkspaceCompanyInput,
    userId?: string,
  ): Promise<string> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // Opcional: Validar permisos solo owner o successManager pueden editar
    if (
      userId &&
      workspace.owner.toString() !== userId &&
      (!workspace.successManager ||
        workspace.successManager.toString() !== userId)
    ) {
      throw new ForbiddenException(
        'No permission to update workspace company info',
      );
    }

    // Solo actualiza los campos enviados (patch)
    Object.keys(input).forEach((key) => {
      if (input[key] !== undefined) {
        workspace[key] = input[key];
      }
    });

    await workspace.save();
    return 'Workspace updated successfully';
  }

  async checkMemberExist(workspaceId: string, email: string): Promise<boolean> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const user = await this.usersService.findOne({ email: email });
    if (!user) throw new NotFoundException('User not found');
    const userIdMember = user._id.toString();

    return workspace.members.some((member) => {
      return member.user.toString() === userIdMember;
    });
  }

  // 1. Invitar miembro (crear si no existe, si existe solo agregarlo, enviar email)
  async inviteMember(
    workspaceId: string,
    input: InviteMemberInput,
    userId: string, // El userId del que está invitando
  ): Promise<string> {
    console.log('Inviting member:', workspaceId, input, userId);
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .populate('owner', '_id firstName lastName email avatarUrl');

    if (!workspace) throw new NotFoundException('Workspace not found');

    // Validar que el usuario sea owner o successManager
    // Permitir que el owner o un admin puedan invitar miembros
    const isAdmin = workspace.members.some(
      (m) => m.user.equals(userId) && m.role === 'admin',
    );
    if (workspace.owner._id.toString() !== userId && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to invite members',
      );
    }

    let user = await this.usersService.findOne({ email: input.email });

    // Si no existe, buscar por email

    // Si ya es miembro, error
    if (
      user &&
      workspace.members.some((m) => m.user.equals(user._id.toString()))
    ) {
      throw new ConflictException('User is already a member');
    }

    if (!user) {
      // Crear user básico (sin password, status pending)
      user = await this.usersService.createNewUserMemberInvited(
        input,
        workspaceId,
      );
      if (!user) {
        throw new BadRequestException('Error creating user');
      }

      // Obtener el nombre de la company asociada
      let companyName = '';
      if (workspace.company) {
        try {
          const company = await this.companiesService.findById(
            workspace.company.toString(),
          );
          companyName = company?.name || '';
        } catch (error) {
          console.warn('Error fetching company:', error);
        }
      }

      // Enviar email de invitación
      await this.SendActivateLink(
        input.email,
        companyName ||
          //@ts-ignore
          workspace.owner.firstName + ' ' + workspace.owner.lastName,
      );
    }

    // Agregar como miembro del workspace
    workspace.members.push({
      user: new Types.ObjectId(user._id.toString()),
      role: input.role,
      title: input.title || '',
      teamRole: input.teamRole || '', // Rol del miembro en el equipo (ej: 'Marketing', 'Desarrollo', etc)
      joinedAt: new Date(),
    });

    await workspace.save();

    return 'User invited successfully';
  }

  async SendActivateLink(email: string, companyName: string): Promise<boolean> {
    const user = await this.usersService.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    const token = randomBytes(32).toString('hex');
    user.resetToken = token;
    // Establecer la expiración del token a 24 horas
    user.resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await this.mailService.sendInvitedNewUserToWorkspace(
      email,
      resetUrl,
      companyName,
    );

    return true;
  }

  // workspace.service.ts
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: 'admin' | 'user' | 'viewer',
    requesterId: string,
  ) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    // Permitir que el owner o un admin puedan cambiar el rol de un miembro
    const isAdmin = workspace.members.some(
      (m) => m.user.equals(requesterId) && m.role === 'admin',
    );
    if (!workspace.owner.equals(requesterId) && !isAdmin)
      throw new ForbiddenException('Not authorized');
    const member = workspace.members.find((m) => m.user.equals(memberId));
    if (!member) throw new NotFoundException('Member not found');
    member.role = role;
    await workspace.save();
    return true;
  }

  async findWorkspaceBasicById(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceBasic> {
    console.log('Fetching workspace basic info for:', workspaceId, userId);
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .populate('owner', '_id firstName lastName email avatarUrl');
    if (!workspace) throw new NotFoundException('Workspace not found');
    // Validar que el usuario sea owner o miembro del workspace
    const isMember = workspace.members.some((m) => m.user.equals(userId));
    if (workspace.owner.toString() !== userId && !isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    let plan = null;
    if (workspace.plan) {
      plan = await this.plansService.getPlanById(workspace.plan.toString());
    }
    // Si no hay plan, usar el nombre por defecto
    const planName = plan ? plan.name : '';

    // Obtener datos de la company asociada
    let company = null;
    if (workspace.company) {
      try {
        company = await this.companiesService.findById(
          workspace.company.toString(),
        );
      } catch (error) {
        console.warn('Error fetching company:', error);
      }
    }

    // Retornar solo los campos básicos
    return {
      _id: workspace._id.toString(),
      name: workspace.name,
      //@ts-ignore
      owner: workspace.owner,
      successManager: workspace.successManager?.toString() || null,
      pointOfContact: workspace.pointOfContact?.toString() || null,
      focusAreas: workspace.focusAreas || [],
      currentStep: workspace.currentStep,
      onboardingCompleted: workspace.onboardingCompleted,
      companyName: company?.name || '',
      companyImg: company?.logoUrl || '',
      companyWebsite: company?.website || '',
      companyIndustry: company?.industry || '',
      companySize: company?.size || '',
      location: company?.location || '',
      brandArchetype: company?.brandArchetype || '',
      communicationStyle: company?.communicationStyle || '',
      elevatorPitch: company?.elevatorPitch || '',
      mission: company?.mission || '',
      vision: company?.vision || '',
      valuePropositions: company?.valuePropositions || '',
      hasPaid: workspace.hasPaid || false,
      defaultRequestsView: workspace.defaultRequestsView || '',
      quickLinks: workspace.quickLinks ?? true,
      getStarted: workspace.getStarted ?? true,
      plan: planName,
      planCancelPending: workspace.planCancelPending || false,
      planEndsAt: workspace.planEndsAt || null,
    };
  }

  async updateFocusAreas(
    workspaceId: string,
    focusAreas: string[],
    userId: string,
  ): Promise<string> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    // Validar que el usuario sea owner o successManager
    if (
      workspace.owner.toString() !== userId &&
      (!workspace.successManager ||
        workspace.successManager.toString() !== userId)
    ) {
      throw new ForbiddenException(
        'You do not have permission to update focus areas',
      );
    }
    workspace.focusAreas = focusAreas;
    await workspace.save();
    return 'Focus areas updated successfully';
  }

  async updateCurrentStep(
    workspaceId: string,
    step: number,
    userId: string,
  ): Promise<string> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    // Validar que el usuario sea owner o successManager
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update current step',
      );
    }
    if (step < 1 || step > 5) {
      throw new BadRequestException('Step must be between 1 and 5');
    }
    workspace.currentStep = step;
    await workspace.save();
    return 'Current step updated successfully';
  }

  //get company data by workspace ID
  async getCompanyDataByWorkspaceId(
    workspaceId: string,
  ): Promise<WorkspaceCompanyQuery> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // Obtener datos de la company asociada
    let company = null;
    if (workspace.company) {
      try {
        company = await this.companiesService.findById(
          workspace.company.toString(),
        );
      } catch (error) {
        console.warn('Error fetching company:', error);
      }
    }

    // Retornar los datos de la empresa
    return {
      companyName: company?.name || '',
      companyImg: company?.logoUrl || '',
      companyWebsite: company?.website || '',
      companyIndustry: company?.industry || '',
      companySize: company?.size || '',
      location: company?.location || '',
      brandArchetype: company?.brandArchetype || '',
      communicationStyle: company?.communicationStyle || '',
      elevatorPitch: company?.elevatorPitch || '',
      mission: company?.mission || '',
      vision: company?.vision || '',
      valuePropositions: company?.valuePropositions || '',
    };
  }

  async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async updateWorkspaceById(
    workspaceId: string,
    updateData: any,
  ): Promise<Workspace | null> {
    return this.workspaceModel
      .findByIdAndUpdate(workspaceId, updateData, { new: true })
      .exec();
  }

  async updateWorkspaceSettings(
    workspaceId: string,
    input: UpdateWorkspaceSettingsInput,
    userId: string,
  ) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // Permisos: solo owner/admin/manager pueden editar
    if (workspace.owner.toString() !== userId) {
      throw new ForbiddenException('No permission');
    }

    // Aplica solo los campos permitidos
    if (input.workspaceName !== undefined) workspace.name = input.workspaceName; // Actualizar el nombre del workspace, no company
    if (input.defaultRequestsView !== undefined)
      workspace.defaultRequestsView = input.defaultRequestsView;
    if (input.quickLinks !== undefined) workspace.quickLinks = input.quickLinks;
    if (input.getStarted !== undefined) workspace.getStarted = input.getStarted;

    await workspace.save();
    return 'Workspace settings updated successfully';
  }

  async removeMember(
    workspaceId: string,
    memberId: string,
    requesterId: string,
  ) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    // Solo owner o admin puede quitar
    // Permitir que el owner o un admin puedan quitar miembros
    const isAdmin = workspace.members.some(
      (m) => m.user.equals(requesterId) && m.role === 'admin',
    );
    if (!workspace.owner.equals(requesterId) && !isAdmin)
      throw new ForbiddenException('Not authorized');
    // No se puede quitar al owner
    if (workspace.owner.equals(memberId))
      throw new BadRequestException('Cannot remove the owner');
    workspace.members = workspace.members.filter(
      (m) => !m.user.equals(memberId),
    );
    await workspace.save();
    return true;
  }
  //billing
  async getBillingInfo(workspaceId: string): Promise<WorkspaceBillingDto> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');

    let paymentMethod = null;
    if (workspace.stripeCustomerId) {
      // 1. Intenta obtener el payment method predeterminado
      const customer = (await this.stripe.customers.retrieve(
        workspace.stripeCustomerId,
      )) as Stripe.Customer;

      let defaultPaymentMethodId = (customer.invoice_settings
        ?.default_payment_method || '') as string;
      if (!defaultPaymentMethodId && (customer.default_source as string)) {
        defaultPaymentMethodId = customer.default_source as string;
      }

      let pm: any = null;
      if (defaultPaymentMethodId) {
        try {
          // eslint-disable-next-line prettier/prettier
          pm = await this.stripe.paymentMethods.retrieve(
            defaultPaymentMethodId,
          );
        } catch (e) {}
      }

      // 2. Si no hay default PM, busca el primero adjunto
      if (!pm) {
        const pms = await this.stripe.paymentMethods.list({
          customer: workspace.stripeCustomerId,
          type: 'card',
          limit: 1,
        });
        if (pms.data.length > 0) {
          pm = pms.data[0];
        }
      }

      // 3. Extrae la info si existe
      if (pm && pm.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
        };
      }
    }

    //conseguir el nombre del plan
    const plan = workspace.plan
      ? await this.plansService.getPlanById(workspace.plan.toString())
      : null;

    // Simulación de fields para la UI (ajusta según tu modelo real)
    return {
      name: workspace.name,
      currentPlan: plan ? plan.name : 'Started',
      creditUsage: `${workspace.credits}/${plan.creditsPerMonth}`, // Simula el usage, ajústalo según tus reglas
      hasPaid: workspace.hasPaid,
      stripeCustomerId: workspace.stripeCustomerId,
      paymentMethod,
    };
  }

  // B. Traer invoices desde Stripe
  async getInvoices(workspaceId: string): Promise<InvoiceDto[]> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace || !workspace.stripeCustomerId) return [];

    const invoices = await this.stripe.invoices.list({
      customer: workspace.stripeCustomerId,
      limit: 24,
    });

    const plan = workspace.plan
      ? await this.plansService.getPlanById(workspace.plan.toString())
      : null;

    console.log('Invoices from Stripe:', invoices);

    return invoices.data.map((inv) => ({
      id: inv.id,
      date: new Date(inv.created * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      amount: `$${(inv.amount_paid / 100).toLocaleString()}`,
      status:
        inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1) || 'Unknown',
      pdfUrl: inv.invoice_pdf || '',
      plan: inv.lines.data[0]?.description || plan.name,
    }));
  }

  // C. Portal de cliente de Stripe
  async createCustomerPortalSession(workspaceId: string): Promise<string> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace || !workspace.stripeCustomerId)
      throw new NotFoundException('Workspace or Stripe customer not found');

    const session = await this.stripe.billingPortal.sessions.create({
      customer: workspace.stripeCustomerId,
      return_url:
        process.env.FRONTEND_URL + '/settings' ||
        'http://localhost:3000/dashboard/settings', // Cambia al return de tu app
    });
    return session.url;
  }

  async updateDefaultCard(workspaceId: string, paymentMethodId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace?.stripeCustomerId)
      throw new NotFoundException('No Stripe customer.');
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: workspace.stripeCustomerId,
    });
    await this.stripe.customers.update(workspace.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    return true;
  }

  async createSetupIntentByWorkspace(workspaceId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace?.stripeCustomerId)
      throw new NotFoundException('No Stripe customer');
    const { clientSecret } = await this.createSetupIntent(
      workspace.stripeCustomerId,
    );
    return clientSecret;
  }

  async createSetupIntent(stripeCustomerId: string) {
    const intent = await this.stripe.setupIntents.create({
      customer: stripeCustomerId,
      usage: 'off_session', // recomendado para pagos futuros
    });
    return { clientSecret: intent.client_secret };
  }

  async cancelWorkspacePlan(
    input: CancelPlanInput,
    userId: string,
  ): Promise<void> {
    const workspace = await this.workspaceModel.findById(input.workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.owner.toString() !== userId)
      throw new ForbiddenException('Not allowed');

    if (!workspace.stripeSubscriptionId)
      throw new BadRequestException(
        'Workspace does not have an active subscription.',
      );

    // 1. Cancela en Stripe (al final del período actual)
    const sub = await this.stripe.subscriptions.update(
      workspace.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      },
    );

    console.log('Stripe subscription updated:', sub);

    // 2. Actualiza en BD
    workspace.planCancelPending = true;
    workspace.planEndsAt = new Date(sub.cancel_at * 1000);

    await this.planCancellationService.create({
      workspaceId: new Types.ObjectId(input.workspaceId),
      userId: new Types.ObjectId(userId),
      reason: input.reason,
      other: input.other,
      canceledAt: new Date(),
    });

    // 3. (Opcional) Guarda el motivo en tu colección o en el workspace, como prefieras
    // workspace.cancellationReason = input.reason;
    await workspace.save();

    // 4. (Opcional) log o trigger para tu colección de motivos de cancelación
    // await this.cancellationModel.create({...})
  }
  async isUserOwnerOfWorkspace(
    workspaceId: string,
    userId: Types.ObjectId,
  ): Promise<boolean> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace.owner.equals(userId);
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    // Convierte owner y los user de members a ObjectId
    const workspaceData: any = {
      ...input,
      owner: new Types.ObjectId(input.owner),
      members: input.members?.map((member) => ({
        ...member,
        user: new Types.ObjectId(member.user),
        joinedAt: member.joinedAt ? new Date(member.joinedAt) : new Date(),
      })),
      // ...cualquier otra conversión
    };

    const workspace = new this.workspaceModel(workspaceData);
    return workspace.save();
  }

  async getMembersBespire(userId: string, search?: string): Promise<any[]> {
    // 1. Buscar el workspace y popular los usuarios en members
    const workspace = await this.workspaceModel
      .findOne({
        $or: [
          { owner: userId },
          { 'members.user': new Types.ObjectId(userId) },
        ],
      })
      .populate('members.user');

    if (!workspace) throw new NotFoundException('Workspace not found');

    // 2. Filtro sobre los datos ya populados
    let members = workspace.members;

    if (search) {
      const regex = new RegExp(search, 'i');
      members = members.filter(
        (m) =>
          regex.test((m.user as any).email) ||
          regex.test((m.user as any).firstName) ||
          regex.test((m.user as any).lastName) ||
          regex.test((m as any).teamRole || ''),
      );
    }

    // 3. Mapear a UserAssigned
    const usersMapped = members
      .filter((member) => member.role !== 'admin')
      .map((member) => ({
        id: member.user._id,
        name:
          `${(member.user as any).firstName} ${(member.user as any).lastName}`.trim() ||
          (member.user as any).email,
        avatarUrl: (member.user as any).avatarUrl,
        teamRole: (member as any).teamRole || null,
      }));

    return usersMapped;
  }

  async getAssignedMembersByLinkedTo(
    linkedToId: string,
  ): Promise<UserAssigned[]> {
    // 1. Buscar todos los assignees del request (o recurso)
    const assignees = await this.assigneesService.findAssigneesByLinkedTo(
      linkedToId,
      'request',
    );

    const userIds = assignees.map((a) => a.user);

    // 2. Buscar todos los users asignados
    const users = await this.usersService.findByQuery({
      _id: { $in: userIds },
    });

    // 3. Buscar todos los workspaceSelected únicos de esos users
    const workspaceIds = [
      ...new Set(
        users.map((u) => u.workspaceSelected?.toString()).filter(Boolean),
      ),
    ];
    const workspaces = await this.workspaceModel
      .find({ _id: { $in: workspaceIds } })
      .populate('members.user');

    // 4. Mapear a UserAssigned
    //@ts-ignore
    return users.map((user) => {
      // Buscar el workspace donde es miembro
      const workspace = workspaces.find(
        (w) => w._id.toString() === user.workspaceSelected?.toString(),
      );
      // Buscar el dato de miembro
      let member = null;
      if (workspace) {
        member = workspace.members.find(
          (m) => m.user._id.toString() === user._id.toString(),
        );
      }

      return {
        id: user._id,
        name:
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          user.email,
        avatarUrl: user.avatarUrl,
        teamRole: member?.teamRole || user.teamRole || null,
      };
    });
  }

  async assignSuccessManager(
    input: AssignSuccessManagerInput,
  ): Promise<boolean> {
    const { workspaceId, successManagerId } = input;

    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    const idObj = new Types.ObjectId(successManagerId);
    workspace.successManager = idObj;
    await workspace.save();
    const ownerId = workspace.owner;

    // Para el dueño del workspace (owner)
    await this.notificationsService.notify({
      users: [ownerId],
      type: 'assigned_success_manager', // <-- custom type para owner
      category: 'assignee',
      linkedToId: new Types.ObjectId(workspace._id.toString()),
      meta: {
        isOwner: true, // Indica que es el owner
      },
    });

    // Obtener nombre de la company para la notificación
    let companyName = '';
    if (workspace.company) {
      try {
        const company = await this.companiesService.findById(
          workspace.company.toString(),
        );
        companyName = company?.name || '';
      } catch (error) {
        console.warn('Error fetching company:', error);
      }
    }

    // Para el Success Manager asignado
    await this.notificationsService.notify({
      users: [idObj], // el success manager
      type: 'assigned_success_manager', // <-- tipo normal
      category: 'assignee',
      linkedToId: new Types.ObjectId(workspace._id.toString()),
      meta: {
        companyName,
        isOwner: false, // Indica que es el success manager
      },
    });

    return true;
  }
}
