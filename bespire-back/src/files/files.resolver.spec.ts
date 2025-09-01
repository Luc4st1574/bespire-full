import { Test, TestingModule } from '@nestjs/testing';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';

describe('FilesResolver', () => {
  let resolver: FilesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilesResolver, FilesService],
    }).compile();

    resolver = module.get<FilesResolver>(FilesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
