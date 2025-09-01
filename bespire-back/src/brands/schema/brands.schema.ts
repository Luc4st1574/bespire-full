// plan.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Brand extends Document {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId; // cliente

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspace: Types.ObjectId; // Workspace al que pertenece la solicitud

  // Nuevos campos usados por el front
  @Prop({
    type: [{ url: String, fileId: { type: Types.ObjectId, ref: 'File' } }],
    default: [],
  })
  logos: { url: string; fileId?: Types.ObjectId }[];

  // Fonts ahora es un array de objetos con url, name y category y fileId
  @Prop({
    type: [
      {
        url: String,
        name: String,
        category: String,
        fileId: { type: Types.ObjectId, ref: 'File' },
      },
    ],
    default: [],
  })
  fonts: {
    url: string;
    name?: string;
    category?: string;
    fileId?: Types.ObjectId;
  }[];

  @Prop({ type: [String], default: [] })
  primaryColors: string[];

  @Prop({ type: [String], default: [] })
  secondaryColors: string[];

  @Prop({ type: String, default: null })
  archetype: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: String, default: null })
  buyer: string;

  @Prop({ type: String, default: null })
  tone: string;

  @Prop({ type: [String], default: [] })
  likes: string[];

  @Prop({ type: [String], default: [] })
  dislikes: string[];
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
