// src/services/dto/create-service.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateServiceInput {
  @Field()
  title: string;

  @Field()
  description?: string;

  @Field(() => Int)
  credits: number;

  @Field()
  type: string;

  @Field({ defaultValue: 'active' })
  status?: 'active' | 'inactive';

  @Field(() => [String], { defaultValue: [] })
  inclusions?: string[];

  @Field(() => [String], { defaultValue: [] })
  exclusions?: string[];
}
