// src/requests/dto/request-detail.output.ts
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RequestLink {
  @Field(() => String)
  url: string;
  @Field(() => String, { nullable: true })
  title?: string;
  @Field(() => String, { nullable: true })
  favicon?: string;
}

@ObjectType()
export class RequestAttachment {
  @Field(() => ID)
  id: string;
  @Field(() => String)
  name: string;
  @Field(() => String)
  url: string;
  @Field(() => String)
  ext: string;
  @Field(() => Number)
  size: number;
  @Field(() => String)
  uploadedBy: string;
  @Field(() => String)
  uploadedAt: string;
}

@ObjectType()
export class RequestAssignee {
  @Field(() => ID)
  id: string;
  @Field()
  name: string;
  @Field({ nullable: true })
  teamRole?: string;
  @Field({ nullable: true })
  avatarUrl?: string;
}

@ObjectType()
export class RequestComment {
  @Field(() => ID)
  id: string;
  @Field(() => RequestAssignee)
  user: RequestAssignee;
  @Field()
  createdAt: string;
  @Field({ nullable: true })
  text?: string;
  @Field()
  type: string; // 'activity' | 'comment'
  @Field({ nullable: true })
  activityText?: string;
}

@ObjectType()
export class RequestSubtask {
  @Field(() => ID)
  id: string;
  @Field()
  title: string;
  @Field()
  status: string;
  @Field()
  dueDate: string;
  @Field({ nullable: true })
  internalDueDate?: string; // Optional internal due date for subtasks
  @Field(() => [RequestAssignee])
  assignees: RequestAssignee[];
}

@ObjectType()
export class RequestClient {
  @Field(() => ID)
  id: string;
  @Field()
  name: string;
  @Field()
  avatar: string;
}

@ObjectType()
export class Requester {
  @Field(() => ID)
  id: string;
  @Field()
  name: string;
  @Field()
  avatarUrl: string;
  @Field()
  teamRole: string;
}

@ObjectType()
export class TimeSpent {
  @Field(() => Number)
  hours: number;
  @Field(() => Number)
  minutes: number;
}

@ObjectType()
export class RequestDetail {
  @Field(() => ID)
  id: string;
  @Field()
  title: string;
  @Field()
  details: string;
  @Field()
  priority: string;
  @Field()
  status: string;
  @Field(() => RequestClient)
  client: RequestClient;
  @Field(() => Requester)
  requester: Requester;
  @Field(() => [RequestAssignee])
  assignees: RequestAssignee[];
  @Field()
  createdAt: string;
  @Field()
  dueDate: string;
  @Field({ nullable: true })
  internalDueDate?: string;
  @Field(() => TimeSpent)
  timeSpent: TimeSpent;
  @Field()
  category: string;
  @Field()
  subType: string;
  @Field()
  credits: number;
  @Field(() => [RequestLink])
  links: RequestLink[];
  @Field(() => [RequestAttachment])
  attachments: RequestAttachment[];
  @Field(() => [RequestSubtask])
  subtasks: RequestSubtask[];
  @Field(() => [RequestComment])
  comments: RequestComment[];
  @Field(() => String, { nullable: true })
  parentRequest?: string; // ID of the parent request if this is a subtask
}
