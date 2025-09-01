// dto/update-workspace-company.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class UpdateWorkspaceCompanyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  companyImg?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyIndustry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companySize?: string;

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
}
