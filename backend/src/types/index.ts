/**
 * Shared type definitions for the CampusOS backend.
 * These types are used across modules and don't belong to any single feature.
 */

/**
 * Standard pagination query parameters.
 * Used by all list endpoints.
 */
export interface PaginationQuery {
  page: number;
  limit: number;
}

/**
 * Pagination helper — calculates skip/take from page/limit.
 * Enforces max limit of 100 to prevent abuse.
 */
export function parsePagination(query: { page?: string; limit?: string }): {
  page: number;
  take: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const rawLimit = parseInt(query.limit ?? '20', 10) || 20;
  const take = Math.min(Math.max(1, rawLimit), 100); // clamp to [1, 100]
  const skip = (page - 1) * take;

  return { page, take, skip };
}

/**
 * User payload shape attached to authenticated requests.
 * Matches JwtPayload from auth middleware.
 */
export interface AuthenticatedUser {
  userId: string;
  role: string;
}
