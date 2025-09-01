import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RemoveMemberInput {
  @Field()
  workspaceId: string;
  @Field()
  memberId: string;
}
