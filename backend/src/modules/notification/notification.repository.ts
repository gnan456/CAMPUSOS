import { Prisma } from '@prisma/client';
import db from '@/config/db';

export class NotificationRepository {
  async create(data: Prisma.NotificationUncheckedCreateInput) {
    return db.notification.create({ data });
  }

  async createMany(data: Prisma.NotificationUncheckedCreateInput[]) {
    return db.notification.createMany({ data });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NotificationWhereInput;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return db.notification.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
    });
  }

  async count(where?: Prisma.NotificationWhereInput) {
    return db.notification.count({ where });
  }

  async markAsRead(id: string, userId: string) {
    return db.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
