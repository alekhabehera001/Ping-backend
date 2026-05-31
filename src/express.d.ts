declare global {
  namespace Express {
    interface Request {
      language?: string;
      user?: unknown;
    }
  }
}
