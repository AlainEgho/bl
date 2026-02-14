import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ShortenerController } from './shortener.controller';
import { CreateShortUrlService } from '../application/shortener/create-short-url.service';
import { GetOriginalUrlService } from '../application/shortener/get-original-url.service';

describe('ShortenerController', () => {
  let controller: ShortenerController;
  let createShortUrl: CreateShortUrlService;
  let getOriginalUrl: GetOriginalUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        {
          provide: CreateShortUrlService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetOriginalUrlService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
    createShortUrl = module.get<CreateShortUrlService>(CreateShortUrlService);
    getOriginalUrl = module.get<GetOriginalUrlService>(GetOriginalUrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shorten', () => {
    it('should return short URL result from service', async () => {
      const result = {
        shortCode: 'abc12XYZ',
        shortUrl: '/s/abc12XYZ',
        fullUrl: 'https://example.com',
      };
      jest.spyOn(createShortUrl, 'execute').mockResolvedValue(result);

      const response = await controller.shorten({
        url: 'https://example.com',
      });

      expect(response).toEqual({
        ...result,
        originalUrl: 'https://example.com',
      });
      expect(createShortUrl.execute).toHaveBeenCalledWith({
        url: 'https://example.com',
      });
    });

    it('should throw BadRequestException when service throws', async () => {
      jest
        .spyOn(createShortUrl, 'execute')
        .mockRejectedValue(new Error('Invalid URL'));

      await expect(
        controller.shorten({ url: 'invalid' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('redirect', () => {
    it('should redirect to original URL when code exists', async () => {
      const res = {
        redirect: jest.fn().mockReturnThis(),
      } as unknown as Response;
      jest
        .spyOn(getOriginalUrl, 'execute')
        .mockResolvedValue('https://example.com');

      await controller.redirect('abc12XYZ', res);

      expect(getOriginalUrl.execute).toHaveBeenCalledWith('abc12XYZ');
      expect(res.redirect).toHaveBeenCalledWith(302, 'https://example.com');
    });

    it('should throw BadRequestException when short code not found', async () => {
      const res = { redirect: jest.fn() } as unknown as Response;
      jest.spyOn(getOriginalUrl, 'execute').mockResolvedValue(null);

      await expect(controller.redirect('unknown1', res)).rejects.toThrow(
        BadRequestException,
      );
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
