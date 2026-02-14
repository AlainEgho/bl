import { Test, TestingModule } from '@nestjs/testing';
import { CreateShortUrlService } from './create-short-url.service';
import { SHORTENER_REPOSITORY } from '../../domain/shortener/shortener.repository.port';
describe('CreateShortUrlService', () => {
  let service: CreateShortUrlService;
  let repository: {
    save: jest.Mock;
    existsShortCode: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      save: jest.fn().mockResolvedValue(undefined),
      existsShortCode: jest.fn().mockResolvedValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateShortUrlService,
        {
          provide: SHORTENER_REPOSITORY,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<CreateShortUrlService>(CreateShortUrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a short URL and save it', async () => {
    const result = await service.execute({ url: 'https://example.com' });

    expect(result.fullUrl).toBe('https://example.com');
    expect(result.shortCode).toHaveLength(8);
    expect(result.shortUrl).toBe(`/s/${result.shortCode}`);
    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.fullUrl).toBe('https://example.com');
    expect(saved.shortCode).toBe(result.shortCode);
    expect(saved.clickCount).toBe(0);
    expect(saved.active).toBe(true);
  });

  it('should add https:// when URL has no scheme', async () => {
    const result = await service.execute({ url: 'example.com' });

    expect(result.fullUrl).toBe('https://example.com');
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ fullUrl: 'https://example.com' }),
    );
  });

  it('should trim URL before processing', async () => {
    const result = await service.execute({ url: '  https://example.com  ' });

    expect(result.fullUrl).toBe('https://example.com');
  });

  it('should throw on invalid URL', async () => {
    await expect(
      service.execute({ url: 'https://' }),
    ).rejects.toThrow('Invalid URL');
    await expect(
      service.execute({ url: '://missing-host' }),
    ).rejects.toThrow('Invalid URL');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should retry when short code already exists', async () => {
    let callCount = 0;
    repository.existsShortCode.mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount <= 2);
    });

    const result = await service.execute({ url: 'https://example.com' });

    expect(result.shortCode).toHaveLength(8);
    expect(repository.existsShortCode).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
