import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

type RequestWithStart = Request & { _startTime?: number };

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  use(req: RequestWithStart, res: Response, next: NextFunction): void {
    const start = Date.now();
    req._startTime = start;

    const url = req.originalUrl || req.url;
    const method = req.method;
    const body = safeClone(req.body);
    const query = safeClone(req.query);
    const headers = safeHeaders(req.headers);

    logger.debug('→ REQUEST', {
      method,
      url,
      query: Object.keys(query).length ? query : undefined,
      body: Object.keys(body).length ? body : undefined,
      headers,
      ip: req.ip || req.socket?.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    let responseBody: unknown;
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      responseBody = body;
      return originalJson(body);
    };
    const originalSend = res.send.bind(res);
    res.send = function (body: unknown) {
      if (responseBody === undefined) responseBody = body;
      return originalSend(body);
    };

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;

      logger.debug('← RESPONSE', {
        method,
        url,
        status,
        durationMs: duration,
        responseBody: responseBody !== undefined ? responseBody : undefined,
      });

      logger.info(`${method} ${url} ${status} ${duration}ms`);
    });

    next();
  }
}

function safeClone(obj: unknown): Record<string, unknown> {
  if (obj == null || typeof obj !== 'object') return {};
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return { _: '[non-serializable]' };
  }
}

function safeHeaders(h: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  const skip = ['authorization', 'cookie', 'cookie2'];
  for (const [k, v] of Object.entries(h)) {
    if (v === undefined) continue;
    const key = k.toLowerCase();
    if (skip.some((s) => key.includes(s))) {
      out[k] = '[redacted]';
    } else {
      out[k] = Array.isArray(v) ? v.join(', ') : String(v);
    }
  }
  return out;
}
