import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityLog } from './schema/activity.schema';
import { Model, Types } from 'mongoose';
import { CreateActivityLogInput } from './dto/create-activity-log.input';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLog>,
  ) {}
  async create(
    createInput: CreateActivityLogInput,
    userId: string,
  ): Promise<ActivityLog> {
    // Convierte strings a ObjectId
    const toObjectId = (id: string) =>
      Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : undefined;

    const doc = new this.activityLogModel({
      ...createInput,
      user: toObjectId(userId),
      linkedToId: toObjectId(createInput.linkedToId),
    });
    return doc.save();
  }

  // Buscar todos por linkedToId y linkedToType
  async findByLinkedEntity(
    linkedToId: string,
    linkedToType: string,
  ): Promise<ActivityLog[]> {
    return this.activityLogModel
      .find({
        linkedToId: new Types.ObjectId(linkedToId),
        linkedToType,
      })
      .populate('user')
      .sort({ createdAt: 1 })
      .exec();
  }

  async find(filter: any = {}): Promise<ActivityLog[]> {
    return this.activityLogModel.find(filter).populate('user').exec();
  }
}
