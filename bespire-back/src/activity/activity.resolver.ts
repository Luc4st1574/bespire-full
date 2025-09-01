import { Args, Query, Resolver } from '@nestjs/graphql';
import { ActivityService } from './activity.service';
import { ActivityLog } from './schema/activity.schema';

@Resolver()
export class ActivityResolver {
  constructor(private readonly activityService: ActivityService) {}

  @Query(() => [ActivityLog])
  async activityLogsByEntity(
    @Args('linkedToId') linkedToId: string,
    @Args('linkedToType') linkedToType: string,
  ): Promise<ActivityLog[]> {
    return this.activityService.findByLinkedEntity(linkedToId, linkedToType);
  }
}
