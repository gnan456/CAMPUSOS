import { Prisma, EventStatus } from '@prisma/client';
import db from '@/config/db';

export class EventRepository {
  async create(data: Prisma.EventUncheckedCreateInput) {
    return db.event.create({
      data,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findById(id: string) {
    return db.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return db.event.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });
  }

  async count(where?: Prisma.EventWhereInput) {
    return db.event.count({ where });
  }

  async updateStatus(id: string, status: EventStatus) {
    return db.event.update({
      where: { id },
      data: { status },
      include: {
        _count: { select: { registrations: true } },
      },
    });
  }

  async createRegistration(userId: string, eventId: string) {
    return db.eventRegistration.create({
      data: {
        userId,
        eventId,
      },
    });
  }

  async findRegistration(userId: string, eventId: string) {
    return db.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
  }

  async deleteRegistration(userId: string, eventId: string) {
    return db.eventRegistration.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
  }

  async getRegistrationsForEvent(eventId: string) {
    return db.eventRegistration.findMany({
      where: { eventId },
    });
  }

  async delete(id: string) {
    return db.event.delete({
      where: { id },
    });
  }
}
