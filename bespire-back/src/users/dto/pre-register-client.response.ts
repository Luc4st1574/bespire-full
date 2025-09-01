import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PreRegisterClientResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  companyId?: string;

  @Field()
  workspaceId: string;
}
