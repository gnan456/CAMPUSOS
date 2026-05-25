import { Prisma, LostFoundType, LostFoundStatus, Role, NotificationType } from '@prisma/client';
import { LostFoundRepository } from './lostfound.repository';
import { ApiError } from '@/utils/ApiError';
import type { CreateLostFoundInput } from './lostfound.validator';
import { parsePagination } from '@/types';
import cloudinary from '@/config/cloudinary';
import { NotificationService } from '@/modules/notification/notification.service';

export class LostFoundService {
  private repository: LostFoundRepository;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new LostFoundRepository();
    this.notificationService = new NotificationService();
  }

  async createItem(data: CreateLostFoundInput, imageUrl: string | undefined, userId: string) {
    const item = await this.repository.create({
      ...data,
      imageUrl,
      userId,
      status: LostFoundStatus.ACTIVE,
    });

    // Notify the user that their item was reported
    const typeLabel = data.type === LostFoundType.LOST ? 'Lost' : 'Found';
    await this.notificationService.createNotification(
      userId,
      `${typeLabel} Item Reported`,
      `Your ${typeLabel.toLowerCase()} item report for "${item.title}" has been posted.`,
      NotificationType.LOST_FOUND
    ).catch(() => {});

    return item;
  }

  async getItems(query: {
    page?: number;
    limit?: number;
    type?: LostFoundType;
    status?: LostFoundStatus;
  }) {
    const { skip, take, page } = parsePagination(query as any);
    
    const where: Prisma.LostFoundWhereInput = {};
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.repository.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getItemById(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw ApiError.notFound('Item not found');
    }
    return item;
  }

  async updateItemStatus(id: string, status: LostFoundStatus, userId: string, role: Role) {
    const item = await this.getItemById(id);

    // Only the author or an admin can update the status
    if (role !== Role.ADMIN && item.userId !== userId) {
      throw ApiError.forbidden('Not authorized to update this item');
    }

    return this.repository.updateStatus(id, status);
  }

  async deleteItem(id: string, userId: string, role: Role) {
    const item = await this.getItemById(id);

    // Only admins or the author can delete
    if (role !== Role.ADMIN && item.userId !== userId) {
      throw ApiError.forbidden('Not authorized to delete this item');
    }

    if (item.imageUrl) {
      try {
        const urlParts = item.imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folder = urlParts[urlParts.length - 2];
        
        if (folder && filename) {
          const publicId = `${folder}/${filename.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
      }
    }

    await this.repository.delete(id);
    return { success: true, message: 'Item deleted successfully' };
  }
}
