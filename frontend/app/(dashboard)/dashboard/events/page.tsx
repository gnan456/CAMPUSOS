'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Users, Plus, X, CheckCircle2, Clock, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { eventApi } from '@/services/event.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Portal } from '@/components/ui/portal';
import { createEventSchema, type CreateEventFormData } from '@/lib/validators';
import { Role, type Event } from '@/types';
import { cn } from '@/lib/utils';

// ─── Registration confirmation schema ─────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
  rollNumber: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  specialRequirements: z.string().optional().or(z.literal('')),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'error' | 'ghost'> = {
  APPROVED: 'success',
  PENDING_APPROVAL: 'warning',
  DRAFT: 'ghost',
  REJECTED: 'error',
  CANCELLED: 'error',
  COMPLETED: 'default',
};

export default function EventsPage() {
  const user = useAuthStore((state) => state.user);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  // Registration modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Admin Take-down confirm modal
  const [eventToTakeDown, setEventToTakeDown] = useState<Event | null>(null);
  const [isTakeDownOpen, setIsTakeDownOpen] = useState(false);
  const [isTakingDown, setIsTakingDown] = useState(false);

  const canCreateEvent = user?.role === Role.ADMIN || user?.role === Role.CLUB_COORDINATOR;

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const { events: data } = await eventApi.getEvents({ limit: 40 });
      setEvents(data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create event form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { title: '', description: '', date: '', venue: '', capacity: 10 },
  });

  // Registration confirmation form
  const {
    register: regRegister,
    handleSubmit: regHandleSubmit,
    reset: regReset,
    formState: { errors: regErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: '',
      rollNumber: '',
      department: '',
      specialRequirements: '',
    },
  });

  const onCreateSubmit = async (data: CreateEventFormData) => {
    try {
      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString(),
      };
      await eventApi.createEvent(formattedData);
      toast.success('Event created successfully!');
      setIsCreateOpen(false);
      reset();
      fetchEvents();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || 'Failed to create event');
    }
  };

  // Open registration confirmation modal
  const openRegisterModal = (event: Event) => {
    setSelectedEvent(event);
    regReset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: '',
      rollNumber: '',
      department: '',
      specialRequirements: '',
    });
    setIsRegisterOpen(true);
  };

  // Submit registration after confirmation
  const onRegisterSubmit = async (_data: RegisterFormData) => {
    if (!selectedEvent) return;
    setIsRegistering(true);
    try {
      await eventApi.registerForEvent(selectedEvent.id);
      toast.success(`You're registered for "${selectedEvent.title}"! 🎉`);
      setIsRegisterOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || 'Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await eventApi.updateEventStatus(id, status);
      toast.success(`Event ${status.toLowerCase()} successfully`);
      fetchEvents();
    } catch {
      toast.error(`Failed to ${status.toLowerCase()} event`);
    }
  };

  const confirmTakeDown = (event: Event) => {
    setEventToTakeDown(event);
    setIsTakeDownOpen(true);
  };

  const handleTakeDownSubmit = async () => {
    if (!eventToTakeDown) return;
    setIsTakingDown(true);
    try {
      await eventApi.deleteEvent(eventToTakeDown.id);
      toast.success('Event taken down successfully and notifications sent');
      setIsTakeDownOpen(false);
      setEventToTakeDown(null);
      fetchEvents();
    } catch {
      toast.error('Failed to take down event');
    } finally {
      setIsTakingDown(false);
    }
  };

  const isUserRegistered = (event: Event) => {
    return event.registrations?.some(reg => reg.userId === user?.id) || false;
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Apply Frontend Filtering
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || event.status === statusFilter;

    const isUpcoming = new Date(event.date) >= new Date();
    const matchesDate =
      dateFilter === 'ALL' ||
      (dateFilter === 'UPCOMING' && isUpcoming) ||
      (dateFilter === 'PAST' && !isUpcoming);

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-syne text-text-primary tracking-tight">Events</h1>
            <p className="text-sm text-text-secondary">Loading your events calendar...</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="skeleton h-[360px] border border-border-subtle" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-dm-sans">
      {/* Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight">Events</h1>
          <p className="text-sm text-text-secondary mt-1">
            Browse and register for campus events
          </p>
        </div>
        {canCreateEvent && (
          <Button onClick={() => setIsCreateOpen(true)} className="cursor-pointer">
            <Plus className="h-4 w-4 shrink-0" />
            Create Event
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-bg-surface p-4 rounded-[10px] border border-border-subtle shadow-sm">
        <div className="w-full md:flex-1">
          <Input
            placeholder="Search events by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <div className="w-1/2 md:w-44">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          <div className="w-1/2 md:w-44">
            <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="ALL">All Dates</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Past Events</option>
            </Select>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <Card variant="default">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Calendar className="h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-bold font-syne text-text-primary">No events found</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm text-center">
              {canCreateEvent
                ? 'Create a new event or adjust your filters.'
                : 'No upcoming events match your filters. Check back later!'}
            </p>
            {canCreateEvent && (
              <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, idx) => {
            const registered = isUserRegistered(event);
            const registrationsCount = event._count?.registrations ?? 0;
            const capacityPercent = Math.min(100, Math.round((registrationsCount / event.capacity) * 100));

            return (
              <Card
                key={event.id}
                variant="elevated"
                className="stagger-item group flex flex-col justify-between h-full relative"
              >
                {/* Image Placeholder with grid overlay */}
                <div className="h-40 w-full bg-gradient-to-br from-brand-primary to-brand-secondary/80 relative flex items-center justify-center overflow-hidden shrink-0 select-none">
                  <div className="absolute inset-0 bg-black/25" />
                  <Calendar className="h-12 w-12 text-white/35 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  
                  {/* Absolute Badge corner overlays */}
                  {registered && (
                    <Badge variant="success" className="absolute top-3 left-3 shadow-md">
                      Registered
                    </Badge>
                  )}
                  <Badge variant={statusVariant[event.status] || 'ghost'} className="absolute top-3 right-3 shadow-md capitalize">
                    {event.status.toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-base font-bold font-syne text-text-primary tracking-tight leading-snug group-hover:text-brand-secondary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-text-secondary font-dm-sans line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="mt-5 space-y-4 pt-4 border-t border-border-subtle/50">
                    {/* Event metadata details */}
                    <div className="space-y-2 text-xs text-text-secondary font-dm-sans">
                      <div className="flex items-center gap-2.5">
                        <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>

                    {/* Progress capacity gauge */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-text-secondary font-mono leading-none">
                        <span>Attending</span>
                        <span className="font-semibold">{registrationsCount} / {event.capacity} seats</span>
                      </div>
                      <div className="h-1.5 w-full bg-bg-base rounded-full overflow-hidden border border-border-subtle">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            capacityPercent >= 100 ? 'bg-error' : capacityPercent >= 80 ? 'bg-warning' : 'bg-brand-primary'
                          )}
                          style={{ width: `${capacityPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    {user?.role === Role.STUDENT && (event.status === 'APPROVED' || event.status === 'PENDING_APPROVAL') && (
                      <Button
                        size="sm"
                        variant={registered ? 'secondary' : 'primary'}
                        className="w-full"
                        onClick={() => openRegisterModal(event)}
                        disabled={registered || registrationsCount >= event.capacity}
                      >
                        {registered
                          ? 'Registered ✓'
                          : registrationsCount >= event.capacity
                          ? 'Event Full'
                          : 'Register for Event'}
                      </Button>
                    )}

                    {user?.role === Role.ADMIN && (
                      <div className="flex flex-col gap-2">
                        {event.status === 'PENDING_APPROVAL' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full bg-success/15 border-success/30 hover:bg-success/25 text-success cursor-pointer"
                              onClick={() => handleUpdateStatus(event.id, 'APPROVED')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full hover:bg-error/15 hover:text-error cursor-pointer"
                              onClick={() => handleUpdateStatus(event.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {(event.status === 'APPROVED' || event.status === 'PENDING_APPROVAL') && (
                          <Button
                            size="sm"
                            variant="danger"
                            className="w-full"
                            onClick={() => confirmTakeDown(event)}
                          >
                            Take Down
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Registration Confirmation Modal ─────────────────────────────────── */}
      {isRegisterOpen && selectedEvent && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 flex justify-center items-center">
            <div className="relative w-full max-w-lg animate-page-enter">
              <Card variant="glass" className="border-border-strong shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border-subtle p-5">
                  <div>
                    <h3 className="text-lg font-bold font-syne text-text-primary">Confirm Registration</h3>
                    <p className="text-xs text-text-secondary mt-1 font-dm-sans">
                      Verify your details to secure a seat
                    </p>
                  </div>
                  <button
                    onClick={() => { setIsRegisterOpen(false); setSelectedEvent(null); }}
                    className="rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Event Summary */}
                <div className="mx-5 mt-5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 p-4">
                  <h4 className="font-bold text-brand-primary text-xs font-syne tracking-wider uppercase mb-2">
                    Event Overview
                  </h4>
                  <p className="text-text-primary font-bold text-sm leading-snug">{selectedEvent.title}</p>
                  <div className="mt-3.5 space-y-1.5 text-xs text-text-secondary font-dm-sans">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-brand-primary" />
                      <span>
                        {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                      <span>{selectedEvent.venue}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={regHandleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4 pt-5 pb-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="reg-name" required>Full Name</Label>
                        <Input id="reg-name" placeholder="Your name" {...regRegister('name')} error={regErrors.name?.message} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="reg-email" required>Email</Label>
                        <Input id="reg-email" type="email" placeholder="you@university.edu" {...regRegister('email')} error={regErrors.email?.message} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="reg-phone">Phone Number</Label>
                        <Input id="reg-phone" type="tel" placeholder="9876543210" {...regRegister('phone')} error={regErrors.phone?.message} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="reg-roll">Roll Number</Label>
                        <Input id="reg-roll" placeholder="CS202610" {...regRegister('rollNumber')} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="reg-special">Special Requirements</Label>
                      <Textarea
                        id="reg-special"
                        placeholder="Dietary needs, accessibility requirements, etc."
                        {...regRegister('specialRequirements')}
                        className="min-h-[70px]"
                      />
                    </div>
                  </CardContent>

                  <div className="flex justify-end gap-3 border-t border-border-subtle p-5 mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setIsRegisterOpen(false); setSelectedEvent(null); }}
                      disabled={isRegistering}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isRegistering}>
                      Confirm &amp; Register
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </Portal>
      )}

      {/* ─── Create Event Modal ───────────────────────────────────────────────── */}
      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center items-center">
            <div className="relative w-full max-w-lg animate-page-enter">
              <Card variant="glass" className="border-border-strong shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-subtle p-5">
                  <h3 className="text-lg font-bold font-syne text-text-primary">Create New Event</h3>
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
                      <Label htmlFor="event-title" required>Event Title</Label>
                      <Input id="event-title" placeholder="Annual Tech Fest" {...register('title')} error={errors.title?.message} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="event-description" required>Description</Label>
                      <Textarea id="event-description" placeholder="Provide details about the event..." {...register('description')} error={errors.description?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="event-date" required>Date &amp; Time</Label>
                        <Input id="event-date" type="datetime-local" {...register('date')} error={errors.date?.message} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="event-capacity" required>Capacity</Label>
                        <Input id="event-capacity" type="number" {...register('capacity', { valueAsNumber: true })} error={errors.capacity?.message} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="event-venue" required>Venue</Label>
                      <Input id="event-venue" placeholder="Main Auditorium" {...register('venue')} error={errors.venue?.message} />
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-3 border-t border-border-subtle p-5 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Publish Event
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </Portal>
      )}

      {/* ─── Admin Take-Down Confirm Modal ────────────────────────────────────── */}
      {isTakeDownOpen && eventToTakeDown && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 flex justify-center items-center">
            <div className="relative w-full max-w-md animate-page-enter">
              <Card variant="elevated" className="border-error/35 shadow-2xl bg-bg-surface">
                <div className="p-6 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-syne text-text-primary">Take Down Event?</h3>
                    <p className="text-xs text-text-secondary mt-1.5 font-dm-sans leading-relaxed">
                      Are you sure you want to delete <strong className="text-text-primary">&quot;{eventToTakeDown.title}&quot;</strong>? This action will notify all registered students and remove it permanently.
                    </p>
                  </div>
                  <div className="flex gap-3 pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => { setIsTakeDownOpen(false); setEventToTakeDown(null); }}
                      disabled={isTakingDown}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="w-full"
                      onClick={handleTakeDownSubmit}
                      isLoading={isTakingDown}
                    >
                      Confirm Deletion
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
