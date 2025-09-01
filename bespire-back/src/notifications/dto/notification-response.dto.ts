// src/notifications/dto/notification-response.dto.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Notification } from '../schema/notification.schema';

@ObjectType()
export class NotificationResponse implements Partial<Notification> {
  @Field(() => ID)
  _id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  message?: string;

  @Field()
  type: string;

  @Field()
  category: string;

  @Field({ defaultValue: false })
  read: boolean;

  @Field(() => Date)
  date: Date;

  @Field({ nullable: true })
  avatar?: string; // <--- Avatar del usuario
}
