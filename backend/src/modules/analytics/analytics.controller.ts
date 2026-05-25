import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

const analyticsService = new AnalyticsService();

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await analyticsService.getDashboardStats();
  res.status(200).json(ApiResponse.ok('Dashboard stats retrieved successfully', stats));
});
