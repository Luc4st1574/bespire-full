import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ClientWithWorkspaceInfo {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  roleTitle?: string;

  @Field()
  workspaceId: string;

  @Field()
  workspaceName: string;

  @Field()
  companyId: string;

  @Field()
  companyName: string;

  @Field({ nullable: true })
  companyWebsite?: string;

  @Field({ nullable: true })
  companyLocation?: string;

  @Field()
  isWorkspaceOwner: boolean;

  @Field({ nullable: true })
  workspaceRole?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  countryCode?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  successManagerId?: string;

  @Field({ nullable: true })
  successManagerName?: string;
}
