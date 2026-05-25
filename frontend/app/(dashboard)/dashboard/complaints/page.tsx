'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquareWarning, Plus, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintApi } from '@/services/complaint.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Portal } from '@/components/ui/portal';
import { createComplaintSchema, type CreateComplaintFormData } from '@/lib/validators';
import { Role, type Complaint, ComplaintStatus, ComplaintCategory } from '@/types';
import { cn } from '@/lib/utils';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'ghost'> = {
  [ComplaintStatus.OPEN]: 'warning',
  [ComplaintStatus.IN_PROGRESS]: 'default',
  [ComplaintStatus.RESOLVED]: 'success',
  [ComplaintStatus.CLOSED]: 'ghost',
};

const statusBorder: Record<string, string> = {
  [ComplaintStatus.OPEN]: 'border-l-4 border-l-warning',
  [ComplaintStatus.IN_PROGRESS]: 'border-l-4 border-l-brand-primary',
  [ComplaintStatus.RESOLVED]: 'border-l-4 border-l-success',
  [ComplaintStatus.CLOSED]: 'border-l-4 border-l-border-strong',
};

const statusIcon: Record<string, React.ElementType> = {
  [ComplaintStatus.OPEN]: Clock,
  [ComplaintStatus.IN_PROGRESS]: AlertCircle,
  [ComplaintStatus.RESOLVED]: CheckCircle2,
  [ComplaintStatus.CLOSED]: CheckCircle2,
};

export default function ComplaintsPage() {
  const user = useAuthStore((state) => state.user);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Admin Tabs State
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  const isAdmin = user?.role === Role.ADMIN;

  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const { complaints: data } = await complaintApi.getComplaints({ limit: 40 });
      setComplaints(data);
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateComplaintFormData>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: { title: '', description: '', category: ComplaintCategory.OTHER },
  });

  const onCreateSubmit = async (data: CreateComplaintFormData) => {
    try {
      await complaintApi.createComplaint(data);
      toast.success('Complaint filed successfully!');
      setIsCreateOpen(false);
      reset();
      fetchComplaints();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || 'Failed to file complaint');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleStatusUpdate = async (id: string, status: ComplaintStatus) => {
    try {
      await complaintApi.updateComplaintStatus(id, status);
      toast.success('Status updated successfully');
      fetchComplaints();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter complaints based on Tab selection
  const filteredComplaints = complaints.filter((c) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return c.status === ComplaintStatus.OPEN || c.status === ComplaintStatus.IN_PROGRESS;
    if (activeTab === 'RESOLVED') return c.status === ComplaintStatus.RESOLVED || c.status === ComplaintStatus.CLOSED;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-syne text-text-primary tracking-tight">Complaints</h1>
            <p className="text-sm text-text-secondary">Loading complaints ticket logs...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="skeleton h-[80px] border border-border-subtle" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-dm-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight">Complaints</h1>
          <p className="text-sm text-text-secondary mt-1">
            {isAdmin ? 'Manage and resolve campus complaints' : 'View and file complaints'}
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="cursor-pointer">
            <Plus className="h-4 w-4 shrink-0" />
            File Complaint
          </Button>
        )}
      </div>

      {/* Admin Tab Bar Toggles */}
      {isAdmin && (
        <div className="flex border-b border-border-subtle pb-px select-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer font-syne',
              activeTab === 'ALL'
                ? 'border-brand-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            All Complaints
          </button>
          <button
            onClick={() => setActiveTab('PENDING')}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer font-syne',
              activeTab === 'PENDING'
                ? 'border-brand-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            Pending Action
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer font-syne',
              activeTab === 'RESOLVED'
                ? 'border-brand-primary text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            Resolved
          </button>
        </div>
      )}

      {filteredComplaints.length === 0 ? (
        <Card variant="default">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <MessageSquareWarning className="h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-bold font-syne text-text-primary">No complaints filed</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm text-center">
              {isAdmin ? 'Everything is clear! No active complaints to address.' : 'If you have any campus issues, you can file them here.'}
            </p>
            {!isAdmin && (
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
                <Plus className="h-4 w-4" />
                File Complaint
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => {
            const StatusIcon = statusIcon[complaint.status] || Clock;
            const isExpanded = expandedId === complaint.id;

            return (
              <Card
                key={complaint.id}
                variant="default"
                className={cn(
                  'hover-lift cursor-pointer overflow-hidden border-border-subtle bg-bg-surface',
                  statusBorder[complaint.status] || 'border-l-4 border-l-border-strong'
                )}
                onClick={() => toggleExpand(complaint.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-base border border-border-subtle">
                        <StatusIcon className="h-5 w-5 text-text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-text-primary truncate">
                          {complaint.title}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1 font-dm-sans line-clamp-1">
                          {complaint.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant={statusVariant[complaint.status] || 'ghost'} className="capitalize">
                            {complaint.status.toLowerCase().replace('_', ' ')}
                          </Badge>
                          <Badge variant="ghost" className="capitalize">
                            {complaint.category.toLowerCase()}
                          </Badge>
                          <span className="text-[10px] font-mono text-text-muted">
                            {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-text-muted hover:text-text-secondary transition-colors shrink-0">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Expandable details panel */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-border-subtle/50 space-y-4 animate-page-enter" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold font-syne text-text-muted uppercase tracking-wider">Full Issue Details</h4>
                        <p className="text-sm text-text-secondary leading-relaxed font-dm-sans whitespace-pre-line">
                          {complaint.description}
                        </p>
                      </div>

                      {/* Display Creator info if Admin */}
                      {isAdmin && complaint.user && (
                        <div className="flex items-center gap-2 p-3 bg-bg-base rounded-lg border border-border-subtle w-fit">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs text-text-secondary font-mono">
                            Filed by: <strong className="text-text-primary">{complaint.user.name}</strong> ({complaint.user.email})
                          </span>
                        </div>
                      )}

                      {/* Status Update drop-down for Admin */}
                      {isAdmin && (
                        <div className="flex items-center gap-3 pt-4 border-t border-border-subtle/50 max-w-sm">
                          <Label htmlFor={`status-select-${complaint.id}`} className="mb-0 text-xs font-semibold shrink-0">
                            Update Ticket Status:
                          </Label>
                          <Select
                            id={`status-select-${complaint.id}`}
                            value={complaint.status}
                            onChange={(e) => handleStatusUpdate(complaint.id, e.target.value as ComplaintStatus)}
                            className="w-full text-xs h-9 py-1"
                          >
                            <option value={ComplaintStatus.OPEN}>Open</option>
                            <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                            <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                            <option value={ComplaintStatus.CLOSED}>Closed</option>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Create Complaint Modal ────────────────────────────────────────── */}
      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center items-center">
            <div className="relative w-full max-w-lg animate-page-enter">
              <Card variant="glass" className="border-border-strong shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-subtle p-5">
                  <h3 className="text-lg font-bold font-syne text-text-primary">File New Complaint</h3>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onCreateSubmit)}>
                  <CardContent className="space-y-4 pt-5 pb-2">
                    <div className="space-y-1">
                      <Label htmlFor="complaint-title" required>Complaint Title</Label>
                      <Input id="complaint-title" placeholder="Broken fan in class 302" {...register('title')} error={errors.title?.message} />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="complaint-category" required>Category</Label>
                      <Select
                        id="complaint-category"
                        {...register('category')}
                        error={errors.category?.message}
                      >
                        <option value={ComplaintCategory.INFRASTRUCTURE}>Infrastructure</option>
                        <option value={ComplaintCategory.ACADEMIC}>Academic</option>
                        <option value={ComplaintCategory.HOSTEL}>Hostel</option>
                        <option value={ComplaintCategory.CANTEEN}>Canteen</option>
                        <option value={ComplaintCategory.LIBRARY}>Library</option>
                        <option value={ComplaintCategory.TRANSPORT}>Transport</option>
                        <option value={ComplaintCategory.OTHER}>Other</option>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="complaint-description" required>Description</Label>
                      <Textarea id="complaint-description" placeholder="Provide more details about the issue..." {...register('description')} error={errors.description?.message} />
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-3 border-t border-border-subtle p-5 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Submit Ticket
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
