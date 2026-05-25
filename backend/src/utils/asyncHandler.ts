import { Request, Response, NextFunction } from 'express';

/**
 * Higher-order function that wraps async Express route handlers.
 *
 * Without this, every controller would need its own try/catch that
 * forwards errors to `next()`. asyncHandler eliminates that boilerplate:
 *
 *   router.get('/events', asyncHandler(eventController.list))
 *
 * If the wrapped function throws (or its Promise rejects), the error
 * is automatically forwarded to Express's error-handling middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
