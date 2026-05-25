/**
 * Standardized API response wrapper.
 *
 * Every successful response from CampusOS follows this shape:
 * {
 *   success: true,
 *   message: "...",
 *   data: { ... },
 *   meta?: { page, total, limit }  // only for paginated lists
 * }
 */

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;
  public readonly meta?: PaginationMeta;

  constructor(statusCode: number, message: string, data: T, meta?: PaginationMeta) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  /**
   * Factory for a simple success response (200).
   */
  static ok<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  /**
   * Factory for a created response (201).
   */
  static created<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(201, message, data);
  }

  /**
   * Factory for a paginated list response (200).
   */
  static paginated<T>(
    message: string,
    data: T,
    meta: PaginationMeta
  ): ApiResponse<T> {
    return new ApiResponse(200, message, data, meta);
  }
}
