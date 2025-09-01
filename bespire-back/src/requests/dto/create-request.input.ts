// src/requests/dto/create-request.input.ts
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class LinkInfoInput {
  @Field()
  url: string;
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  favicon?: string;
}

@InputType()
export class AttachmentInfoInput {
  @Field()
  name: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  ext?: string;

  @Field({ nullable: true })
  size?: number;

  @Field({ nullable: true })
  uploadedBy?: string;

  @Field({ nullable: true })
  uploadedAt?: Date;

  //fileId
  @Field(() => String, { nullable: true })
  fileId?: string; // ID of the file if this is an attachment
}

@InputType()
export class CreateRequestInput {
  @Field()
  title: string;

  @Field()
  details: string;

  @Field(() => ID)
  brand: string;

  @Field(() => ID)
  service: string;

  @Field({ nullable: true })
  dueDate?: string; // Recibes como string 'YYYY-MM-DD'

  @Field({ nullable: true })
  priority?: string; // high, medium, low, none

  @Field(() => [LinkInfoInput], { nullable: true })
  links?: LinkInfoInput[];

  @Field(() => [AttachmentInfoInput], { nullable: true })
  attachments?: AttachmentInfoInput[];

  @Field(() => ID)
  workspace: string;

  //parentRequest
  @Field(() => String, { nullable: true })
  parentRequest?: string; // ID of the parent request if this is a subtask
}
