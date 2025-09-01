// src/services/dto/update-service.input.ts
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateServiceInput } from './create-service.input';

@InputType()
export class UpdateServiceInput extends PartialType(CreateServiceInput) {
  @Field()
  id: string;
}
