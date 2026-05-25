import { Request, Response } from 'express';
import { LostFoundService } from './lostfound.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

const lostFoundService = new LostFoundService();

export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const imageUrl = req.file?.path;
  const item = await lostFoundService.createItem(req.body, imageUrl, req.user!.userId);
  res.status(201).json(ApiResponse.ok('Item reported successfully', { item }));
});

export const getItems = asyncHandler(async (req: Request, res: Response) => {
  const { items, meta } = await lostFoundService.getItems(req.query);
  res.status(200).json(ApiResponse.paginated('Items retrieved successfully', { items }, meta));
});

export const getItemById = asyncHandler(async (req: Request, res: Response) => {
  const item = await lostFoundService.getItemById((req.params.id as string));
  res.status(200).json(ApiResponse.ok('Item retrieved successfully', { item }));
});

export const updateItemStatus = asyncHandler(async (req: Request, res: Response) => {
  const item = await lostFoundService.updateItemStatus(
    (req.params.id as string),
    (req.body.status as any),
    req.user!.userId,
    req.user!.role
  );
  res.status(200).json(ApiResponse.ok('Item status updated successfully', { item }));
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const result = await lostFoundService.deleteItem((req.params.id as string), req.user!.userId, req.user!.role);
  res.status(200).json(ApiResponse.ok(result.message, result));
});
