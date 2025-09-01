import { CreateCalendarInput } from './create-calendar.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateCalendarInput extends PartialType(CreateCalendarInput) {
  @Field(() => ID)
  id: string;
}
