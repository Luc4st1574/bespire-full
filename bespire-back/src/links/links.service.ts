import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Link } from './schema/links.schema';
import { Model, Types } from 'mongoose';
import { CreateLinkInput } from './dto/create-link.input';

@Injectable()
export class LinksService {
  constructor(@InjectModel(Link.name) private linkModel: Model<Link>) {}
  async create(input: CreateLinkInput, userId: string): Promise<Link> {
    const linkedToId = new Types.ObjectId(input.linkedToId);
    delete input.linkedToId; // Elimina el campo para evitar duplicados
    return this.linkModel.create({
      ...input,
      linkedToId,
      createdBy: new Types.ObjectId(userId),
    });
  }

  async findByLinkedToId(linkedToId: string): Promise<Link[]> {
    const linkedToIdObject = new Types.ObjectId(linkedToId);
    return this.linkModel
      .find({ linkedToId: linkedToIdObject })
      .sort({ createdAt: -1 })
      .lean();
  }

  async delete(linkId: string, userId: string): Promise<boolean> {
    // Opcional: Solo permitir que el creador lo borre, o admin
    const linkIdObject = new Types.ObjectId(linkId);
    const userIdObject = new Types.ObjectId(userId);
    const result = await this.linkModel.deleteOne({
      _id: linkIdObject,
      createdBy: userIdObject,
    });
    return result.deletedCount > 0;
  }
}
