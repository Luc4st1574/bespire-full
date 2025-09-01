// src/companies/schemas/company.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Schema({ timestamps: true })
export class Company extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field({ nullable: true })
  @Prop()
  website?: string;

  @Field({ nullable: true })
  @Prop()
  industry?: string;

  @Field({ nullable: true })
  @Prop()
  size?: string; // "1-10", "11-50", etc.

  @Field({ nullable: true })
  @Prop()
  logoUrl?: string;

  @Field({ nullable: true })
  @Prop()
  location?: string;

  @Field({ nullable: true })
  @Prop()
  brandArchetype?: string; // Ej: 'The Hero'
  @Field({ nullable: true })
  @Prop()
  communicationStyle?: string;
  @Field({ nullable: true })
  @Prop()
  elevatorPitch?: string;
  @Field({ nullable: true })
  @Prop()
  mission?: string;
  @Field({ nullable: true })
  @Prop()
  vision?: string;
  @Field({ nullable: true })
  @Prop()
  valuePropositions?: string; // O array de strings si quieres múltiples

  @Field({ nullable: true })
  @Prop()
  notes?: string;
  @Field({ nullable: true })
  @Prop()
  contactNumber?: string; // <-- nuevo campo opcional
  @Field({ nullable: true })
  @Prop()
  countryCode?: string; // <-- nuevo campo para código de país

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
