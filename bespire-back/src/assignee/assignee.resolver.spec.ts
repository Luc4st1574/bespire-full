import { Test, TestingModule } from '@nestjs/testing';
import { AssigneeResolver } from './assignee.resolver';
import { AssigneeService } from './assignee.service';

describe('AssigneeResolver', () => {
  let resolver: AssigneeResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssigneeResolver, AssigneeService],
    }).compile();

    resolver = module.get<AssigneeResolver>(AssigneeResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
