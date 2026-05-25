/**
 * Shared TypeScript types for the CampusOS frontend.
 * These mirror the backend Prisma models and API response shapes.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  CLUB_COORDINATOR = 'CLUB_COORDINATOR',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ComplaintCategory {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  ACADEMIC = 'ACADEMIC',
  HOSTEL = 'HOSTEL',
  CANTEEN = 'CANTEEN',
  LIBRARY = 'LIBRARY',
  TRANSPORT = 'TRANSPORT',
  OTHER = 'OTHER',
}

export enum LostFoundType {
  LOST = 'LOST',
  FOUND = 'FOUND',
}

export enum LostFoundStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
}

export enum NotificationType {
  EVENT = 'EVENT',
  COMPLAINT = 'COMPLAINT',
  SYSTEM = 'SYSTEM',
  AI = 'AI',
  LOST_FOUND = 'LOST_FOUND',
}

// ─── Entity Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  capacity: number;
  status: EventStatus;
  imageUrl: string | null;
  creatorId: string;
  creator?: User;
  registrations?: EventRegistration[];
  _count?: { registrations: number };
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  userId: string;
  eventId: string;
  registeredAt: string;
  user?: User;
  event?: Event;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  userId: string;
  user?: User;
  resolvedById: string | null;
  resolvedBy?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  subject: string;
  semester: number;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  userId: string;
  createdAt: string;
}

export interface LostFound {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  type: LostFoundType;
  status: LostFoundStatus;
  location: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// ─── Event Types ──────────────────────────────────────────────────────────────

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  venue: string;
  capacity: number;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus;
}

// ─── Complaint Types ──────────────────────────────────────────────────────────

export interface CreateComplaintRequest {
  title: string;
  description: string;
  category: ComplaintCategory;
}

// ─── Note Types ───────────────────────────────────────────────────────────────

export interface CreateNoteRequest {
  title: string;
  description?: string;
  subject: string;
  semester: number;
  file: File;
}

// ─── Lost & Found Types ──────────────────────────────────────────────────────

export interface CreateLostFoundRequest {
  title: string;
  description: string;
  type: LostFoundType;
  location: string;
  image?: File;
}

// ─── AI Types ─────────────────────────────────────────────────────────────────

export interface AISummarizeRequest {
  noticeText: string;
}

export interface AISummarizeResponse {
  summary: string[];
}

export interface AITimetableRequest {
  subjects: string[];
  preferences: Record<string, string>;
}

export interface TimetableSlot {
  time: string;
  subject: string;
  duration: string;
}

export interface TimetableDay {
  day: string;
  slots: TimetableSlot[];
}

export interface AITimetableResponse {
  timetable: TimetableDay[];
}

export interface AIChatRequest {
  message: string;
}

export interface AIChatResponse {
  reply: string;
}
