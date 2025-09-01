import { CreateBrandInput } from './create-brand.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateBrandInput extends PartialType(CreateBrandInput) {
  @Field(() => ID)
  id: string;
}
