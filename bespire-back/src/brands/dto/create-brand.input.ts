import { InputType, Field, ID } from '@nestjs/graphql';
import { FontInput } from './font.input';
import { LogosInput } from './logos.input';

@InputType()
export class CreateBrandInput {
  @Field(() => String)
  name: string;

  @Field(() => ID)
  workspace: string;

  @Field(() => [LogosInput], { nullable: true })
  logos?: LogosInput[];

  @Field(() => [FontInput], { nullable: true })
  fonts?: FontInput[];

  @Field(() => [String], { nullable: true })
  primaryColors?: string[];

  @Field(() => [String], { nullable: true })
  secondaryColors?: string[];

  @Field(() => String, { nullable: true })
  archetype?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  buyer?: string;

  @Field(() => String, { nullable: true })
  tone?: string;

  @Field(() => [String], { nullable: true })
  likes?: string[];

  @Field(() => [String], { nullable: true })
  dislikes?: string[];
}
