import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateCalendarInput {
  @Field()
  title: string;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  allDay: boolean;

  @Field({ defaultValue: false })
  isArchived: boolean;

  @Field(() => ID)
  eventType: string;

  @Field(() => ID, { nullable: true })
  assignedToUser?: string;

  @Field(() => ID, { nullable: true })
  assignedToCompany?: string;

  @Field(() => [ID], { defaultValue: [] })
  invitedPeople: string[];

  @Field(() => ID)
  workspace: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ defaultValue: 'public' })
  visibility: 'public' | 'private';

  @Field({ nullable: true })
  notification?: string;

  @Field(() => [String], { nullable: true })
  links?: string[];

  @Field(() => [ID], { nullable: true })
  files?: string[];
}
