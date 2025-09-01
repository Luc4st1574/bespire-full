// src/files/schemas/tag.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Tag extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true, index: true })
  lowercaseName: string;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Field(() => ID, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}
export type TagDocument = Tag & Document;
export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.index({ workspaceId: 1, lowercaseName: 1 }, { unique: true });
TagSchema.pre('save', function (next) {
  if (this.name) this.lowercaseName = this.name.toLowerCase();
  next();
});
