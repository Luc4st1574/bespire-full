import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Logos {
  @Field(() => String)
  url: string;

  //fileId
  @Field(() => String, { nullable: true })
  fileId?: string; // ID del archivo asociado a la fuente, si aplica

  //name
  @Field(() => String, { nullable: true })
  name?: string; // Nombre de la fuente, si aplica
}
