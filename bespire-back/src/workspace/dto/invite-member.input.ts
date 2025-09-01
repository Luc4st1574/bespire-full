// dto/invite-member.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

@InputType()
export class InviteMemberInput {
  @Field()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsEnum(['admin', 'user', 'viewer'])
  role: 'admin' | 'user' | 'viewer';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  teamRole?: string; // Rol del miembro en el equipo (ej: 'Marketing',
}
