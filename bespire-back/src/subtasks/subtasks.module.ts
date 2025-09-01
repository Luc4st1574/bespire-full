import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { SubtasksResolver } from './subtasks.resolver';

@Module({
  providers: [SubtasksResolver, SubtasksService],
})
export class SubtasksModule {}
