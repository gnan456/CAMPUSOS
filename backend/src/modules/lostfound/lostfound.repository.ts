import { Prisma, LostFoundStatus } from '@prisma/client';
import db from '@/config/db';

export class LostFoundRepository {
  async create(data: Prisma.LostFoundUncheckedCreateInput) {
    return db.lostFound.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id: string) {
    return db.lostFound.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LostFoundWhereInput;
    orderBy?: Prisma.LostFoundOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return db.lostFound.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async count(where?: Prisma.LostFoundWhereInput) {
    return db.lostFound.count({ where });
  }

  async updateStatus(id: string, status: LostFoundStatus) {
    return db.lostFound.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return db.lostFound.delete({
      where: { id },
    });
  }
}
