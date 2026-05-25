import { Prisma, ComplaintStatus } from '@prisma/client';
import db from '@/config/db';

export class ComplaintRepository {
  async create(data: Prisma.ComplaintUncheckedCreateInput) {
    return db.complaint.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id: string) {
    return db.complaint.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        resolvedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ComplaintWhereInput;
    orderBy?: Prisma.ComplaintOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return db.complaint.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true },
        },
        resolvedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async count(where?: Prisma.ComplaintWhereInput) {
    return db.complaint.count({ where });
  }

  async updateStatus(id: string, status: ComplaintStatus, resolverId: string) {
    return db.complaint.update({
      where: { id },
      data: {
        status,
        ...(status === ComplaintStatus.RESOLVED || status === ComplaintStatus.CLOSED
          ? { resolvedById: resolverId }
          : {}),
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        resolvedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
