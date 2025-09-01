// src/files/schemas/file.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class File extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string; // Nombre del archivo o carpeta

  @Field()
  @Prop({ enum: ['file', 'folder'], required: true })
  type: 'file' | 'folder';

  // Solo para archivos
  @Field({ nullable: true })
  @Prop()
  url?: string;

  @Field({ nullable: true })
  @Prop()
  ext?: string; // "pdf", "docx", "png", etc.

  @Field({ nullable: true })
  @Prop()
  size?: number; // en bytes

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;

  @Field({ nullable: true })
  @Prop({ type: Date })
  uploadedAt?: Date;

  // Jerarquía de carpetas
  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'File', default: null })
  parentId?: Types.ObjectId | null; // null = raíz

  // Multi-tenant
  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Workspace' })
  workspaceId?: Types.ObjectId;

  // Papelera (soft delete)
  @Field({ nullable: true })
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Field({ nullable: true })
  @Prop({ enum: ['draft', 'linked'], default: 'draft' })
  status?: 'draft' | 'linked';

  @Field(() => [String], { nullable: true })
  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  @Prop({
    type: [String],
    default: ['All'],
    enum: ['All', 'Team', 'Private'],
  })
  access?: string[]; // ["All", "Team", "Private"]

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId })
  linkedToId?: Types.ObjectId;

  @Field({ nullable: true })
  @Prop()
  linkedToType?: 'request' | 'brand' | 'workspace' | 'user';

  @Field({ nullable: true })
  @Prop({ default: '' })
  lowercaseName?: string; // Guarda siempre el nombre en minúsculas

  // timestamps
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export type FileDocument = File & Document;
export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.index(
  { workspaceId: 1, parentId: 1, lowercaseName: 1, type: 1 },
  { unique: true },
);

// Pre-save hook para minúsculas
FileSchema.pre('save', function (next) {
  if (this.name) this.lowercaseName = this.name.toLowerCase();
  next();
});
