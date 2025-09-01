// src/workspace/dto/update-workspace-settings.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateWorkspaceSettingsInput {
  @Field({ nullable: true })
  workspaceName?: string;

  @Field({ nullable: true })
  defaultRequestsView?: string;

  @Field({ nullable: true })
  quickLinks?: boolean;

  @Field({ nullable: true })
  getStarted?: boolean;
}
