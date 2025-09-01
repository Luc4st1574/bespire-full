// src/comments/schemas/comment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';
@Schema({ timestamps: true })
@ObjectType()
export class Comment extends Document {
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
  @Prop()
  text: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
