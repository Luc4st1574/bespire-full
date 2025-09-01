// src/services/schemas/service.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: true })
  credits: number; // Cuántos créditos cuesta este servicio

  @Prop({ default: 'regular' })
  type: string; // Regular, Motion Graphics, etc.

  @Prop({ default: 'active' })
  status: 'active' | 'inactive';

  @Prop({ type: [String], default: [] })
  inclusions: string[]; // Listado de inclusiones

  @Prop({ type: [String], default: [] })
  exclusions: string[]; // Listado de exclusiones
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
