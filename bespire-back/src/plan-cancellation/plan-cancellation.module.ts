import { Module } from '@nestjs/common';
import { PlanCancellationService } from './plan-cancellation.service';
import { PlanCancellationResolver } from './plan-cancellation.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanCancellation,
  PlanCancellationSchema,
} from './schema/plan-cancellation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanCancellation.name, schema: PlanCancellationSchema },
    ]),
  ],
  providers: [PlanCancellationResolver, PlanCancellationService],
  exports: [PlanCancellationService],
})
export class PlanCancellationModule {}
