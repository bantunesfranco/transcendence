import { Test, TestingModule } from '@nestjs/testing';
import { SpriteService } from './sprite.service';

describe('SpriteService', () => {
  let service: SpriteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpriteService],
    }).compile();

    service = module.get<SpriteService>(SpriteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
