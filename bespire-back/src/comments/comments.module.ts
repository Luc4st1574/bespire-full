import { forwardRef, Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comments.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],
  providers: [CommentsResolver, CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
