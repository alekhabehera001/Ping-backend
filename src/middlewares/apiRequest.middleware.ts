import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { allowedLanguages } from '../helpers/constant';
import { ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from 'src/logger/winston-logger.service';
import chalk from 'chalk';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggers: WinstonLoggerService,
  ) {}

  private readonly WEBHOOK_BYPASS_PATHS = ['/webhooks/apple', '/webhooks/google'];

  private safeCompare(a: string, b: string): boolean {
    try {
      const bufA = Buffer.from(a);
      const bufB = Buffer.from(b);
      if (bufA.length !== bufB.length) return false;
      return timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }

  private readonly SENSITIVE_BODY_FIELDS = new Set([
    'password',
    'confirmpassword',
    'otp',
    'token',
    'refreshtoken',
    'accesstoken',
    'secret',
    'apikey',
    'pin',
    'code',
  ]);

  private redactBody(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(item => this.redactBody(item));
    }
    if (value !== null && typeof value === 'object') {
      const redacted: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        redacted[key] = this.SENSITIVE_BODY_FIELDS.has(key.toLowerCase())
          ? '[REDACTED]'
          : this.redactBody(val);
      }
      return redacted;
    }
    return value;
  }

  private isWebhookBypassPath(path: string): boolean {
    return this.WEBHOOK_BYPASS_PATHS.some(p => path === p || path.startsWith(p + '/'));
  }

  private resolveLanguage(
    xLangHeader: string | string[] | undefined,
    acceptLanguageHeader: string | string[] | undefined,
  ): string {
    if (xLangHeader) {
      const lang = String(xLangHeader).toLowerCase().trim();
      if (allowedLanguages.includes(lang)) return lang;
    } else if (acceptLanguageHeader) {
      const lang = String(acceptLanguageHeader).toLowerCase().split(',')[0].trim().split('-')[0];
      if (allowedLanguages.includes(lang)) return lang;
    }
    return 'en';
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Allow CORS preflight through without API key validation
    if (req.method === 'OPTIONS') {
      return next();
    }

    const apiKey = req.headers['x-api-key'];
    const appVersion = req.headers['x-app-version'];
    const xLangHeader = req.headers['x-app-language'];
    const acceptLanguageHeader = req.headers['accept-language'];

    // Use req.originalUrl for bypass check because NestJS middleware consumer mounts
    // middleware at the matched path, making req.path relative to the mount point (often '/').
    // req.originalUrl always contains the full request path.
    const requestPath = req.originalUrl.split('?')[0];

    if (!this.isWebhookBypassPath(requestPath)) {
      if (!apiKey) {
        return res.status(403).json({ status: false, message: 'x-api-key is required in header' });
      }

      const validApiKey = this.configService.get<string>('API_KEY');
      if (!validApiKey || !this.safeCompare(String(apiKey), validApiKey)) {
        return res.status(403).json({ status: false, message: 'Invalid x-api-key' });
      }

      if (!appVersion) {
        return res.status(403).json({
          status: false,
          message: 'x-app-version is required in header',
        });
      }

      this.loggers.log('', 'info');
      this.loggers.log(
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
        'info',
      );
      this.loggers.log('', 'info');
      const safeHeaders = { ...req.headers };
      delete safeHeaders['authorization'];
      delete safeHeaders['x-api-key'];
      delete safeHeaders['cookie'];
      this.loggers.log(
        'Request Headers: ' + chalk.yellow(JSON.stringify(safeHeaders, null, 2)),
        'info',
      );
      this.loggers.log(
        'Request Body: ' + chalk.yellow(JSON.stringify(this.redactBody(req.body), null, 2)),
        'info',
      );

      const language = this.resolveLanguage(xLangHeader, acceptLanguageHeader);
      (req as Request & { language: string })['language'] = language;
    }
    next();
  }
}

export class AuthTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.header('Authorization')) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
    next();
  }
}
