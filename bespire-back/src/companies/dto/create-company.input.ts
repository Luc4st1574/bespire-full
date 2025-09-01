import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateCompanyInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  size?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brandArchetype?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  communicationStyle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  elevatorPitch?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mission?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vision?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  valuePropositions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;
}
