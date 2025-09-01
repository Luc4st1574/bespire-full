import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LogosInput {
  @Field(() => String)
  url: string;

  //fileId
  @Field(() => String, { nullable: true })
  fileId?: string; // ID del archivo asociado a la fuente, si aplica
}
