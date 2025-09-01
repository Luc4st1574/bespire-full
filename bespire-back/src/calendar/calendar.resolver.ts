import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { CalendarService } from './calendar.service';
import { Calendar } from './entities/calendar.entity';
import { CreateCalendarInput } from './dto/create-calendar.input';
import { UpdateCalendarInput } from './dto/update-calendar.input';
import { EventTypeEntity } from './entities/event-type.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';

@Resolver(() => Calendar)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class CalendarResolver {
  constructor(private readonly calendarService: CalendarService) {}

  @Mutation(() => Calendar)
  @Permissions(PERMISSIONS.CREATE_CALENDAR_EVENTS)
  createCalendar(
    @Args('createCalendarInput') createCalendarInput: CreateCalendarInput,
    @Context() context,
  ) {
    const userId = context.req.user.sub;
    return this.calendarService.create(createCalendarInput, userId);
  }

  @Query(() => [Calendar], { name: 'calendar' })
  @Permissions(PERMISSIONS.VIEW_CALENDAR_EVENTS)
  findAll(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('start', { type: () => String }) start: string,
    @Args('end', { type: () => String }) end: string,
  ) {
    return this.calendarService.findAll(workspaceId, start, end);
  }

  @Query(() => Calendar, { name: 'calendarEvent' })
  @Permissions(PERMISSIONS.VIEW_CALENDAR_EVENTS)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.calendarService.findOne(id);
  }

  @Mutation(() => Calendar)
  @Permissions(PERMISSIONS.EDIT_CALENDAR_EVENTS)
  updateCalendar(
    @Args('updateCalendarInput') updateCalendarInput: UpdateCalendarInput,
  ) {
    return this.calendarService.update(
      updateCalendarInput.id,
      updateCalendarInput,
    );
  }

  @Mutation(() => Calendar)
  @Permissions(PERMISSIONS.DELETE_CALENDAR_EVENTS)
  removeCalendar(@Args('id', { type: () => ID }) id: string) {
    return this.calendarService.remove(id);
  }

  @Query(() => [EventTypeEntity], { name: 'eventTypes' })
  @Permissions(PERMISSIONS.VIEW_CALENDAR_EVENTS)
  findEventTypes(@Args('workspaceId', { type: () => ID }) workspaceId: string) {
    return this.calendarService.findEventTypes(workspaceId);
  }
}
