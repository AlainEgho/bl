import { ShortUrl } from '../../domain/shortener';
import { ShortenerRepository } from './shortener.repository';

describe('ShortenerRepository', () => {
  let repository: ShortenerRepository;

  beforeEach(() => {
    repository = new ShortenerRepository();
  });

  it('should save and find by short code', async () => {
    const data: Omit<ShortUrl, 'id'> = {
      shortCode: 'abc12345',
      fullUrl: 'https://example.com',
      userId: null,
      clickCount: 0,
      createdAt: new Date(),
      expiresAt: null,
      active: true,
    };

    const saved = await repository.save(data);

    expect(saved.id).toBeDefined();
    expect(saved.shortCode).toBe('abc12345');
    expect(saved.fullUrl).toBe('https://example.com');
    const found = await repository.findByShortCode('abc12345');
    expect(found).not.toBeNull();
    expect(found!.fullUrl).toBe('https://example.com');
    expect(await repository.existsShortCode('abc12345')).toBe(true);
  });

  it('should return null for unknown short code', async () => {
    expect(await repository.findByShortCode('unknown1')).toBeNull();
    expect(await repository.existsShortCode('unknown1')).toBe(false);
  });

  it('should return saved entity from save', async () => {
    const data: Omit<ShortUrl, 'id'> = {
      shortCode: 'xyz67890',
      fullUrl: 'https://other.com',
      userId: null,
      clickCount: 0,
      createdAt: new Date(),
      expiresAt: null,
      active: true,
    };

    const saved = await repository.save(data);

    expect(saved.id).toBeDefined();
    expect(saved.shortCode).toBe('xyz67890');
    expect(saved.fullUrl).toBe('https://other.com');
  });

  it('should increment click count', async () => {
    const data: Omit<ShortUrl, 'id'> = {
      shortCode: 'cnt12345',
      fullUrl: 'https://count.com',
      userId: null,
      clickCount: 0,
      createdAt: new Date(),
      expiresAt: null,
      active: true,
    };
    await repository.save(data);
    await repository.incrementClickCount('cnt12345');
    const found = await repository.findByShortCode('cnt12345');
    expect(found!.clickCount).toBe(1);
  });
});
