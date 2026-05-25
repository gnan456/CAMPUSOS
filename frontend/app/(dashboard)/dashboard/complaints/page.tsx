'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquareWarning, Plus, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { complaintApi } from '@/services/complaint.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Portal } from '@/components/ui/portal';
import { createComplaintSchema, type CreateComplaintFormData } from '@/lib/validators';
import { Role, type Complaint, ComplaintStatus, ComplaintCategory } from '@/types';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  RESOLVED: 'success',
  CLOSED: 'secondary',
};

const statusIcon: Record<string, React.ElementType> = {
  OPEN: Clock,
  IN_PROGRESS: Clock,
  RESOLVED: CheckCircle,
  CLOSED: CheckCircle,
};

export default function ComplaintsPage() {
  const user = useAuthStore((state) => state.user);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isAdmin = user?.role === Role.ADMIN;

  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const { complaints: data } = await complaintApi.getComplaints({ limit: 20 });
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
      toast.success('Status updated');
      fetchComplaints();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Complaints</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 w-1/2 rounded bg-slate-800 mb-2" />
                <div className="h-3 w-3/4 rounded bg-slate-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Complaints</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isAdmin ? 'Manage and resolve campus complaints' : 'View and file complaints'}
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            File Complaint
          </Button>
        )}
      </div>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquareWarning className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-lg font-medium text-slate-400">No complaints</p>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin ? 'No complaints to resolve.' : 'No complaints filed yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => {
            const StatusIcon = statusIcon[complaint.status] || Clock;
            return (
              <Card
                key={complaint.id}
                className="hover:border-slate-700 transition-all duration-300"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                      <StatusIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-200 truncate">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={statusVariant[complaint.status] || 'secondary'}>
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary">
                          {complaint.category}
                        </Badge>
                        <span className="text-xs text-slate-600">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && complaint.status === 'OPEN' && (
                    <div className="flex gap-2 ml-4 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusUpdate(complaint.id, ComplaintStatus.IN_PROGRESS)}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(complaint.id, ComplaintStatus.RESOLVED)}
                      >
                        Resolve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center">
            <div className="relative my-auto w-full max-w-lg">
              <Card className="border-slate-800 bg-slate-950">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">File New Complaint</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onCreateSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="complaint-title" required>Complaint Title</Label>
                      <Input id="complaint-title" placeholder="Broken fan in class 302" {...register('title')} error={errors.title?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complaint-category" required>Category</Label>
                      <select
                        id="complaint-category"
                        className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                        {...register('category')}
                      >
                        <option value="INFRASTRUCTURE">Infrastructure</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="HOSTEL">Hostel</option>
                        <option value="CANTEEN">Canteen</option>
                        <option value="LIBRARY">Library</option>
                        <option value="TRANSPORT">Transport</option>
                        <option value="OTHER">Other</option>
                      </select>
                      {errors.category?.message && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complaint-description" required>Description</Label>
                      <Textarea id="complaint-description" placeholder="Provide more details about the issue..." {...register('description')} error={errors.description?.message} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 border-t border-slate-800/60 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Submit Complaint
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
