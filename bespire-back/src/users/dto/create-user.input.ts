import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  contactNumber?: string;

  @Field({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  companyRole?: string;
}

@InputType()
export class CreateUserInputByAdmin {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field()
  role: string;

  // Nuevo campo opcional teamRole solo para team_members
  @Field({ nullable: true })
  teamRole?: string;
}
