import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendarService } from './calendar.service';
import { CalendarResolver } from './calendar.resolver';
import { CalendarEvent, CalendarEventSchema } from './schema/calendar.schema';
import { EventType, EventTypeSchema } from './schema/event-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CalendarEvent.name, schema: CalendarEventSchema },
      { name: EventType.name, schema: EventTypeSchema },
    ]),
  ],
  providers: [CalendarResolver, CalendarService],
})
export class CalendarModule {}
