/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from './schema/request.schema';
import { Model, Types } from 'mongoose';
import { CreateRequestInput } from './dto/create-request.input';
import { ServicesService } from 'src/services/services.service';
import { UsersService } from 'src/users/users.service';
import { PlansService } from 'src/plans/plans.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { FilesService } from 'src/files/files.service';
import { ActivityService } from 'src/activity/activity.service';
import { CommentsService } from 'src/comments/comments.service';
import { LinksService } from 'src/links/links.service';
import { AssigneeService } from 'src/assignee/assignee.service';
import { UpdateRequestFieldsInput } from './dto/update-request-fields.input';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<Request>,
    private readonly servicesService: ServicesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
    private readonly filesService: FilesService,
    private readonly activityService: ActivityService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    @Inject(forwardRef(() => AssigneeService))
    private readonly assigneesService: AssigneeService, // Asegúrate de importar el servicio de Assignees
    private readonly linksService: LinksService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}
  async createRequest(
    input: CreateRequestInput,
    user_id: string,
  ): Promise<Request> {
    console.log('Creating request with input:', input);
    // Transformaciones y defaults
    const {
      title,
      details,
      brand,
      service,
      dueDate,
      priority = 'medium',
      links = [],
      attachments = [],
    } = input;

    // Validaciones
    //verificar que tengo creditos suficientes
    const workspace = await this.workspaceService.getWorkspaceById(
      input.workspace,
    );
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    const user = await this.usersService.findById(user_id);
    if (!user) {
      throw new Error('User not found');
    }
    //@ts-ignore
    if (!workspace.credits || workspace.credits <= 0) {
      throw new Error('Insufficient credits');
    }
    const serviceDetails = await this.servicesService.findOne(service);
    if (!serviceDetails) {
      throw new Error('Service not found');
    }
    if (serviceDetails.status !== 'active') {
      throw new Error('Service is not active');
    }
    const creditsService = serviceDetails.credits;

    //@ts-ignore
    if (workspace.credits < creditsService) {
      throw new Error('Insufficient credits for this service');
    }

    const planDb = await this.plansService.findOne({
      _id: new Types.ObjectId(workspace.plan),
    });
    if (!planDb) throw new Error('Invalid plan');

    const activeOrdersAllowed = planDb.activeOrdersAllowed || 0;
    //const activeOrdersAllowed = 10; // Cambiar por el valor real del plan
    const activeRequestsCount = await this.requestModel.countDocuments({
      createdBy: new Types.ObjectId(user_id),
      status: {
        $in: [
          'queued',
          'in_progress',
          'for_review',
          'for_approval',
          'revision',
          'needs_info',
        ],
      }, // Considerar solo solicitudes activas
    });
    if (activeRequestsCount >= activeOrdersAllowed) {
      throw new Error(
        `You have reached the limit of active requests for your plan (${activeOrdersAllowed}). Please complete or cancel some requests before creating new ones.`,
      );
    }

    const req = await this.requestModel.create({
      title,
      details,
      brand: new Types.ObjectId(brand),
      service: new Types.ObjectId(service),
      createdBy: new Types.ObjectId(user_id),
      status: 'queued', ///default
      priority: (priority || 'medium').toLowerCase(),
      dueDate: dueDate ? new Date(dueDate) : null,
      credits: creditsService,
      workspace: new Types.ObjectId(input.workspace),
      parentRequest: input.parentRequest
        ? new Types.ObjectId(input.parentRequest)
        : null, // Si es un subtask, asignar el parentRequest
    });

    // Guardar cada link en la nueva colección (en paralelo)
    await Promise.all(
      links.map(async (link) => {
        // Ajusta aquí si tu DTO de link es distinto
        return this.linksService.create(
          {
            url: link.url,
            title: link.title,
            favicon: link.favicon,
            linkedToId: req._id.toString(),
            linkedToType: 'request',
          },
          user_id,
        );
      }),
    );

    // Aquí puedes hacer lógica extra como push en activityLog, notificaciones, etc.
    // Actualizar créditos del usuario
    await this.workspaceService.findByIdAndUpdate(input.workspace, {
      //@ts-ignore
      credits: workspace.credits - creditsService, // Restar créditos del usuario
    });

    //ahora recorrer los attachments y actualizarlos
    await Promise.all(
      attachments.map(async (attachment) => {
        return this.filesService.updateFile(attachment.fileId, {
          linkedToId: req._id.toString(),
          linkedToType: 'request',
          status: 'linked',
        });
      }),
    );
    // Agregar actividad de creación de solicitud
    await this.activityService.create(
      {
        action: 'create',
        linkedToId: req._id.toString(),
        linkedToType: 'request',
        activityText: `Request "${title}" created by ${user.firstName} ${user.lastName}`,
      },
      user_id,
    );

    //necesito notificar al admin , al success manager asignado y al mismo que creó el request

    const adminId = await this.usersService.findAdminId();
    const adminObjectId = new Types.ObjectId(adminId);
    const successManagerId = workspace.successManager || null;

    // Crea la notificación
    await this.notificationsService.notify({
      users: [adminObjectId, successManagerId, new Types.ObjectId(user_id)],
      type: 'request_submitted',
      category: 'request',
      linkedToId: req._id as Types.ObjectId,
    });
    return req;
  }

  async findAllWithAssignees(userId: string): Promise<any[]> {
    // Buscar el usuario
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Por defecto, cliente: ve solo los requests de su workspace
    const workspaceId = user.workspaceSelected;
    return this.requestModel.aggregate([
      {
        $match: {
          workspace: workspaceId,
          status: { $ne: 'cancelled' },
        },
      },
      ...this.getRequestAggregateLookups(),
    ]);
  }

  // Modulariza tu pipeline de lookups aquí
  getRequestAggregateLookups(): any[] {
    return [
      // Traer assignees (colección generalizada)
      {
        $lookup: {
          from: 'assignees',
          let: { requestId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$linkedToId', '$$requestId'] },
                    { $eq: ['$linkedToType', 'request'] },
                  ],
                },
              },
            },
            // Traer info del user asignado
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo',
              },
            },
            {
              $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: false },
            },
            {
              $project: {
                _id: 1,
                userId: '$userInfo._id',
                name: {
                  $cond: [
                    {
                      $and: [
                        { $ifNull: ['$userInfo.firstName', false] },
                        { $ifNull: ['$userInfo.lastName', false] },
                      ],
                    },
                    {
                      $concat: [
                        '$userInfo.firstName',
                        ' ',
                        '$userInfo.lastName',
                      ],
                    },
                    '$userInfo.email',
                  ],
                },
                avatarUrl: '$userInfo.avatarUrl',
                teamRole: '$userInfo.teamRole',
                email: '$userInfo.email',
                assignedBy: '$assignedBy',
                createdAt: 1,
              },
            },
          ],
          as: 'assignees',
        },
      },
      // Traer servicio
      {
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'service',
        },
      },
      {
        $unwind: { path: '$service', preserveNullAndEmptyArrays: true },
      },
      // Count subtasks
      {
        $lookup: {
          from: 'requests', // Subtasks = requests con parentId = este request
          let: { requestId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$parentRequest', '$$requestId'] } } },
            { $count: 'count' },
          ],
          as: 'subtasksCountArr',
        },
      },
      // Count comments
      {
        $lookup: {
          from: 'comments',
          let: { requestId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$linkedToId', '$$requestId'] } } },
            { $count: 'count' },
          ],
          as: 'commentsCountArr',
        },
      },
      // Count attachments/files
      {
        $lookup: {
          from: 'files',
          let: { requestId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$linkedToId', '$$requestId'] },
                    { $eq: ['$linkedToType', 'request'] },
                    { $eq: ['$type', 'file'] }, // Solo archivos, no carpetas
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'attachmentsCountArr',
        },
      },
      // Aplana los arrays de conteo a números simples
      {
        $addFields: {
          subtasksCount: {
            $ifNull: [{ $arrayElemAt: ['$subtasksCountArr.count', 0] }, 0],
          },
          commentsCount: {
            $ifNull: [{ $arrayElemAt: ['$commentsCountArr.count', 0] }, 0],
          },
          attachmentsCount: {
            $ifNull: [{ $arrayElemAt: ['$attachmentsCountArr.count', 0] }, 0],
          },
        },
      },
      // Limpiar los arrays de conteo temporales
      {
        $project: {
          subtasksCountArr: 0,
          commentsCountArr: 0,
          attachmentsCountArr: 0,
        },
      },
      // Traer workspace info
      {
        $lookup: {
          from: 'workspaces',
          localField: 'workspace',
          foreignField: '_id',
          as: 'workspaceInfo',
        },
      },
      {
        $unwind: { path: '$workspaceInfo', preserveNullAndEmptyArrays: true },
      },
    ];
  }

  // src/requests/requests.service.ts

  async findRequestsForInternal(userId: string, role: string): Promise<any[]> {
    // Buscar el usuario
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Si es admin, ve todos los requests (sin filtrar por workspace ni asignado)
    if (user.role === 'admin') {
      return this.requestModel.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        ...this.getRequestAggregateLookups(),
      ]);
    }

    // Si es trabajador interno (team_member o isInternalTeam true)
    if (user.role === 'team_member' && role !== 'success_manager') {
      // Buscar requests donde el usuario es assignee
      const assigneeDocs = await this.assigneesService.findAssigneesByUserId(
        userId,
        'request',
      );

      const assignedRequestIds = assigneeDocs.map((a) => a.linkedToId);

      if (!assignedRequestIds.length) return [];

      return this.requestModel.aggregate([
        {
          $match: {
            _id: { $in: assignedRequestIds },
            status: { $ne: 'cancelled' },
          },
        },
        ...this.getRequestAggregateLookups(),
      ]);
    }

    // 1. Buscar todos los workspaces donde es successManager
    const userIdObj = new Types.ObjectId(userId);
    const workspaces = await this.workspaceService.find({
      successManager: userIdObj,
    });
    const workspaceIds = workspaces.map((ws) => ws._id);

    // 2. Buscar requests donde es assignee individual
    const assigneeDocs = await this.assigneesService.findAssigneesByUserId(
      userId,
      'request',
    );
    const assignedRequestIds = assigneeDocs.map((a) => a.linkedToId);

    // 3. Buscar todos los requests en esos workspaces + los requests donde es assignee (sin repetir)
    const matchQuery: any = {
      $and: [
        { status: { $ne: 'cancelled' } },
        {
          $or: [
            { workspace: { $in: workspaceIds } },
            { _id: { $in: assignedRequestIds } },
          ],
        },
      ],
    };

    // 4. Ejecutar el aggregate
    return this.requestModel.aggregate([
      { $match: matchQuery },
      ...this.getRequestAggregateLookups(),
    ]);
  }

  async updateAssignees(
    requestId: string,
    assignees: string[], // Array de IDs de usuarios
  ) {
    const request = await this.requestModel.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');
    //@ts-ignore
    request.assignees = assignees.map((a) => new Types.ObjectId(a));
    await request.save();
    return 'Assignees updated successfully';
  }

  async getTimeLineByRequest(id: string): Promise<any[]> {
    // 4. Comments (linkedToId = requestId, linkedToType = 'request')
    const comments = await this.commentsService.findAllByLinkedTo(id);
    const activities = await this.activityService.findByLinkedEntity(
      id,
      'request',
    );

    const commentItems = comments.map((c) => ({
      id: c._id.toString(),
      user: {
        id: (c as any).user._id.toString(),
        name: `${(c as any).user.firstName} ${(c as any).user.lastName}`.trim(),
        avatarUrl: (c as any).user.avatarUrl || '',
        teamRole: (c as any).user.teamRole || '',
      },
      createdAt: (c as any).createdAt.toISOString(),
      type: 'comment',
      text: (c as any).text,
    }));

    const activityItems = activities.map((a) => ({
      id: (a as any)._id.toString(),
      user: {
        id: (a as any).user._id.toString(),
        name: `${(a as any).user.firstName} ${(a as any).user.lastName}`.trim(),
        avatarUrl: (a as any).user.avatarUrl || '',
        teamRole: (a as any).user.teamRole || '',
      },
      createdAt: (a as any).createdAt.toISOString(),
      type: 'activity',
      activityText: (a as any).activityText ?? (a as any).action, // Usa el texto amigable o el nombre de acción
    }));

    // 4. Combina y ordena por fecha
    const timeline = [...commentItems, ...activityItems].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return timeline;
  }

  async getRequestDetail(id: string) {
    // 1. Request principal
    const req = await this.requestModel
      .findById(id)
      .populate('workspace', 'name companyImg')
      .populate('createdBy', 'firstName lastName avatarUrl teamRole email')
      .populate('service', 'type title')
      .lean();

    if (!req) throw new NotFoundException('Request not found');

    // 2. Assignees
    const assignees = await this.assigneesService.getAssignees(id, 'request');
    if (!assignees)
      throw new NotFoundException('No assignees found for this request');

    //ahora los links tambien
    const links = await this.linksService.findByLinkedToId(id);

    // 3. Subtasks (Request con parentId = este id)
    const subtasks = await this.requestModel
      .find({ parentRequest: new Types.ObjectId(id) })
      .lean();

    console.log('subtasks de ', id, subtasks);

    // 5. Files/Attachments (linkedToId = requestId, linkedToType = 'request')
    const attachments = await this.filesService.findByLinkedToId(id);

    const timeline = await this.getTimeLineByRequest(id);

    // 7. Armar respuesta
    // Buscar assignees de los subtasks
    const subtaskAssigneesMap: Record<string, any[]> = {};
    await Promise.all(
      subtasks.map(async (st) => {
        subtaskAssigneesMap[st._id.toString()] =
          await this.assigneesService.getAssignees(
            st._id.toString(),
            'request',
          );
      }),
    );

    return {
      id: req._id.toString(),
      title: req.title,
      details: req.details,
      priority: req.priority,
      status: req.status,
      parentRequest: req.parentRequest ? req.parentRequest.toString() : null,

      client: {
        id: req.workspace?._id?.toString() || '',
        name: (req.workspace as any)?.name || '',
        avatar: (req.workspace as any)?.companyImg || '',
      },
      requester: {
        id: req.createdBy?._id?.toString() || '',
        name:
          (
            ((req.createdBy as any)?.firstName || '') +
            ' ' +
            ((req.createdBy as any)?.lastName || '')
          ).trim() ||
          (req.createdBy as any)?.email ||
          '',
        avatarUrl: (req.createdBy as any)?.avatarUrl || '',
        teamRole: (req.createdBy as any)?.teamRole || '',
      },
      assignees: assignees.map((a) => a.user),
      createdAt: (req.createdAt as any)?.toISOString(),
      dueDate: (req.dueDate as any)?.toISOString() || null,
      internalDueDate: (req.internalDueDate as any)?.toISOString() || null,
      timeSpent: (req.timeSpent as any) ?? { hours: 0, minutes: 0 },
      category: (req.service as any)?.type || 'general',
      subType: (req.service as any)?.title || 'default',
      credits: req.credits,
      //@ts-ignore
      links: links || [],
      attachments: attachments,
      subtasks: subtasks.map((st) => ({
        id: st._id.toString(),
        title: st.title,
        status: st.status,
        dueDate: st.dueDate ? st.dueDate.toISOString() : null,
        internalDueDate: st.internalDueDate
          ? st.internalDueDate.toISOString()
          : null,
        //@ts-ignore
        assignees: (subtaskAssigneesMap[st._id.toString()] || []).map(
          (a) => a.user,
        ),
      })),
      comments: timeline,
    };
  }

  async getSubtasksByRequest(requestId: string) {
    const subtasks = await this.requestModel
      .find({ parentRequest: new Types.ObjectId(requestId) })
      .lean();

    // Obtener assignees para cada subtask
    const subtaskAssigneesMap: Record<string, any[]> = {};
    await Promise.all(
      subtasks.map(async (st) => {
        subtaskAssigneesMap[st._id.toString()] =
          await this.assigneesService.getAssignees(
            st._id.toString(),
            'request',
          );
      }),
    );

    return subtasks.map((st) => ({
      id: st._id.toString(),
      title: st.title,
      status: st.status,
      dueDate: st.dueDate ? st.dueDate.toISOString() : null,
      assignees: (subtaskAssigneesMap[st._id.toString()] || []).map(
        (a) => a.user,
      ),
    }));
  }

  async updateRequestFields(
    input: UpdateRequestFieldsInput,
    userId: string,
  ): Promise<string> {
    const { requestId, ...fields } = input;
    const updated = await this.requestModel.findByIdAndUpdate(
      requestId,
      { $set: fields },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Request not found');

    const userObjectId = new Types.ObjectId(userId);
    const requestObjectId = new Types.ObjectId(requestId);
    if ('status' in fields) {
      await this.notificationsService.notify({
        users: [userObjectId],
        type: 'request_status_updated',
        category: 'request',
        linkedToId: requestObjectId,
        meta: {
          status: fields.status,
        },
      });

      // Agregar actividad de actualización de estado
      await this.activityService.create(
        {
          action: 'update_status',
          linkedToId: requestObjectId.toString(),
          linkedToType: 'request',
          meta: {
            status: fields.status,
          },
          activityText: `Request status updated to "${fields.status}"`,
        },
        userId,
      );

      if (fields.status === 'completed') {
        await this.requestModel.findByIdAndUpdate(requestId, {
          completedAt: new Date(),
        });
      }
    }

    return 'Request updated successfully';
  }

  async findById(id: string): Promise<Request> {
    const request = await this.requestModel.findById(id);
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async getAverageTimePerRequest(
    workspaceId: string | Types.ObjectId,
  ): Promise<number | null> {
    // Busca solo las requests completadas con ambas fechas
    const requests = await this.requestModel
      .find({
        workspace: new Types.ObjectId(workspaceId),
        status: 'completed',
        completedAt: { $ne: null },
        createdAt: { $ne: null },
      })
      .select('createdAt completedAt')
      .lean();

    if (!requests.length) return null;

    // Calcula el tiempo de cada request en horas
    const timesInHours = requests.map((req) => {
      const start = new Date(req.createdAt).getTime();
      const end = new Date(req.completedAt).getTime();
      return (end - start) / (1000 * 60 * 60); // horas
    });

    // Saca el promedio
    const avgTime =
      timesInHours.reduce((a, b) => a + b, 0) / timesInHours.length;
    // Opcional: Redondear a un decimal
    return Math.round(avgTime * 10) / 10;
  }

  async getRevisionStatsByWorkspace(workspaceId: string | Types.ObjectId) {
    // 1. Busca todos los requests del workspace
    const requests = await this.requestModel
      .find({ workspace: new Types.ObjectId(workspaceId) }, { _id: 1 })
      .lean();
    const requestIds = requests.map((r) => r._id);

    if (requestIds.length === 0) return { avg: 0, data: [] };

    // 2. Busca los activity logs de cambio de status que NO sean "completed"
    const logs = await this.activityService.find({
      linkedToId: { $in: requestIds },
      linkedToType: 'request',
      action: 'update_status',
      'meta.status': { $ne: 'completed' }, // <-- aquí filtras solo los que NO son completed
    });

    // 3. Cuenta cuántas revisiones tiene cada request
    const revisionsPerRequest: Record<string, number> = {};
    logs.forEach((log) => {
      const id = log.linkedToId.toString();
      revisionsPerRequest[id] = (revisionsPerRequest[id] || 0) + 1;
    });

    // 4. Calcula el promedio
    const counts = requestIds.map(
      (id) => revisionsPerRequest[id.toString()] || 0,
    );
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;

    // Opcional: retorna data detallada por request
    return {
      avg, // promedio de revisiones por request en el workspace
      data: counts, // cantidad de revisiones por cada request
      details: revisionsPerRequest, // mapa id->cantidad
    };
  }
}
