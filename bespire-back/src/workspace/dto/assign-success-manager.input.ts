// src/workspaces/dto/assign-success-manager.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class AssignSuccessManagerInput {
  @Field(() => ID)
  workspaceId: string;

  @Field(() => ID)
  successManagerId: string;
}
