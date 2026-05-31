import { Injectable, NestMiddleware } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoSanitize = require('mongo-sanitize');
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MongoSanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const sanitizedQuery = mongoSanitize(req.query);
    Object.keys(sanitizedQuery).forEach(key => {
      (req.query as Record<string, unknown>)[key] = sanitizedQuery[key];
    });

    req.body = mongoSanitize(req.body);
    req.params = mongoSanitize(req.params);

    next();
  }
}
