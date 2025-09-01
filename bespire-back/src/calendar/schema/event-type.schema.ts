import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class EventType extends Document {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  backgroundColor: string;

  @Field()
  @Prop({ required: true })
  borderColor: string;

  @Field(() => ID, {
    description:
      'Workspace this event type belongs to. If null, it is a global type.',
  })
  @Prop({ type: Types.ObjectId, ref: 'Workspace', default: null })
  workspaceId?: Types.ObjectId;
}

export const EventTypeSchema = SchemaFactory.createForClass(EventType);
