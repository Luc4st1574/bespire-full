import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@Schema({ timestamps: true })
@ObjectType()
export class ActivityLog extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId })
  linkedToId: Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  linkedToType: 'request' | 'subtask' | 'brand' | 'other';

  @Field(() => String)
  @Prop({ required: true })
  action: string;

  @Field(() => String, { nullable: true })
  @Prop()
  activityText?: string;

  @Field(() => GraphQLJSON, { nullable: true }) // 👈 Usa esto para objetos libres
  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
