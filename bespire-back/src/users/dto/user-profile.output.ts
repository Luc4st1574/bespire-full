import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class UserAssigneeOutput {
  @Field(() => ID)
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  teamRole?: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class UserProfileOutput {
  //ID
  @Field(() => ID)
  _id: string;

  @Field()
  email: string;

  //firstName
  @Field({ nullable: true })
  firstName?: string;

  //lastName
  @Field({ nullable: true })
  lastName?: string;

  //company
  @Field({ nullable: true })
  contactNumber?: string;

  //companyName
  @Field({ nullable: true })
  companyName?: string;

  //companyRole
  @Field({ nullable: true })
  companyRole?: string;

  //avatarUrl
  @Field({ nullable: true })
  avatarUrl?: string;

  //teamRole
  @Field(() => String, { nullable: true })
  teamRole?: string; // Puedes usar un enum o un string simple

  @Field()
  registrationStatus: string;

  @Field({ nullable: true })
  hasVisitedDashboard?: boolean; // <-- nuevo campo opcional

  //role
  @Field(() => String, { nullable: true })
  role?: string;

  //role
  @Field(() => String, { nullable: true })
  workspaceSelected: string;

  //isInternalTeam
  @Field({ nullable: true })
  isInternalTeam?: boolean; // <-- nuevo campo opcional

  //preferences
  @Field(() => GraphQLJSONObject, { nullable: true })
  preferences?: Record<string, any>;
}
