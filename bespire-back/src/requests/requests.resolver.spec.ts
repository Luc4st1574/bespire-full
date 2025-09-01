import { Test, TestingModule } from '@nestjs/testing';
import { RequestsResolver } from './requests.resolver';
import { RequestsService } from './requests.service';

describe('RequestsResolver', () => {
  let resolver: RequestsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestsResolver, RequestsService],
    }).compile();

    resolver = module.get<RequestsResolver>(RequestsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
