import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsModule } from 'src/comments/comments.module';
import { UsersModule } from 'src/users/users.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { AssigneeModule } from 'src/assignee/assignee.module';
import { RequestsModule } from 'src/requests/requests.module';

@Module({
  imports: [
    forwardRef(() => CommentsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => AssigneeModule),
    forwardRef(() => RequestsModule),

    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationsResolver, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
