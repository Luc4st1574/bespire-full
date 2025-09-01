import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Font } from './font.entity';
import { Logos } from './logos.entity';

@ObjectType()
export class Brand {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  slug: string; // 'my-brand', 'another-brand'

  @Field(() => String)
  name: string;

  @Field(() => String)
  user: string;

  @Field(() => String)
  workspace: string;

  @Field(() => [Logos], { nullable: true })
  logos?: Logos[];

  @Field(() => [Font], { nullable: true })
  fonts?: Font[];

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

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
