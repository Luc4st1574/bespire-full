// src/assignees/dto/assignee-output.dto.ts
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { RequestAssignee } from 'src/requests/dto/request-detail.output';

@ObjectType()
export class AssigneeOutput {
  @Field(() => ID)
  _id: string;

  @Field()
  linkedToId: string;

  @Field()
  linkedToType: string;

  @Field(() => RequestAssignee, { nullable: true })
  user: RequestAssignee;

  @Field(() => ID)
  assignedBy: string;

  @Field(() => Date)
  createdAt: Date;
}
