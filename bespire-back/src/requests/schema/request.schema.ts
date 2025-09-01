// src/requests/schemas/request.schema.ts
import { Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Request extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  details: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId; // quien crea la solicitud

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspace: Types.ObjectId; // Workspace al que pertenece la solicitud

  @Prop({ type: Types.ObjectId, ref: 'Brand' })
  brand?: Types.ObjectId; // si asocias con una marca

  @Prop({ type: Types.ObjectId, ref: 'Service' })
  service?: Types.ObjectId; // si asocias con un servicio

  @Prop({ default: 'queued' })
  status:
    | 'in_progress'
    | 'for_review'
    | 'for_approval'
    | 'revision'
    | 'completed'
    | 'queued'
    | 'needs_info'
    | 'cancelled';

  @Prop({ default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'none';

  @Prop()
  dueDate?: Date;

  //internal due date
  @Prop()
  internalDueDate?: Date;

  @Prop({ type: Number, default: 1 })
  credits: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignees: Types.ObjectId[];

  @Prop({
    type: {
      hours: { type: Number, default: 0 },
      minutes: { type: Number, default: 0 },
    },
    default: { hours: 0, minutes: 0 },
  })
  timeSpent: {
    hours: number;
    minutes: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'Request', default: null })
  parentRequest?: Types.ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Prop({ type: Date, default: null })
  completedAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
