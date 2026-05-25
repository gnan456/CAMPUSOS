/**
 * Custom API error class for consistent error handling.
 *
 * Extends the native Error and attaches an HTTP status code plus
 * an optional array of field-level validation errors. The global
 * error middleware catches instances of this class and formats
 * them into the standard { success, message, errors } response.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: Record<string, string>[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: Record<string, string>[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Maintains proper stack trace in V8 engines
    Error.captureStackTrace(this, this.constructor);

    // Ensure instanceof checks work correctly with TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Factory methods for common HTTP errors.
   * Usage: throw ApiError.badRequest('Email is required')
   */
  static badRequest(message: string, errors: Record<string, string>[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, [], false);
  }
}
