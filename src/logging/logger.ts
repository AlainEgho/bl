import * as path from 'path';
import * as fs from 'fs';
// require() ensures winston.format is available at runtime (avoids ESM/CommonJS interop issues)
const winston: typeof import('winston') = require('winston');

const LOG_LEVEL = process.env.LOG_LEVEL ?? 'debug';
const LOG_TO_FILE = process.env.LOG_TO_FILE !== 'false';
const LOG_DIR = process.env.LOG_DIR ?? 'logs';
const LOG_FILE = process.env.LOG_FILE ?? 'api.log';

function ensureLogDir(): string {
  const dir = path.isAbsolute(LOG_DIR) ? LOG_DIR : path.join(process.cwd(), LOG_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, LOG_FILE);
}

const transports: import('winston').transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }: Record<string, unknown>) => {
        const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        return `${timestamp} [${level}] ${message}${metaStr}`;
      }),
    ),
  }),
];

if (LOG_TO_FILE) {
  try {
    const filePath = ensureLogDir();
    transports.push(
      new winston.transports.File({
        filename: filePath,
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
          winston.format.json(),
        ),
      }),
    );
  } catch {
    // ignore if file cannot be created
  }
}

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
});
