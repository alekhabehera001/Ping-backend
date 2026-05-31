import { Injectable, LoggerService } from '@nestjs/common';
import logger from './winston.logger';

function toLogString(message: unknown): string {
  if (typeof message === 'string') return message;
  if (message instanceof Error) return message.message;
  return JSON.stringify(message);
}

@Injectable()
export class WinstonLoggerService implements LoggerService {
  info(message: string) {
    logger.info(message);
  }

  log(message: unknown, context?: string) {
    logger.info(toLogString(message), { context });
  }

  error(message: unknown, trace?: string) {
    logger.error(toLogString(message), trace);
  }

  warn(message: unknown, context?: string) {
    logger.warn(toLogString(message), { context });
  }

  debug(message: unknown, context?: string) {
    logger.debug(toLogString(message), { context });
  }

  verbose(message: unknown, context?: string) {
    logger.verbose(toLogString(message), { context });
  }

  logDatabaseConnected(host: string, port: number, database: string) {
    const logMessage = `Connected to database ${database} at ${host}:${port}`;
    logger.info(logMessage);
  }
}
