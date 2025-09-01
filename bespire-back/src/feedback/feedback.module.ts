import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackResolver } from './feedback.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Feedback, FeedbackSchema } from './schema/feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  providers: [FeedbackResolver, FeedbackService],
})
export class FeedbackModule {}
