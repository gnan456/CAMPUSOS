import api from '@/lib/api-client';
import type { Notification, ApiSuccessResponse, PaginationMeta } from '@/types';

/**
 * Notification API service.
 */
export const notificationApi = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ notifications: Notification[]; meta: PaginationMeta }> {
    const response = await api.get<
      ApiSuccessResponse<{ notifications: Notification[] }>
    >('/notifications', { params });
    return {
      notifications: response.data.data.notifications,
      meta: response.data.meta!,
    };
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiSuccessResponse<{ count: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },
};
