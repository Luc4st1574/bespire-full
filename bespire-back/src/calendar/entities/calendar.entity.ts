import { ObjectType, Field, ID, createUnionType } from '@nestjs/graphql';
import { EventTypeEntity } from './event-type.entity';
import { UserAssigned } from 'src/requests/entities/request.entity';
import { Link } from 'src/links/schema/links.schema';
import { File } from 'src/files/schema/files.schema';
import { Company } from 'src/companies/schema/company.schema';

export const AssignedToUnion = createUnionType({
  name: 'AssignedTo',
  types: () => [UserAssigned, Company] as const,
});

@ObjectType()
export class Calendar {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  start: Date;

  @Field()
  end: Date;

  @Field()
  allDay: boolean;

  @Field()
  isArchived: boolean;

  @Field(() => EventTypeEntity)
  eventType: EventTypeEntity;

  @Field(() => AssignedToUnion, { nullable: true })
  assignedTo?: typeof AssignedToUnion;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  location?: string;

  @Field(() => [UserAssigned])
  invitedPeople: UserAssigned[];

  @Field()
  visibility: string;

  @Field({ nullable: true })
  notification?: string;

  @Field(() => [Link])
  links: Link[];

  @Field(() => [File])
  files: File[];
}
