import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFeedbackInput } from './dto/create-feedback.input';
import { Feedback } from './schema/feedback.schema';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
  ) {}

  async create(userId: string, input: CreateFeedbackInput): Promise<Feedback> {
    return this.feedbackModel.create({
      userId,
      ...input,
    });
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackModel.find().sort({ createdAt: -1 }).exec();
  }
}
