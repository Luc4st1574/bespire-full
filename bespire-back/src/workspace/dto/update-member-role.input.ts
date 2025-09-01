// dto/update-member-role.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateMemberRoleInput {
  @Field()
  workspaceId: string;
  @Field()
  memberId: string;
  @Field()
  role: string; // admin | user | viewer
}
