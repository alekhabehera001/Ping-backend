import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from "../logger/winston-logger.service";
export declare class ApiKeyMiddleware implements NestMiddleware {
    private readonly configService;
    private readonly loggers;
    constructor(configService: ConfigService, loggers: WinstonLoggerService);
    private readonly WEBHOOK_BYPASS_PATHS;
    private safeCompare;
    private readonly SENSITIVE_BODY_FIELDS;
    private redactBody;
    private isWebhookBypassPath;
    private resolveLanguage;
    use(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
}
export declare class AuthTokenMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
}
