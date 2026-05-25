import { Prisma } from '@prisma/client';
import db from '@/config/db';

export class NoteRepository {
  async create(data: Prisma.NoteUncheckedCreateInput) {
    return db.note.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id: string) {
    return db.note.findUnique({
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
    where?: Prisma.NoteWhereInput;
    orderBy?: Prisma.NoteOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return db.note.findMany({
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

  async count(where?: Prisma.NoteWhereInput) {
    return db.note.count({ where });
  }

  async delete(id: string) {
    return db.note.delete({
      where: { id },
    });
  }
}
