export class ShortUrl {
  constructor(
    public readonly id: string,
    public readonly shortCode: string,
    public readonly originalUrl: string,
    public readonly createdAt: Date,
  ) {}
}
