import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UpdateClientInfoResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  clientId?: string;

  @Field({ nullable: true })
  workspaceId?: string;

  @Field({ nullable: true })
  companyId?: string;
}
