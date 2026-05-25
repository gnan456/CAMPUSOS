import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

const notificationService = new NotificationService();

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { notifications, meta } = await notificationService.getNotifications(req.user!.userId, req.query);
  res.status(200).json(ApiResponse.paginated('Notifications retrieved successfully', { notifications }, meta));
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  res.status(200).json(ApiResponse.ok('Unread count retrieved successfully', { count }));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAsRead((req.params.id as string), req.user!.userId);
  res.status(200).json(ApiResponse.ok('Notification marked as read', null));
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);
  res.status(200).json(ApiResponse.ok('All notifications marked as read', null));
});
