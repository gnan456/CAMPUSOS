import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

/**
 * Global error-handling middleware.
 *
 * Express identifies error middleware by its 4-argument signature.
 * This MUST be registered LAST in the middleware chain.
 *
 * Behavior:
 * - ApiError instances → structured JSON response with correct status code
 * - Unknown errors → 500 with generic message (details hidden in production)
 * - Stack traces are logged in development only
 */
export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the full error in development
  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Handle our custom ApiError instances
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Prisma known request errors (e.g., unique constraint violations)
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as Error & { code: string; meta?: Record<string, unknown> };
    
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target as string[] | undefined;
      const field = target?.[0] ?? 'field';
      res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists`,
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
      });
      return;
    }
  }

  // Handle JSON parse errors
  if (err.name === 'SyntaxError' && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    });
    return;
  }

  // Fallback: generic 500
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
