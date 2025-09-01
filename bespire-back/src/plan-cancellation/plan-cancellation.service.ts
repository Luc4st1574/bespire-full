import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PlanCancellation } from './schema/plan-cancellation.schema';
import { Model } from 'mongoose';

@Injectable()
export class PlanCancellationService {
  constructor(
    @InjectModel(PlanCancellation.name)
    private cancellationModel: Model<PlanCancellation>,
  ) {}

  async create(data: Partial<PlanCancellation>): Promise<PlanCancellation> {
    const created = new this.cancellationModel(data);
    return created.save();
  }
}
