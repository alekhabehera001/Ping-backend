// mongo-sanitize is a CJS module without a .default export; mock it explicitly
jest.mock('mongo-sanitize', () => {
  const sanitize = (value: unknown): unknown => {
    if (value !== null && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (!k.startsWith('$')) {
          result[k] = sanitize(v);
        }
      }
      return result;
    }
    return value;
  };
  // Expose as both default and direct function (CommonJS compat)
  sanitize.default = sanitize;
  return sanitize;
});

import { MongoSanitizeMiddleware } from './mongo-sanitize.middleware';
import { Request, Response, NextFunction } from 'express';

describe('MongoSanitizeMiddleware', () => {
  let middleware: MongoSanitizeMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new MongoSanitizeMiddleware();
    next = jest.fn();
  });

  it('calls next()', () => {
    const req = { query: {}, body: {}, params: {} } as Request;
    middleware.use(req, {} as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('sanitizes malicious $gt operator from query', () => {
    const req = {
      query: { filter: { $gt: '' } },
      body: {},
      params: {},
    } as unknown as Request;

    middleware.use(req, {} as Response, next);

    // mongo-sanitize strips keys starting with '$'
    expect(req.query).not.toHaveProperty('filter.$gt');
  });

  it('sanitizes malicious operator from body', () => {
    const req = {
      query: {},
      body: { $where: '1==1' },
      params: {},
    } as unknown as Request;

    middleware.use(req, {} as Response, next);

    expect(req.body).not.toHaveProperty('$where');
  });

  it('leaves clean data unchanged', () => {
    const req = {
      query: { name: 'alice' },
      body: { email: 'alice@example.com' },
      params: { id: '123' },
    } as unknown as Request;

    middleware.use(req, {} as Response, next);

    expect(req.body.email).toBe('alice@example.com');
    expect((req.query as Record<string, string>).name).toBe('alice');
  });
});
