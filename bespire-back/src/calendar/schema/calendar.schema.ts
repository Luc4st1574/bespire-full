import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema()
class RecurrenceRule {
  @Field()
  @Prop()
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @Field({ nullable: true })
  @Prop()
  until?: Date;
}

@ObjectType()
@Schema({ timestamps: true })
export class CalendarEvent extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  @Field()
  @Prop({ required: true })
  startDate: Date;

  @Field({ nullable: true })
  @Prop()
  endDate?: Date;

  @Field()
  @Prop({ default: false })
  allDay: boolean;

  @Field()
  @Prop({ default: false })
  isArchived: boolean;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'EventType', required: true })
  eventType: Types.ObjectId;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedToUser?: Types.ObjectId;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  assignedToCompany?: Types.ObjectId;

  @Field(() => [ID], { description: 'People invited to the event' })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  invitedPeople: Types.ObjectId[];

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspace: Types.ObjectId;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Field({ nullable: true })
  @Prop({ type: String, enum: ['public', 'private'], default: 'public' })
  visibility: 'public' | 'private';

  @Field({ nullable: true })
  @Prop()
  location?: string;

  @Field({ nullable: true })
  @Prop({ type: String, enum: ['none', '5m', '15m', '1h', '1d'] })
  notification?: string;

  @Field(() => RecurrenceRule, { nullable: true })
  @Prop({ type: RecurrenceRule, default: null })
  recurrence?: RecurrenceRule;
}

export const CalendarEventSchema = SchemaFactory.createForClass(CalendarEvent);
