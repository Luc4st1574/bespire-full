import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';
import { Model, Types } from 'mongoose';
import { CommentsService } from 'src/comments/comments.service';
import { UsersService } from 'src/users/users.service';
import { WorkspaceService } from 'src/workspace/workspace.service';
import { notificationTemplates } from './notification.templates';
import { AssigneeService } from 'src/assignee/assignee.service';
import { RequestsService } from 'src/requests/requests.service';
import { Comment } from 'src/comments/schema/comments.schema';
import { NotificationResponse } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notifModel: Model<Notification>,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
    @Inject(forwardRef(() => AssigneeService))
    private readonly assigneesService: AssigneeService,
    @Inject(forwardRef(() => RequestsService))
    private readonly requestsService: RequestsService,
  ) {}

  async notify(input: {
    users: Types.ObjectId[]; // array de userIds
    type: string;
    category: string;
    linkedToId?: Types.ObjectId;
    meta?: any; // datos adicionales
  }) {
    console.log('Creating notifications for users:', input.users);
    let ctx: any = {
      ...input.meta,
      categoryName:
        input.category.charAt(0).toUpperCase() + input.category.slice(1),
      category: input.category,
    };
    if (input.type === 'comment' && input.linkedToId) {
      const comment = await this.commentsService.findById(
        input.linkedToId.toString(),
      );
      if (comment) {
        //agregar al ctx el avatar del usuario que hizo el comentario
        ctx.avatar = (comment.user as any)?.avatarUrl || null;
        // Armar el contexto para el template
        ctx = { ...ctx, ...this.buildCommentContext(comment) };
        // Usuarios a notificar
        input.users = await this.getUsersToNotifyForComment(comment);
      }
    }

    if (input.type === 'review' && input.linkedToId) {
      console.log('Finding reviews for linkedToId:', input.linkedToId);
      // Obtener el usuario que hizo el review desde meta.reviewer
      if (input.meta?.reviewer) {
        console.log('Reviewer ID:', input.meta.reviewer);
        const reviewer = await this.usersService.findById(input.meta.reviewer);
        if (reviewer) {
          console.log('Reviewer found:', reviewer);
          ctx.avatar = (reviewer as any)?.avatarUrl || null;
          ctx.reviewerName =
            ((reviewer as any)?.firstName || '') +
              ' ' +
              ((reviewer as any)?.lastName || '') ||
            (reviewer as any)?.email ||
            'Someone';
        }
      }

      // Agregar datos del review al contexto
      ctx.rating = input.meta?.rating || 'N/A';
      ctx.feedback = input.meta?.feedback || '';
      ctx.linkedToType = input.meta?.linkedToType || '';

      // Obtener usuarios a notificar (assignees del request)
      input.users = await this.getUsersToNotifyForReview(input.linkedToId);
    }

    if (input.type === 'assigned_success_manager' && input.linkedToId) {
      // Busca workspace o lo que necesites
      const ws = await this.workspaceService.getWorkspaceById(
        input.linkedToId.toString(),
      );
      //@ts-ignore
      ctx.companyName = ws?.companyName || ws?.name || '';
    }

    if (input.type === 'assigned_team_member' && input.linkedToId) {
      //aqui me viene como user el trabajador asignado , me falta buscar el owner del workspace
      if (ctx?.linkedToType === 'request') {
        const request = await this.requestsService.findById(
          input.linkedToId.toString(),
        );
        if (request?.workspace) {
          const ws = await this.workspaceService.getWorkspaceById(
            request.workspace.toString(),
          );
          if (ws?.owner) {
            // Agrega el owner del workspace
            input.users.push(new Types.ObjectId(ws.owner));
          }
          //agregar el companyName al contexto
          //@ts-ignore
          ctx.companyName = ws?.companyName || ws?.name || '';
        }
      }
      //ahora buscamos los datos del usuario asignado y agregamos su nombre al contexto
      const user = await this.usersService.findById(input.users[0].toString());
      if (user) {
        ctx.assignedUserName =
          ((user as any)?.firstName || '') +
            ' ' +
            ((user as any)?.lastName || '') ||
          (user as any)?.email ||
          'Someone';
      }
    }

    if (input.type === 'request_status_updated' && input.linkedToId) {
      // Busca la solicitud y agrega el nombre del workspace al contexto
      const request = await this.requestsService.findById(
        input.linkedToId.toString(),
      );
      ctx.requestTitle = request.title || 'Untitled Request';
      //agregar el createdBy user
      if (request?.createdBy) {
        input.users.push(request.createdBy);
      }
      if (request?.workspace) {
        const ws = await this.workspaceService.getWorkspaceById(
          request.workspace.toString(),
        );
        //@ts-ignore
        ctx.companyName = ws?.companyName || ws?.name || '';

        //agregar al owner y success manager del workspace
        if (ws?.owner) {
          input.users.push(new Types.ObjectId(ws.owner));
        }
        if (ws?.successManager) {
          input.users.push(new Types.ObjectId(ws.successManager));
        }
      }
      // Agrega el estado actualizado al contexto
      ctx.status = input.meta?.status || 'Unknown';
      // 1. Agrega todos los assignees
      const assignees = await this.assigneesService.findAssigneesByLinkedTo(
        input.linkedToId.toString(),
      );
      if (assignees?.length) {
        input.users.push(...assignees.map((a) => a.user._id));
      }
      //elimina duplicados
      input.users = Array.from(
        new Set(input.users.map((u) => u.toString())),
      ).map((u) => new Types.ObjectId(u));
    }

    const adminId = await this.usersService.findAdminId();
    const adminObjectId = new Types.ObjectId(adminId);
    // Aseguramos que el admin siempre reciba la notificación
    if (!input.users.includes(adminObjectId)) {
      input.users.push(adminObjectId);
    }
    // Selecciona la plantilla
    const template =
      notificationTemplates[input.type] || notificationTemplates.default;
    const title = template.title(ctx);
    const description = template.description(ctx);
    const message = template.message ? template.message(ctx) : null;

    // Agrega admin como antes si hace falta...

    // Resto igual que tu método
    const notifications = input.users.map((userId) => ({
      user: userId,
      title,
      description,
      message,
      type: input.type,
      category: input.category,
      linkedToId: input.linkedToId,
      read: false,
      avatar: ctx.avatar || null, // Agrega el avatar si está disponible
    }));
    await this.notifModel.insertMany(notifications);
  }

  // 2. Construye el contexto del comentario para las plantillas
  private buildCommentContext(comment: Comment): any {
    return {
      commentText: comment.text,
      commenterName:
        ((comment.user as any)?.firstName || '') +
          ' ' +
          ((comment.user as any)?.lastName || '') ||
        (comment.user as any)?.email ||
        'Someone',
    };
  }

  // 1. Obtén los usuarios a notificar por un comentario
  private async getUsersToNotifyForComment(
    comment: Comment,
  ): Promise<Types.ObjectId[]> {
    let users: Types.ObjectId[] = [];

    // 1. Agrega todos los assignees
    const assignees = await this.assigneesService.findAssigneesByLinkedTo(
      comment.linkedToId.toString(),
    );
    if (assignees?.length) {
      users.push(...assignees.map((a) => a.user._id));
    }
    // 2. Agrega el success manager del workspace (si existe)
    if (comment.linkedToType === 'request') {
      const request = await this.requestsService.findById(
        comment.linkedToId.toString(),
      );

      //agregar el createdBy user
      if (request?.createdBy) {
        users.push(request.createdBy);
      }

      if (request?.workspace) {
        const ws = await this.workspaceService.getWorkspaceById(
          request.workspace.toString(),
        );
        if (ws?.successManager) {
          users.push(ws.successManager);
        }
      }
    }

    // 3. Quita el usuario que hizo el comentario
    users = users.filter(
      (userId) => userId.toString() !== comment.user._id.toString(),
    );

    // 4. Unicos
    return Array.from(new Set(users));
  }

  // Obtén los usuarios a notificar por un review
  private async getUsersToNotifyForReview(
    linkedToId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const users: Types.ObjectId[] = [];
    console.log(
      'Finding users to notify for review on linkedToId:',
      linkedToId,
    );
    // 1. Agrega todos los assignees del request
    const assignees = await this.assigneesService.findAssigneesByLinkedTo(
      linkedToId.toString(),
    );
    console.log('Assignees found:', assignees.length);
    if (assignees?.length) {
      users.push(...assignees.map((a) => a.user._id));
    }

    // 2. Agrega  success manager del workspace
    const request = await this.requestsService.findById(linkedToId.toString());

    if (request?.workspace) {
      const ws = await this.workspaceService.getWorkspaceById(
        request.workspace.toString(),
      );
      if (ws?.successManager) {
        users.push(ws.successManager);
      }
    }
    console.log('Users to notify:', users.length);

    return Array.from(new Set(users.map((u) => u.toString()))).map(
      (u) => new Types.ObjectId(u),
    );
  }

  // Crear notificaciones para uno o varios usuarios
  async createNotifications(input: {
    users: Types.ObjectId[]; // array de userIds
    title: string;
    description: string;
    type: string;
    category: string;
    linkedToId?: Types.ObjectId;
  }) {
    const notifications = input.users
      .filter(
        (userId) =>
          userId &&
          typeof userId === 'object' &&
          userId instanceof Types.ObjectId,
      )
      .map((userId) => ({
        user: userId,
        title: input.title,
        description: input.description,
        type: input.type,
        category: input.category,
        linkedToId: input.linkedToId,
        read: false,
      }));
    await this.notifModel.insertMany(notifications);
    return true;
  }

  // Listar notificaciones del usuario logueado, paginado
  async findAllByUser(
    userId: string | Types.ObjectId,
    { skip = 0, limit = 20 } = {},
  ): Promise<NotificationResponse[]> {
    const notifs = await this.notifModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Notificaciones encontradas:', notifs);

    // Mapear la respuesta para poner el avatar a nivel raíz
    return notifs.map((n) => ({
      _id: n._id,
      title: n.title,
      description: n.description,
      message: n.message,
      type: n.type,
      category: n.category,
      linkedToId: n.linkedToId,
      read: n.read,
      date: n.createdAt,
      avatar: n?.avatar,
    }));
  }

  // Contar notificaciones no leídas (para el bell)
  async countUnread(userId: string | Types.ObjectId): Promise<number> {
    return this.notifModel.countDocuments({
      user: new Types.ObjectId(userId),
      read: false,
    });
  }

  // Marcar como leída
  async markAsRead(notificationId: string, userId: string) {
    const notif = await this.notifModel.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { read: true } },
      { new: true },
    );
    return !!notif;
  }

  // Marcar todas como leídas
  async markAllAsRead(userId: string) {
    console.log('Marking all notifications as read for user:', userId);
    if (!userId) {
      throw new Error('User ID is required to mark notifications as read');
    }
    const userObjectId = new Types.ObjectId(userId);
    if (!userObjectId) {
      throw new Error('Invalid user ID');
    }
    console.log('Updating notifications for user:', userObjectId);
    // Actualizar todas las notificaciones del usuario a leídas
    await this.notifModel.updateMany(
      { user: userObjectId, read: false },
      { $set: { read: true } },
    );
    return true;
  }
}
