import { Field, InputType, ID } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class EditClientInfoInput {
  @Field(() => ID)
  @IsString()
  userId: string; // ID del usuario a editar

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
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

  // Campos de Company
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
}
