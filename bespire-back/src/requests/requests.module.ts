import { forwardRef, Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsResolver } from './requests.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Request, RequestSchema } from './schema/request.schema';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { PlansModule } from 'src/plans/plans.module';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { FilesModule } from 'src/files/files.module';
import { ActivityModule } from 'src/activity/activity.module';
import { CommentsModule } from 'src/comments/comments.module';
import { LinksModule } from 'src/links/links.module';
import { AssigneeModule } from 'src/assignee/assignee.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    ServicesModule,
    forwardRef(() => UsersModule),
    PlansModule,
    forwardRef(() => WorkspaceModule),
    FilesModule,
    ActivityModule,
    CommentsModule,
    forwardRef(() => AssigneeModule),
    LinksModule,
    forwardRef(() => NotificationsModule),
    MongooseModule.forFeature([{ name: Request.name, schema: RequestSchema }]),
  ],
  providers: [RequestsResolver, RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
