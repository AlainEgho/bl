import { Test, TestingModule } from '@nestjs/testing';
import { GetOriginalUrlService } from './get-original-url.service';
import { SHORTENER_REPOSITORY } from '../../domain/shortener/shortener.repository.port';

describe('GetOriginalUrlService', () => {
  let service: GetOriginalUrlService;
  let repository: { findByShortCode: jest.Mock };

  beforeEach(async () => {
    repository = {
      findByShortCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOriginalUrlService,
        {
          provide: SHORTENER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<GetOriginalUrlService>(GetOriginalUrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return original URL when short code exists', async () => {
    const shortUrl = {
      id: '1',
      shortCode: 'abc12345',
      originalUrl: 'https://example.com',
      createdAt: new Date(),
    };
    repository.findByShortCode.mockResolvedValue(shortUrl);

    const result = await service.execute('abc12345');

    expect(result).toBe('https://example.com');
    expect(repository.findByShortCode).toHaveBeenCalledWith('abc12345');
  });

  it('should return null when short code does not exist', async () => {
    repository.findByShortCode.mockResolvedValue(null);

    const result = await service.execute('unknown1');

    expect(result).toBeNull();
    expect(repository.findByShortCode).toHaveBeenCalledWith('unknown1');
  });
});
