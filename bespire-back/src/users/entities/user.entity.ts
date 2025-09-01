import { ObjectType, Field, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  //ID
  @Field(() => ID)
  _id: string;

  @Field({ nullable: true })
  lastName?: string;

  //firstName
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  teamRole?: string;
  @Field()
  email?: string;

  @Field()
  registrationStatus?: string;

  //hasVisitedDashboard
  @Field()
  hasVisitedDashboard?: boolean;
}
