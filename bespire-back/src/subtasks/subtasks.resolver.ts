import { Resolver } from '@nestjs/graphql';
import { SubtasksService } from './subtasks.service';

@Resolver()
export class SubtasksResolver {
  constructor(private readonly subtasksService: SubtasksService) {}
}
