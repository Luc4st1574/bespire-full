import { Field, InputType, ID } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class AddClientToCompanyInput {
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

  @Field(() => ID)
  @IsString()
  workspaceId: string; // ID del workspace existente al que se agregará

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ defaultValue: true })
  sendInvitation: boolean;
}
