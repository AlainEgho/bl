import { ShortUrl } from '../../domain/shortener';
import { ShortenerRepository } from './shortener.repository';

describe('ShortenerRepository', () => {
  let repository: ShortenerRepository;

  beforeEach(() => {
    repository = new ShortenerRepository();
  });

  it('should save and find by short code', async () => {
    const shortUrl = new ShortUrl(
      'id-1',
      'abc12345',
      'https://example.com',
      new Date(),
    );

    await repository.save(shortUrl);

    const found = await repository.findByShortCode('abc12345');
    expect(found).toEqual(shortUrl);
    expect(await repository.existsShortCode('abc12345')).toBe(true);
  });

  it('should return null for unknown short code', async () => {
    expect(await repository.findByShortCode('unknown1')).toBeNull();
    expect(await repository.existsShortCode('unknown1')).toBe(false);
  });

  it('should return saved entity from save', async () => {
    const shortUrl = new ShortUrl(
      'id-2',
      'xyz67890',
      'https://other.com',
      new Date(),
    );

    const saved = await repository.save(shortUrl);

    expect(saved).toBe(shortUrl);
  });
});
