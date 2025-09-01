import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class TeamMemberInput {
  @Field()
  email: string;

  @Field()
  role: string;
}

@InputType()
export class CompanyInfoInput {
  @Field()
  logo?: string;

  @Field()
  companyName: string;

  @Field()
  industry: string;

  @Field()
  location: string;

  @Field()
  website: string;

  @Field()
  size: string;

  @Field()
  brandArchetype: string;

  @Field()
  elevatorPitch: string;
}

@InputType()
export class OnboardingInput {
  @Field()
  plan: string;

  @Field(() => [String])
  focusAreas: string[];

  @Field(() => [TeamMemberInput])
  teamMembers: TeamMemberInput[];

  @Field(() => CompanyInfoInput)
  companyInfo: CompanyInfoInput;

  @Field(() => Int, { nullable: true })
  currentStep?: number; // 👈 AÑADIR ESTO
}
