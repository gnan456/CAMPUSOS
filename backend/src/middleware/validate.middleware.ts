import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validation middleware factory using Zod schemas.
 *
 * Validates request body, query params, or route params against a
 * provided Zod schema. Returns 400 with structured field errors
 * if validation fails.
 *
 * Usage:
 *   router.post('/events', validate(createEventSchema), controller.create)
 */

interface ValidationTarget {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schema: ValidationTarget) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Record<string, string>[] = [];

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue: z.ZodIssue) => {
          errors.push({
            field: issue.path.join('.'),
            message: issue.message,
          });
        });
      } else {
        // Replace req.body with parsed (and potentially transformed) data
        req.body = result.data;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((issue: z.ZodIssue) => {
          errors.push({
            field: `query.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      } else {
        (req as Request & { query: Record<string, unknown> }).query = result.data;
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue: z.ZodIssue) => {
          errors.push({
            field: `params.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      }
    }

    if (errors.length > 0) {
      throw new ApiError(400, 'Validation failed', errors);
    }

    next();
  };
};
