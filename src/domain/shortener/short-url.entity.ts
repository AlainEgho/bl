export class ShortUrl {
  constructor(
    public readonly id: number,
    public readonly shortCode: string,
    public readonly fullUrl: string,
    public readonly userId: number | null,
    public readonly clickCount: number,
    public readonly createdAt: Date,
    public readonly expiresAt: Date | null,
    public readonly active: boolean,
  ) {}
}
