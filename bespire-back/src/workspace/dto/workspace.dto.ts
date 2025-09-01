import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceCompanyQuery {
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

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  brandArchetype?: string;

  @Field({ nullable: true })
  communicationStyle?: string;

  @Field({ nullable: true })
  elevatorPitch?: string;

  @Field({ nullable: true })
  mission?: string;

  @Field({ nullable: true })
  vision?: string;

  @Field({ nullable: true })
  valuePropositions?: string;
}
