import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schema/comments.schema';
import { Model, Types } from 'mongoose';
import { CreateCommentInput } from './dto/create-comment.input';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(input: CreateCommentInput, userId: string): Promise<Comment> {
    const comment = new this.commentModel({
      ...input,
      user: new Types.ObjectId(userId),
      linkedToId: new Types.ObjectId(input.linkedToId),
    });

    await comment.save();

    // Create a notification for the user
    await this.notificationsService.notify({
      users: [new Types.ObjectId(userId)],
      type: 'comment',
      category: input.linkedToType,
      linkedToId: new Types.ObjectId(comment._id),
    });

    return comment;
  }

  async findAllByLinkedTo(linkedToId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ linkedToId: new Types.ObjectId(linkedToId) })
      .populate('user')
      .sort({ createdAt: 1 });
  }
  async findById(id: string): Promise<Comment> {
    return this.commentModel.findById(id).populate('user');
  }
}
