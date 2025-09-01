import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Company } from './schema/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
  ) {}

  /**
   * Crear una nueva compañía
   */
  async create(data: {
    name: string;
    website?: string;
    industry?: string;
    size?: string;
    logoUrl?: string;
    location?: string;
    brandArchetype?: string;
    communicationStyle?: string;
    elevatorPitch?: string;
    mission?: string;
    vision?: string;
    valuePropositions?: string;
    notes?: string;
    createdBy: Types.ObjectId | string;
  }): Promise<Company> {
    const company = new this.companyModel(data);
    return company.save();
  }

  /**
   * Buscar una compañía por ID
   */
  async findById(id: string): Promise<Company> {
    return this.companyModel.findById(id).exec();
  }

  /**
   * Buscar compañía por nombre
   */
  async findByName(name: string): Promise<Company> {
    return this.companyModel.findOne({ name }).exec();
  }

  /**
   * Listar todas las compañías con opciones de paginación y búsqueda
   */
  async findAll(options: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<Company[]> {
    const { skip = 0, limit = 20, search } = options;

    let query = this.companyModel.find();

    // Si hay búsqueda, filtramos por nombre
    if (search) {
      query = query.find({
        name: { $regex: search, $options: 'i' },
      });
    }

    return query.sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  /**
   * Contar el total de compañías (útil para paginación)
   */
  async count(search?: string): Promise<number> {
    if (search) {
      return this.companyModel
        .countDocuments({
          name: { $regex: search, $options: 'i' },
        })
        .exec();
    }
    return this.companyModel.countDocuments().exec();
  }

  /**
   * Actualizar una compañía
   */
  async update(
    id: string,
    data: Partial<Omit<Company, '_id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Company> {
    console.log('Updating company with ID:', id, 'Data:', data);
    return this.companyModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();
  }

  /**
   * Eliminar una compañía
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.companyModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  /**
   * Buscar compañías por criterios
   */
  async findByCriteria(criteria: Record<string, any>): Promise<Company[]> {
    return this.companyModel.find(criteria).exec();
  }

  /**
   * Buscar compañías por industria
   */
  async findByIndustry(industry: string): Promise<Company[]> {
    return this.companyModel.find({ industry }).exec();
  }

  /**
   * Buscar compañías creadas por un usuario
   */
  async findByCreatedBy(userId: string | Types.ObjectId): Promise<Company[]> {
    return this.companyModel.find({ createdBy: userId }).exec();
  }
}
