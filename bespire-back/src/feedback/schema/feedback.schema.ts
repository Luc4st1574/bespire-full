import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  details: string;

  @Prop({ default: false })
  sendCopy: boolean;

  // createdAt y updatedAt se añaden automáticamente por `timestamps: true`
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
