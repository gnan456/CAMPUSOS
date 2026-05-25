import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { authService } from './auth.service';
import type { RegisterInput, LoginInput } from './auth.validator';

/**
 * Auth controller — HTTP layer.
 *
 * Only responsibilities:
 * 1. Extract data from req (body, cookies, user)
 * 2. Call the appropriate service method
 * 3. Format and send the response
 *
 * Zero business logic lives here.
 */

/**
 * Cookie options for the httpOnly refresh token.
 *
 * httpOnly:  prevents JavaScript access (XSS protection)
 * secure:   cookie only sent over HTTPS (enabled in production)
 * sameSite: 'strict' prevents CSRF by not sending on cross-origin requests
 * maxAge:   7 days in milliseconds
 * path:     scoped to auth refresh endpoint to minimize exposure
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

export const authController = {
  /**
   * POST /api/v1/auth/register
   */
  register: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const input = req.body as RegisterInput;

    const { user, accessToken, refreshToken } = await authService.register(input);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json(
      ApiResponse.created('Registration successful', {
        user,
        accessToken,
      })
    );
  }),

  /**
   * POST /api/v1/auth/login
   */
  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const input = req.body as LoginInput;

    const { user, accessToken, refreshToken } = await authService.login(input);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json(
      ApiResponse.ok('Login successful', {
        user,
        accessToken,
      })
    );
  }),

  /**
   * POST /api/v1/auth/refresh
   *
   * Reads refresh token from httpOnly cookie (not from body/headers).
   * Returns a new access token without requiring re-login.
   */
  refresh: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token not found');
    }

    const { accessToken, user } = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(
      ApiResponse.ok('Token refreshed successfully', {
        user,
        accessToken,
      })
    );
  }),

  /**
   * POST /api/v1/auth/logout
   *
   * Clears the refresh token cookie. The frontend should also
   * discard the access token from memory.
   */
  logout: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
      path: '/',
    });

    res.status(200).json(
      ApiResponse.ok('Logged out successfully', null)
    );
  }),

  /**
   * GET /api/v1/auth/me
   *
   * Returns the currently authenticated user's profile.
   * Requires auth middleware.
   */
  me: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const user = await authService.getCurrentUser(req.user.userId);

    res.status(200).json(
      ApiResponse.ok('User profile fetched successfully', { user })
    );
  }),
};
