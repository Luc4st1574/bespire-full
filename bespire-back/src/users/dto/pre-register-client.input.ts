import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class PreRegisterClientInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(1)
  clientName: string;

  @Field()
  @IsString()
  @MinLength(1)
  roleTitle: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @Field()
  @IsString()
  @MinLength(1)
  companyName: string;

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
  teamRole?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ defaultValue: true })
  sendInvitation: boolean;

  @Field({ defaultValue: false })
  isTeamMember?: boolean;
}
