import { Field, ObjectType, Float } from '@nestjs/graphql';
import { ClientWithWorkspaceInfo } from './client-with-workspace-info.output';

@ObjectType()
export class ClientPlan {
  @Field()
  name: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  bg?: string;
}

@ObjectType()
export class ClientExtended extends ClientWithWorkspaceInfo {
  // Plan information
  @Field(() => ClientPlan, { nullable: true })
  plan?: ClientPlan;

  // Rating (average from reviews)
  @Field(() => Float, { defaultValue: 0 })
  rating: number;

  // Time per request (average)
  @Field({ nullable: true })
  timeRequest?: string;

  // Average revisions per request
  @Field({ nullable: true })
  revisions?: string;

  // Last session date
  @Field({ nullable: true })
  lastSession?: Date;

  // Contract start date (subscription start)
  @Field({ nullable: true })
  contractStart?: Date;

  // Client status (new/recurring)
  @Field({ defaultValue: 'New' })
  status: string;

  // Additional metrics
  @Field({ defaultValue: 0 })
  totalRequests: number;

  @Field({ defaultValue: 0 })
  completedRequests: number;

  @Field({ defaultValue: 0 })
  totalRevisions: number;
}

//clientListForAdmin

@ObjectType()
export class ClientListAdmin {
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

  // Plan information
  @Field(() => ClientPlan, { nullable: true })
  plan?: ClientPlan;

  // Rating (average from reviews)
  @Field(() => Float, { defaultValue: 0 })
  rating: number;

  // Time per request (average)
  @Field({ nullable: true })
  timeRequest?: string;

  // Average revisions per request
  @Field({ nullable: true })
  revisions?: string;

  // Last session date
  @Field({ nullable: true })
  lastSession?: Date;

  // Contract start date (subscription start)
  @Field({ nullable: true })
  contractStart?: Date;

  // Client status (new/recurring)
  @Field({ defaultValue: 'New' })
  status: string;
}
