// src/files/dto/create-file.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateFileInput {
  @Field()
  name?: string;

  @Field()
  type?: 'file' | 'folder';

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  ext?: string;

  @Field({ nullable: true })
  size?: number;

  @Field({ nullable: true })
  parentId?: string;

  //status
  @Field({ nullable: true })
  status?: 'draft' | 'linked';

  @Field({ nullable: true })
  workspaceId?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  access?: ('All' | 'Team' | 'Private')[];

  @Field({ nullable: true })
  linkedToId?: string;

  @Field({ nullable: true })
  linkedToType?: 'request' | 'brand' | 'workspace' | 'user';
}
