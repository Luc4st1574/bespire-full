// src/services/entities/service.entity.ts
import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Service {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  description?: string;

  @Field(() => Int)
  credits: number;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field(() => [String])
  inclusions: string[];

  @Field(() => [String])
  exclusions: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
