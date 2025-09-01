import { Field, ObjectType } from '@nestjs/graphql';
import { ClientPlan } from './client-extended.output';
import { Company } from 'src/companies/schema/company.schema';

@ObjectType()
export class ClientDetail {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  website?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  timezone?: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  organization?: string;

  @Field(() => ClientPlan, { nullable: true })
  plan?: ClientPlan;

  @Field({ nullable: true })
  contractStart?: Date;

  @Field({ nullable: true })
  contractRenew?: Date;

  @Field({ nullable: true })
  successManager?: string;

  //company data
  @Field({ nullable: true })
  companyId?: string;
  @Field({ nullable: true })
  companyData?: Company; // Adjust type as needed, e.g., Company type if defined
}
