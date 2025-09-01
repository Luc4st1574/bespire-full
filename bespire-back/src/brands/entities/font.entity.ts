import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Font {
  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  //family
  @Field(() => String, { nullable: true })
  family?: string;

  //fileId
  @Field(() => String, { nullable: true })
  fileId?: string; // ID del archivo asociado a la fuente
}
