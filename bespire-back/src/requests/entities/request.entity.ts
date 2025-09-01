import { ObjectType, Field, Int, ID, InputType } from '@nestjs/graphql';
import { Brand } from 'src/brands/entities/brand.entity';
import { Service } from 'src/services/entities/service.entity';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
export class LinkInfo {
  @Field()
  url: string;
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  favicon?: string;
}

@ObjectType()
export class AttachmentInfo {
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
}

@ObjectType()
export class UserAssigned {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  teamRole?: string;
}

@ObjectType()
export class RequestResponseForList {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  client?: string;

  @Field()
  createdAt: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  dueDate?: string;

  @Field(() => [UserAssigned])
  assignees: UserAssigned[];

  @Field(() => Int)
  commentsCount: number;

  @Field(() => Int)
  attachmentsCount: number;

  @Field(() => Int)
  subtasksCount: number;

  @Field(() => Int)
  credits?: number;

  @Field(() => String, { nullable: true })
  parentRequest?: string;

  @Field()
  priority: 'low' | 'medium' | 'high' | 'none';

  @Field()
  status: string;
}

@ObjectType()
export class RequestResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  //brand
  @Field(() => Brand)
  brand: Brand; // Relaciona con la marca

  //priority
  @Field(() => String)
  priority: string; // 'low', 'medium', 'high'

  //dueDate
  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  @Field(() => Int)
  credits: number;

  //service
  @Field(() => Service)
  service: Service; // Relaciona con el servicio

  @Field(() => String)
  status: string; // 'pending', 'in_progress', 'completed', etc.

  @Field(() => [LinkInfo])
  links: LinkInfo[]; // Servicios incluidos

  @Field(() => [AttachmentInfo])
  attachments: AttachmentInfo[]; // Servicios excluidos

  //user
  //brand
  @Field(() => User)
  createdBy: User; // Relaciona con el user que creo

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RequestCreateResponse {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  title: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
