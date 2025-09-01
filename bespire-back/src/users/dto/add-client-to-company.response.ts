import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AddClientToCompanyResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field()
  userId: string;

  @Field()
  workspaceId: string;
}
