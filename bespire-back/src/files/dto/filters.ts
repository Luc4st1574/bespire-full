// src/files/dto/filters.ts (opcional, para listar)
import { Field, ID, InputType } from '@nestjs/graphql';
@InputType()
export class ListFilesInput {
  @Field() workspaceId: string;
  @Field({ nullable: true }) parentId?: string; // null/omitido = raíz
  @Field({ nullable: true }) search?: string;
  @Field({ nullable: true }) includeDeleted?: boolean;
  //type
  @Field({ nullable: true }) type?: string; // 'document', 'folder', etc.
}
