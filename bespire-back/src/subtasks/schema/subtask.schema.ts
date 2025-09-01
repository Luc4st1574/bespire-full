import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Subtask extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Request', required: true })
  parentRequest: Types.ObjectId; // ID del Request principal

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee: Types.ObjectId;

  @Prop()
  status: string; // igual que el principal o más simple

  @Prop()
  dueDate: Date;

  // Si quieres puedes agregar: priority, files, comments, etc.
}

export const SubtaskSchema = SchemaFactory.createForClass(Subtask);
