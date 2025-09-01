// entities/workspace.entity.ts

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class WorkspaceBasic {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field(() => User)
  owner: User;

  @Field(() => [String], { nullable: true })
  focusAreas?: string[];

  @Field()
  currentStep?: number;

  @Field()
  onboardingCompleted?: boolean;

  //haspaid
  @Field({ nullable: true })
  hasPaid?: boolean;

  // ---- Campos de empresa / perfil ----
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

  @Field({ nullable: true })
  defaultRequestsView?: string; // "List" o "Board"

  @Field({ nullable: true })
  quickLinks?: boolean; // Mostrar quick links en el dashboard

  @Field({ nullable: true })
  getStarted?: boolean; // Mostrar "Get Started" en el dashboard

  //plan
  @Field({ nullable: true })
  plan?: string; // ID del Plan actual del workspace

  @Field({ nullable: true })
  credits?: number; // Créditos disponibles en el workspace

  @Field({ nullable: true })
  stripeCustomerId?: string; // ID del cliente en Stripe

  @Field({ nullable: true })
  planCancelPending?: boolean;

  @Field({ nullable: true })
  planEndsAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class WorkspaceEntity {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field(() => User)
  owner: User;

  @Field(() => User, { nullable: true })
  successManager?: User;

  @Field(() => User, { nullable: true })
  pointOfContact?: User;

  @Field(() => [WorkspaceMemberEntity])
  members: WorkspaceMemberEntity[];

  // ---- Campos de empresa / perfil ----
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

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class WorkspaceMemberEntity {
  @Field(() => User)
  user: User;

  @Field()
  role: string;

  @Field()
  joinedAt: Date;
}
