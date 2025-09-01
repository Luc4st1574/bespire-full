import { Resolver } from '@nestjs/graphql';
import { PlanCancellationService } from './plan-cancellation.service';

@Resolver()
export class PlanCancellationResolver {
  constructor(
    private readonly planCancellationService: PlanCancellationService,
  ) {}
}
