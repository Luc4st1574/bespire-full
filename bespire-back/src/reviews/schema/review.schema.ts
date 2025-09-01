// src/reviews/schemas/review.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Review extends Document {
  @Field(() => ID)
  _id: string;

  /** Quién hace la review */
  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  reviewer: Types.ObjectId;

  /** ID del objeto al que se le hace la review */
  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId })
  linkedToId: Types.ObjectId;

  /** Tipo de objeto al que se le hace la review */
  @Field(() => String)
  @Prop({ required: true })
  linkedToType: 'request' | 'subtask' | 'brand' | 'other';

  /** Puntuación numérica, ej. 1–5 */
  @Field(() => Int)
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  /** Comentario opcional */
  @Field({ nullable: true })
  @Prop()
  feedback?: string;

  /** Timestamps automáticos */
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
