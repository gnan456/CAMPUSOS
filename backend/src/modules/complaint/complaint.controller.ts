import { Request, Response } from 'express';
import { ComplaintService } from './complaint.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

const complaintService = new ComplaintService();

export const createComplaint = asyncHandler(async (req: Request, res: Response) => {
  const complaint = await complaintService.createComplaint(req.body, req.user!.userId);
  res.status(201).json(ApiResponse.ok('Complaint filed successfully', { complaint }));
});

export const getComplaints = asyncHandler(async (req: Request, res: Response) => {
  const { complaints, meta } = await complaintService.getComplaints(req.query as any, req.user!.userId, req.user!.role);
  res.status(200).json(ApiResponse.paginated('Complaints retrieved successfully', { complaints }, meta));
});

export const getComplaintById = asyncHandler(async (req: Request, res: Response) => {
  const complaint = await complaintService.getComplaintById((req.params.id as string), req.user!.userId, req.user!.role);
  res.status(200).json(ApiResponse.ok('Complaint retrieved successfully', { complaint }));
});

export const updateComplaintStatus = asyncHandler(async (req: Request, res: Response) => {
  const complaint = await complaintService.updateComplaintStatus(
    (req.params.id as string),
    (req.body.status as any),
    req.user!.userId,
    req.user!.role
  );
  res.status(200).json(ApiResponse.ok('Complaint status updated successfully', { complaint }));
});
