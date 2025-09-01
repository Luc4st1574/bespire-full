// src/links/dto/create-link.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateLinkInput {
  @Field()
  url: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  favicon?: string;

  @Field()
  linkedToId: string;

  @Field({ nullable: true })
  linkedToType?: 'request' | 'brand' | 'workspace' | 'user';
}
