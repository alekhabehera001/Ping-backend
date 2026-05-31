import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    __: (message: string, ...args: unknown[]) => string;
  }
}
