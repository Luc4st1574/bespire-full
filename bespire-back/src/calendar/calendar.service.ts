import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CalendarEvent } from './schema/calendar.schema';
import { EventType } from './schema/event-type.schema';
import { CreateCalendarInput } from './dto/create-calendar.input';
import { UpdateCalendarInput } from './dto/update-calendar.input';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(CalendarEvent.name) private eventModel: Model<CalendarEvent>,
    @InjectModel(EventType.name) private eventTypeModel: Model<EventType>,
  ) {}

  async findAll(workspaceId: string, startStr: string, endStr: string) {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    return this.eventModel
      .find({
        workspace: new Types.ObjectId(workspaceId),
        startDate: { $lt: endDate },
        endDate: { $gt: startDate },
        isArchived: false,
      })
      .populate('eventType')
      .populate({
        path: 'assignedToUser',
        select: 'firstName lastName email avatarUrl teamRole',
      })
      .populate({
        path: 'assignedToCompany',
        select: 'name',
      })
      .populate({
        path: 'invitedPeople',
        select: 'firstName lastName email avatarUrl teamRole',
      });
  }

  async findOne(id: string) {
    return this.eventModel
      .findById(id)
      .populate('eventType')
      .populate('assignedToUser')
      .populate('assignedToCompany')
      .populate('invitedPeople');
  }

  async create(input: CreateCalendarInput, userId: string) {
    const event = new this.eventModel({
      ...input,
      workspace: new Types.ObjectId(input.workspace),
      createdBy: new Types.ObjectId(userId),
      eventType: new Types.ObjectId(input.eventType),
      assignedToUser: input.assignedToUser
        ? new Types.ObjectId(input.assignedToUser)
        : null,
      assignedToCompany: input.assignedToCompany
        ? new Types.ObjectId(input.assignedToCompany)
        : null,
      invitedPeople: input.invitedPeople.map((id) => new Types.ObjectId(id)),
    });
    const savedEvent = await event.save();
    return this.findOne(savedEvent._id.toString());
  }

  async update(id: string, input: UpdateCalendarInput) {
    const updatedEvent = await this.eventModel.findByIdAndUpdate(id, input, {
      new: true,
    });
    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }
    return this.findOne(updatedEvent._id.toString());
  }

  async remove(id: string) {
    return this.eventModel.findByIdAndDelete(id);
  }

  async findEventTypes(workspaceId: string): Promise<EventType[]> {
    return this.eventTypeModel.find({
      $or: [
        { workspaceId: null },
        { workspaceId: new Types.ObjectId(workspaceId) },
      ],
    });
  }
}
