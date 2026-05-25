import { Prisma, NotificationType } from '@prisma/client';
import { NotificationRepository } from './notification.repository';
import { parsePagination } from '@/types';

export class NotificationService {
  private repository: NotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  // Used internally by other modules to trigger notifications
  async createNotification(userId: string, title: string, message: string, type: NotificationType) {
    return this.repository.create({
      userId,
      title,
      message,
      type,
    });
  }

  async getNotifications(userId: string, query: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    const { skip, take, page } = parsePagination(query as any);
    
    const where: Prisma.NotificationWhereInput = { userId };
    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      this.repository.findMany({
        skip,
        take,
        where,
      }),
      this.repository.count(where),
    ]);

    return {
      notifications,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getUnreadCount(userId: string) {
    return this.repository.count({ userId, isRead: false });
  }

  async markAsRead(id: string, userId: string) {
    await this.repository.markAsRead(id, userId);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.repository.markAllAsRead(userId);
    return { success: true };
  }
}
