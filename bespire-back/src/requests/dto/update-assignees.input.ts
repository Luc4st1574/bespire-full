// src/requests/dto/update-assignees.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateAssigneesInput {
  @Field(() => ID)
  requestId: string;

  @Field(() => [ID])
  assignees: string[];
}
