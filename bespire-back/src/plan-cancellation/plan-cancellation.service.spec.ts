import { Test, TestingModule } from '@nestjs/testing';
import { PlanCancellationService } from './plan-cancellation.service';

describe('PlanCancellationService', () => {
  let service: PlanCancellationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanCancellationService],
    }).compile();

    service = module.get<PlanCancellationService>(PlanCancellationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
