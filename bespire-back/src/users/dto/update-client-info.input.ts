import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

@InputType()
export class UpdateClientInfoInput {
  @Field()
  @IsString()
  clientId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  clientName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  roleTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  workspaceRole?: string;

  // Campos de company (solo si es owner del workspace)
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyLocation?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successManager?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  sendConfirmation: boolean;
}
