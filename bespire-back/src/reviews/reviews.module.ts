import { forwardRef, Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsResolver } from './reviews.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from './schema/review.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  providers: [ReviewsResolver, ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
