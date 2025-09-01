import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateWorkspaceInput {
  @Field()
  name: string;

  @Field()
  owner: string; // ObjectId del usuario owner

  @Field(() => [WorkspaceMemberInput], { nullable: true })
  members?: WorkspaceMemberInput[];

  @Field({ nullable: true })
  companyName?: string;

  @Field({ nullable: true })
  companyImg?: string;

  @Field({ nullable: true })
  companyWebsite?: string;

  @Field({ nullable: true })
  companyIndustry?: string;

  @Field({ nullable: true })
  companySize?: string;

  @Field(() => [String], { nullable: true })
  focusAreas?: string[];

  @Field({ nullable: true })
  hasPaid?: boolean;

  @Field({ nullable: true })
  onboardingCompleted?: boolean;

  @Field({ nullable: true })
  currentStep?: number;

  @Field({ nullable: true })
  credits?: number;

  @Field({ nullable: true })
  quickLinks?: boolean;

  @Field({ nullable: true })
  getStarted?: boolean;

  // ...otros campos que requieras según tu schema
}

@InputType()
export class WorkspaceMemberInput {
  @Field()
  user: string; // ObjectId (string) del user

  @Field()
  role: string; // "admin" | "user" | "viewer"

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  joinedAt?: Date;
}
