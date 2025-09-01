import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EditClientInfoResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  userId: string;

  @Field()
  companyId: string;

  @Field()
  workspaceId: string;
}
