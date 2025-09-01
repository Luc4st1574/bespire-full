// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Notification extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field({ nullable: true })
  @Prop({ required: false })
  message?: string; // Optional for some types

  //avatar opcional
  @Field({ nullable: true })
  @Prop({ required: false })
  avatar?: string; // URL del avatar del usuario que genera la notificación

  @Field()
  @Prop({ required: true })
  type: string; //'comment', etc

  @Field()
  @Prop({ required: true })
  category: string; //'requests', 'library', etc

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId })
  linkedToId?: Types.ObjectId; // Puede ser request, comment, etc.

  @Field({ defaultValue: false })
  @Prop({ default: false })
  read: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
