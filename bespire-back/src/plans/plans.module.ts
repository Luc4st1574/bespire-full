import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansResolver } from './plans.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Plan, PlanSchema } from './scheme/plan.scheme';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Plan.name, schema: PlanSchema }]),
  ],
  providers: [PlansResolver, PlansService],
  exports: [PlansService],
})
export class PlansModule {}
