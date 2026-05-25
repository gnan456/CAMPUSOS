import { Prisma, EventStatus, Role, NotificationType } from '@prisma/client';
import { EventRepository } from './event.repository';
import { ApiError } from '@/utils/ApiError';
import type { CreateEventInput } from './event.validator';
import { parsePagination } from '@/types';
import { NotificationService } from '@/modules/notification/notification.service';

export class EventService {
  private repository: EventRepository;
  private notificationService: NotificationService;

  constructor() {
    this.repository = new EventRepository();
    this.notificationService = new NotificationService();
  }

  async createEvent(data: CreateEventInput, userId: string, role: Role) {
    // Admins and Club Coordinators have events auto-approved; others need approval
    const status = (role === Role.ADMIN || role === Role.CLUB_COORDINATOR) ? EventStatus.APPROVED : EventStatus.PENDING_APPROVAL;

    const event = await this.repository.create({
      ...data,
      date: new Date(data.date),
      creatorId: userId,
      status,
    });

    // Notify creator
    const statusMsg = status === EventStatus.APPROVED
      ? 'Your event has been published!'
      : 'Your event is pending admin approval.';
    await this.notificationService.createNotification(
      userId,
      'Event Created',
      `"${event.title}" – ${statusMsg}`,
      NotificationType.EVENT
    ).catch(() => {});

    return event;
  }

  async getEvents(query: {
    page?: number;
    limit?: number;
    status?: EventStatus;
    upcoming?: boolean;
  }) {
    const { skip, take, page } = parsePagination(query as any);
    
    const where: Prisma.EventWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.upcoming) {
      where.date = { gte: new Date() };
    }

    const [events, total] = await Promise.all([
      this.repository.findMany({
        skip,
        take,
        where,
        orderBy: { date: 'asc' },
      }),
      this.repository.count(where),
    ]);

    return {
      events,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async getEventById(id: string) {
    const event = await this.repository.findById(id);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }
    return event;
  }

  async updateEventStatus(id: string, status: EventStatus) {
    // First ensure the event exists
    await this.getEventById(id);
    return this.repository.updateStatus(id, status);
  }

  async registerForEvent(userId: string, eventId: string) {
    const event = await this.getEventById(eventId);

    if (event.status !== EventStatus.APPROVED && event.status !== EventStatus.PENDING_APPROVAL) {
      throw ApiError.badRequest('Cannot register for an unapproved or cancelled event');
    }

    if (event.date < new Date()) {
      throw ApiError.badRequest('Cannot register for a past event');
    }

    if (event._count.registrations >= event.capacity) {
      throw ApiError.badRequest('Event is at full capacity');
    }

    const existingRegistration = await this.repository.findRegistration(userId, eventId);
    if (existingRegistration) {
      throw ApiError.conflict('Already registered for this event');
    }

    await this.repository.createRegistration(userId, eventId);

    // Notify user of successful registration
    await this.notificationService.createNotification(
      userId,
      'Event Registration Confirmed',
      `You are registered for "${event.title}" on ${new Date(event.date).toLocaleDateString()}.`,
      NotificationType.EVENT
    ).catch(() => {});

    return { success: true, message: 'Successfully registered for event' };
  }

  async deleteEvent(id: string) {
    const event = await this.getEventById(id);
    const registrations = await this.repository.getRegistrationsForEvent(id);

    // Notify all registered students
    const notificationPromises = registrations.map((reg) =>
      this.notificationService.createNotification(
        reg.userId,
        'Event Cancelled',
        `The event "${event.title}" has been taken down.`,
        NotificationType.EVENT
      ).catch(() => {})
    );

    // Notify the creator if it's a club coordinator
    if (event.creatorId) {
      notificationPromises.push(
        this.notificationService.createNotification(
          event.creatorId,
          'Event Taken Down',
          `Your event "${event.title}" has been taken down by the administration.`,
          NotificationType.EVENT
        ).catch(() => {})
      );
    }

    await Promise.all(notificationPromises);
    await this.repository.delete(id);

    return { success: true, message: 'Event taken down successfully' };
  }

  async unregisterFromEvent(userId: string, eventId: string) {
    const existingRegistration = await this.repository.findRegistration(userId, eventId);
    if (!existingRegistration) {
      throw ApiError.notFound('Not registered for this event');
    }

    await this.repository.deleteRegistration(userId, eventId);
    return { success: true, message: 'Successfully unregistered from event' };
  }
}
