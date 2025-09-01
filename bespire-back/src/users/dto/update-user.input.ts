import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  // Para cambio de contraseña:
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  currentPassword?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
