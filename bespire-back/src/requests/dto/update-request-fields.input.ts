// src/requests/dto/update-request-fields.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateRequestFieldsInput {
  @Field(() => ID)
  requestId: string;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field({ nullable: true })
  internalDueDate?: Date;

  @Field({ nullable: true })
  details?: string;

  @Field({ nullable: true })
  title?: string;

  //status
  @Field({ nullable: true })
  status?: string;

  //priority
  @Field({ nullable: true })
  priority?: string;

  // Agrega aquí otros campos editables si los necesitas
}
