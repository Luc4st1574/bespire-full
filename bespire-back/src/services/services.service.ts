// src/services/services.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServiceInput } from './dto/create-service.input';
import { UpdateServiceInput } from './dto/update-service.input';
import { Service } from './schema/service.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  async create(createServiceInput: CreateServiceInput): Promise<Service> {
    return this.serviceModel.create(createServiceInput);
  }

  async findAllActive() {
    return this.serviceModel.find({ status: 'active' }).lean();
  }

  async findAll(): Promise<Service[]> {
    return this.serviceModel.find().exec();
  }

  async findOne(id: string): Promise<Service> {
    return this.serviceModel.findById(id).exec();
  }

  async update(
    id: string,
    updateServiceInput: UpdateServiceInput,
  ): Promise<Service> {
    return this.serviceModel.findByIdAndUpdate(id, updateServiceInput, {
      new: true,
    });
  }

  async remove(id: string): Promise<Service> {
    return this.serviceModel.findByIdAndDelete(id);
  }
}
