import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityResolver } from './activity.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from './schema/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityLog.name, schema: ActivityLogSchema },
    ]),
  ],
  providers: [ActivityResolver, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
