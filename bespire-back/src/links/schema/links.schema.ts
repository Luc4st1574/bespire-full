// src/links/schemas/link.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Link extends Document {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true })
  @Field()
  url: string;

  @Prop()
  @Field({ nullable: true })
  title?: string;

  @Prop()
  @Field({ nullable: true })
  favicon?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => ID)
  createdBy: Types.ObjectId;
  @Field(() => ID)
  @Prop({ required: true, type: Types.ObjectId })
  linkedToId: Types.ObjectId;

  @Prop({ default: 'request' })
  @Field({ nullable: true })
  linkedToType?: 'request' | 'brand' | 'workspace' | 'user';

  @Field(() => Date)
  createdAt: Date;
  @Field(() => Date)
  updatedAt: Date;
}

export const LinkSchema = SchemaFactory.createForClass(Link);
