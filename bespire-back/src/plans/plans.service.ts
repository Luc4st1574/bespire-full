import { Injectable } from '@nestjs/common';
import { CreatePlanInput } from './dto/create-plan.input';
import { UpdatePlanInput } from './dto/update-plan.input';
import { InjectModel } from '@nestjs/mongoose';
import { Plan } from './scheme/plan.scheme';
import { Model } from 'mongoose';

@Injectable()
export class PlansService {
  constructor(@InjectModel(Plan.name) private planModel: Model<Plan>) {}
  async create(createPlanInput: CreatePlanInput) {
    //  return this.planModel.create(createPlanInput);
    // verificar que no exista un plan con el mismo slug
    return this.planModel.create(createPlanInput).catch((error) => {
      if (error.code === 11000) {
        // Duplicate key error
        throw new Error(
          `Plan with slug ${createPlanInput.slug} already exists.`,
        );
      }
      throw error; // Rethrow other errors
    });
  }

  findAll() {
    return `This action returns all plans`;
  }

  async findOne(filter: Record<string, any>) {
    return this.planModel.findOne(filter).exec();
  }

  async getPlanById(id: string) {
    return this.planModel.findById(id).exec();
  }

  update(id: number, updatePlanInput: UpdatePlanInput) {
    return `This action updates a #${id} plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
