import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Assignee } from './schema/assignee.schema';
import { Model, Types } from 'mongoose';
import { CreateAssigneeInput } from './dto/create-assignee.input';
import { UserAssigneeOutput } from 'src/users/dto/user-profile.output';
import { AssigneeOutput } from './dto/assignee-output.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class AssigneeService {
  constructor(
    @InjectModel(Assignee.name) private assigneeModel: Model<Assignee>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async addAssignee(
    input: CreateAssigneeInput,
    assignedBy: string,
  ): Promise<Assignee> {
    // Evitar duplicados
    const linkedToIdObjectId = new Types.ObjectId(input.linkedToId);
    if (!linkedToIdObjectId) {
      throw new Error('Invalid linkedToId');
    }
    const userObjectId = new Types.ObjectId(input.user);
    if (!userObjectId) {
      throw new Error('Invalid user ID');
    }
    const exists = await this.assigneeModel.findOne({
      linkedToId: linkedToIdObjectId,
      linkedToType: input.linkedToType,
      user: userObjectId,
    });
    if (exists) return exists;

    const assignee = await this.assigneeModel.create({
      linkedToId: linkedToIdObjectId,
      linkedToType: input.linkedToType,
      user: userObjectId,
      assignedBy: new Types.ObjectId(assignedBy),
    });
    //notification
    // Para el dueño del workspace (owner)
    await this.notificationsService.notify({
      users: [userObjectId],
      type: 'assigned_team_member',
      category: 'assignee',
      linkedToId: linkedToIdObjectId,
      meta: {
        linkedToType: input.linkedToType,
      },
    });
    return assignee;
  }

  async removeAssignee(
    linkedToId: string,
    linkedToType: string,
    user: string,
  ): Promise<boolean> {
    // Convertir linkedToId a ObjectId
    const linkedToIdObjectId = new Types.ObjectId(linkedToId);
    if (!linkedToIdObjectId) {
      throw new Error('Invalid linkedToId');
    }
    // Convertir user a ObjectId
    const userObjectId = new Types.ObjectId(user);
    if (!userObjectId) {
      throw new Error('Invalid user ID');
    }
    const result = await this.assigneeModel.deleteOne({
      linkedToId: linkedToIdObjectId,
      user: userObjectId,
    });
    return result.deletedCount > 0;
  }

  // src/assignees/assignees.service.ts

  async findAssigneesByUserId(userId: string, type: string) {
    const userIdObjectId = new Types.ObjectId(userId);
    const assigneeDocs = await this.assigneeModel
      .find({
        user: userIdObjectId,
        linkedToType: type,
      })
      .select('linkedToId');
    return assigneeDocs;
  }

  async findAssigneesByLinkedTo(
    linkedToId: string,
    linkedToType: string = null,
  ) {
    const linkedToIdObjectId = new Types.ObjectId(linkedToId);
    console.log(
      'Finding assignees for linkedToId:',
      linkedToIdObjectId,
      'and linkedToType:',
      linkedToType,
    );
    const assigneeDocs = await this.assigneeModel
      .find({
        linkedToId: linkedToIdObjectId,
      })
      .populate('user')
      .sort({ createdAt: 1 })
      .lean();
    return assigneeDocs;
  }

  async getAssignees(
    linkedToId: string,
    linkedToType: string,
  ): Promise<AssigneeOutput[]> {
    //convertir linkedToId a ObjectId
    const linkedToIdObjectId = new Types.ObjectId(linkedToId);
    const docs = await this.assigneeModel
      .find({ linkedToId: linkedToIdObjectId, linkedToType })
      .populate('user')
      .sort({ createdAt: 1 })
      .lean();

    return docs.map((doc) => ({
      _id: doc._id.toString(),
      linkedToId: doc.linkedToId.toString(),
      linkedToType: doc.linkedToType,
      user: doc.user
        ? {
            id: doc.user._id?.toString(),
            name:
              (doc as any).user.firstName && (doc as any).user.lastName
                ? `${(doc as any).user.firstName} ${(doc as any).user.lastName}`
                : (doc as any).user.email,
            avatarUrl: (doc as any).user.avatarUrl
              ? (doc as any).user.avatarUrl
              : null,
            teamRole: (doc as any).user.teamRole
              ? (doc as any).user.teamRole
              : null,
          }
        : null,
      assignedBy: doc.assignedBy?.toString(),
      createdAt: doc.createdAt,
    }));
  }
}
