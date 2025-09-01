import { Test, TestingModule } from '@nestjs/testing';
import { PlanCancellationResolver } from './plan-cancellation.resolver';
import { PlanCancellationService } from './plan-cancellation.service';

describe('PlanCancellationResolver', () => {
  let resolver: PlanCancellationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanCancellationResolver, PlanCancellationService],
    }).compile();

    resolver = module.get<PlanCancellationResolver>(PlanCancellationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
