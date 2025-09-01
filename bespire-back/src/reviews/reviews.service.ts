import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schema/review.schema';
import { Model, Types } from 'mongoose';
import { CreateReviewInput } from './dto/create-review.input';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(input: CreateReviewInput, reviewerId: string) {
    const dto = {
      ...input,
      reviewer: new Types.ObjectId(reviewerId),
      linkedToId: new Types.ObjectId(input.linkedToId),
    };
    const doc = await this.reviewModel.create(dto);
    await this.notificationsService.notify({
      users: [],
      type: 'review',
      category: 'request',
      linkedToId: doc.linkedToId,
      meta: {
        reviewer: dto.reviewer.toString(),
        linkedToType: doc.linkedToType,
        rating: doc.rating,
        feedback: doc.feedback,
      },
    });
    return {
      _id: doc._id.toString(),
      linkedToId: doc.linkedToId.toString(),
      linkedToType: doc.linkedToType,
      rating: doc.rating,
      feedback: doc.feedback,
      createdAt: doc.createdAt,
    };
  }

  async findByRequest(requestId: string) {
    console.log('Finding reviews for request:', requestId);
    const requestObjectId = new Types.ObjectId(requestId);
    const docs = await this.reviewModel
      .find({ linkedToType: 'request', linkedToId: requestObjectId })
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found reviews:', docs.length);
    return docs.map((d) => ({
      _id: d._id.toString(),
      linkedToId: d.linkedToId.toString(),
      linkedToType: d.linkedToType,
      rating: d.rating,
      feedback: d.feedback,
      createdAt: d.createdAt,
    }));
  }

  async getAverageRatingByReviewer(reviewerId: string): Promise<number> {
    const reviews = await this.reviewModel
      .find({ reviewer: new Types.ObjectId(reviewerId) })
      .lean();
    console.log(
      `Calculating average rating for reviewer ${reviewerId}:`,
      reviews.length,
    );
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }
}
