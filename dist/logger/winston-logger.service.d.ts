import { LoggerService } from '@nestjs/common';
export declare class WinstonLoggerService implements LoggerService {
    info(message: string): void;
    log(message: unknown, context?: string): void;
    error(message: unknown, trace?: string): void;
    warn(message: unknown, context?: string): void;
    debug(message: unknown, context?: string): void;
    verbose(message: unknown, context?: string): void;
    logDatabaseConnected(host: string, port: number, database: string): void;
}
