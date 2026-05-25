import { Prisma, ComplaintStatus, ComplaintCategory, Role, NotificationType } from '@prisma/client';
import { ComplaintRepository } from './complaint.repository';
import { ApiError } from '@/utils/ApiError';
import type { CreateComplaintInput } from './complaint.validator';
import { parsePagination } from '@/types';
import { NotificationService } from '@/modules/notification/notification.service';

export class ComplaintService {
  private repository: ComplaintRepository;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new ComplaintRepository();
    this.notificationService = new NotificationService();
  }

  async createComplaint(data: CreateComplaintInput, userId: string) {
    const complaint = await this.repository.create({
      ...data,
      userId,
      status: ComplaintStatus.OPEN,
    });

    // Notify the user that their complaint was filed
    await this.notificationService.createNotification(
      userId,
      'Complaint Filed',
      `Your complaint "${complaint.title}" has been submitted and is under review.`,
      NotificationType.COMPLAINT
    ).catch(() => {}); // Non-blocking: don't fail the request if notification fails

    return complaint;
  }

  async getComplaints(query: {
    page?: number;
    limit?: number;
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    mine?: boolean;
  }, userId: string, role: Role) {
    const { skip, take, page } = parsePagination(query as any);
    
    const where: Prisma.ComplaintWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }

    // If 'mine' is true or the user is not an admin, they can only see their own complaints
    if (query.mine || role !== Role.ADMIN) {
      where.userId = userId;
    }

    const [complaints, total] = await Promise.all([
      this.repository.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.repository.count(where),
    ]);

    return {
      complaints,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getComplaintById(id: string, userId: string, role: Role) {
    const complaint = await this.repository.findById(id);
    if (!complaint) {
      throw ApiError.notFound('Complaint not found');
    }

    // Only admins or the author can view the specific complaint
    if (role !== Role.ADMIN && complaint.userId !== userId) {
      throw ApiError.forbidden('Not authorized to view this complaint');
    }

    return complaint;
  }

  async updateComplaintStatus(id: string, status: ComplaintStatus, resolverId: string, role: Role) {
    if (role !== Role.ADMIN) {
      throw ApiError.forbidden('Only admins can update complaint status');
    }

    const complaint = await this.getComplaintById(id, resolverId, role);
    
    // Prevent transitioning back to OPEN if it was resolved
    if (complaint.status === ComplaintStatus.RESOLVED && status === ComplaintStatus.OPEN) {
      throw ApiError.badRequest('Cannot reopen a resolved complaint directly. Please file a new one or change to IN_PROGRESS first.');
    }

    const updated = await this.repository.updateStatus(id, status, resolverId);

    // Notify the original complaint author of the status change
    const statusLabel: Record<string, string> = {
      IN_PROGRESS: 'is now being reviewed',
      RESOLVED: 'has been resolved',
      CLOSED: 'has been closed',
      OPEN: 'is open again',
    };
    await this.notificationService.createNotification(
      complaint.userId,
      'Complaint Updated',
      `Your complaint "${complaint.title}" ${statusLabel[status] || `status changed to ${status}`}.`,
      NotificationType.COMPLAINT
    ).catch(() => {});

    return updated;
  }
}
