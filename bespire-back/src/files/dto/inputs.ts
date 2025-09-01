// src/files/dto/inputs.ts
import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateFolderInput {
  @Field() name: string;
  @Field(() => ID) workspaceId: string;
  @Field(() => ID, { nullable: true }) parentId?: string;
  @Field(() => [String], { nullable: true }) tags?: string[]; // nombres
  @Field(() => [String], { nullable: true }) access?: (
    | 'All'
    | 'Team'
    | 'Private'
  )[];
  @Field()
  type: 'file' | 'folder';
}
