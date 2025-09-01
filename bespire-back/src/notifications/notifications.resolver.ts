import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationsService } from './notifications.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Notification } from './schema/notification.schema';
import { NotificationResponse } from './dto/notification-response.dto';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [NotificationResponse])
  @UseGuards(GqlAuthGuard)
  async notifications(
    @Context('req') req: any,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ) {
    return this.notificationsService.findAllByUser(req.user.sub, {
      skip,
      limit,
    });
  }

  @Query(() => Int)
  @UseGuards(GqlAuthGuard)
  async unreadNotificationsCount(@Context('req') req: any) {
    return this.notificationsService.countUnread(req.user.sub);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markNotificationAsRead(
    @Context('req') req: any,
    @Args('notificationId') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(notificationId, req.user.sub);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markAllNotificationsAsRead(@Context('req') req: any) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }
}
