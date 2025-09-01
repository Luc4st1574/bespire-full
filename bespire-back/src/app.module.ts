import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy';

import { StripeModule } from './stripe/stripe.module';
import * as dotenv from 'dotenv';
import { MailService } from './mail/mail.service';
import { FeedbackModule } from './feedback/feedback.module';
import { RequestsModule } from './requests/requests.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { ServicesModule } from './services/services.module';
import { PlansModule } from './plans/plans.module';
import { BrandsModule } from './brands/brands.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { PlanCancellationModule } from './plan-cancellation/plan-cancellation.module';
import { FilesModule } from './files/files.module';
import { CommentsModule } from './comments/comments.module';
import { ActivityModule } from './activity/activity.module';
import { LinksModule } from './links/links.module';
import { AssigneeModule } from './assignee/assignee.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CompaniesModule } from './companies/companies.module';
import { UploadsModule } from './uploads/uploads.module';
import { GraphQLOpsLogger } from '../utils/log-graphql';
import { CalendarModule } from './calendar/calendar.module';
dotenv.config();
console.log('MONGODB_URI', process.env.MONGODB_URI);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Importante para no tener que importar manualmente en cada módulo
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      context: ({ req }) => ({ req }), // ← ESTA LÍNEA ES CRÍTICA
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    StripeModule,
    FeedbackModule,
    RequestsModule,
    SubtasksModule,
    ServicesModule,
    PlansModule,
    BrandsModule,
    WorkspaceModule,
    PlanCancellationModule,
    FilesModule,
    CommentsModule,
    ActivityModule,
    LinksModule,
    AssigneeModule,
    NotificationsModule,
    ReviewsModule,
    CompaniesModule,
    UploadsModule,
    CalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, MailService, GraphQLOpsLogger], // CloudinaryService comentado temporalmente
})
export class AppModule {}
