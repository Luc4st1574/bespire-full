import { forwardRef, Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceResolver } from './workspace.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from './schema/workspace.schema';
import { UsersModule } from 'src/users/users.module';
import { MailService } from 'src/mail/mail.service';
import { PlansModule } from 'src/plans/plans.module';
import { PlanCancellationModule } from 'src/plan-cancellation/plan-cancellation.module';
import { AssigneeModule } from 'src/assignee/assignee.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CompaniesModule } from 'src/companies/companies.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PlansModule,
    PlanCancellationModule,
    AssigneeModule,
    NotificationsModule,
    CompaniesModule,
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
  ],
  providers: [WorkspaceResolver, WorkspaceService, MailService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
