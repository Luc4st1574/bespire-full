// src/assignees/schemas/assignee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Assignee extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId })
  linkedToId: Types.ObjectId;

  @Prop({ required: true, default: 'request' })
  @Field()
  linkedToType: string; // 'request', 'sales', 'brand', etc.

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => ID)
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => ID)
  assignedBy: Types.ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const AssigneeSchema = SchemaFactory.createForClass(Assignee);
