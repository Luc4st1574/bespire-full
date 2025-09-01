import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType()
export class CompanyDto {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  brandArchetype?: string;

  @Field({ nullable: true })
  communicationStyle?: string;

  @Field({ nullable: true })
  elevatorPitch?: string;

  @Field({ nullable: true })
  mission?: string;

  @Field({ nullable: true })
  vision?: string;

  @Field({ nullable: true })
  valuePropositions?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => ID)
  createdBy: Types.ObjectId | string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
