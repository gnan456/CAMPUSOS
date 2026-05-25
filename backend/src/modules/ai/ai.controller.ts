import { Request, Response } from 'express';
import { AIService } from './ai.service';
import { ApiResponse } from '@/utils/ApiResponse';
import { asyncHandler } from '@/utils/asyncHandler';

const aiService = new AIService();

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiService.chat(req.user!.userId, req.body.message);
  res.status(200).json(ApiResponse.ok('AI response received', result));
});

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await aiService.getChatHistory(req.user!.userId);
  res.status(200).json(ApiResponse.ok('Chat history retrieved', { history }));
});

export const summarize = asyncHandler(async (req: Request, res: Response) => {
  const summary = await aiService.summarizeText(req.body.noticeText);
  res.status(200).json(ApiResponse.ok('Text summarized', { summary }));
});

export const generateTimetable = asyncHandler(async (req: Request, res: Response) => {
  const { subjects, preferences } = req.body;
  const result = await aiService.generateTimetable(subjects || [], preferences || {});
  res.status(200).json(ApiResponse.ok('Timetable generated', result));
});
