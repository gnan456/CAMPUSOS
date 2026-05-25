import { Request, Response } from 'express';
import { EventService } from './event.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

const eventService = new EventService();

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.createEvent(req.body, req.user!.userId, req.user!.role);
  res.status(201).json(ApiResponse.ok('Event created successfully', event));
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { events, meta } = await eventService.getEvents(req.query);
  res.status(200).json(ApiResponse.paginated('Events retrieved successfully', { events }, meta));
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getEventById((req.params.id as string));
  res.status(200).json(ApiResponse.ok('Event retrieved successfully', { event }));
});

export const updateEventStatus = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.updateEventStatus((req.params.id as string), (req.body.status as any));
  res.status(200).json(ApiResponse.ok('Event status updated successfully', { event }));
});

export const registerForEvent = asyncHandler(async (req: Request, res: Response) => {
  const result = await eventService.registerForEvent(req.user!.userId, (req.params.id as string));
  res.status(200).json(ApiResponse.ok(result.message, result));
});

export const unregisterFromEvent = asyncHandler(async (req: Request, res: Response) => {
  const result = await eventService.unregisterFromEvent(req.user!.userId, (req.params.id as string));
  res.status(200).json(ApiResponse.ok(result.message, result));
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const result = await eventService.deleteEvent((req.params.id as string));
  res.status(200).json(ApiResponse.ok(result.message, result));
});
