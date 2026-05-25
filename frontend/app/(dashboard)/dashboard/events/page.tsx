'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Users, Plus, X, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { eventApi } from '@/services/event.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Portal } from '@/components/ui/portal';
import { createEventSchema, type CreateEventFormData } from '@/lib/validators';
import { Role, type Event } from '@/types';

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

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
  APPROVED: 'success',
  PENDING_APPROVAL: 'warning',
  DRAFT: 'secondary',
  REJECTED: 'danger',
  CANCELLED: 'danger',
  COMPLETED: 'info',
};

export default function EventsPage() {
  const user = useAuthStore((state) => state.user);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Registration modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const canCreateEvent = user?.role === Role.ADMIN || user?.role === Role.CLUB_COORDINATOR;

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const { events: data } = await eventApi.getEvents({ limit: 20 });
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

  const handleDeleteEvent = async (id: string) => {
    try {
      await eventApi.deleteEvent(id);
      toast.success('Event taken down successfully and notifications sent');
      fetchEvents();
    } catch {
      toast.error('Failed to take down event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Events</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 w-3/4 rounded bg-slate-800 mb-3" />
                <div className="h-3 w-1/2 rounded bg-slate-800 mb-2" />
                <div className="h-3 w-2/3 rounded bg-slate-800" />
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
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and register for campus events
          </p>
        </div>
        {canCreateEvent && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-lg font-medium text-slate-400">No events yet</p>
            <p className="text-sm text-slate-500 mt-1">
              {canCreateEvent
                ? 'Create the first event for your campus!'
                : 'Check back later for upcoming events.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card
              key={event.id}
              className="group hover:border-slate-700 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-tight">
                    {event.title}
                  </CardTitle>
                  <Badge variant={statusVariant[event.status] || 'secondary'}>
                    {event.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-400 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.venue}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    {event._count?.registrations ?? 0} / {event.capacity} registered
                  </div>
                </div>
                {user?.role === Role.STUDENT && (event.status === 'APPROVED' || event.status === 'PENDING_APPROVAL') && (
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => openRegisterModal(event)}
                    disabled={(event._count?.registrations ?? 0) >= event.capacity}
                  >
                    {(event._count?.registrations ?? 0) >= event.capacity
                      ? 'Full – No Seats Left'
                      : 'Register'}
                  </Button>
                )}
                {user?.role === Role.ADMIN && (
                  <div className="flex flex-col gap-2 mt-2">
                    {event.status === 'PENDING_APPROVAL' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleUpdateStatus(event.id, 'APPROVED')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleUpdateStatus(event.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {(event.status === 'APPROVED' || event.status === 'PENDING_APPROVAL') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Take Down
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── Registration Confirmation Modal ─────────────────────────────────── */}
      {isRegisterOpen && selectedEvent && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 flex justify-center">
            <div className="relative my-auto w-full max-w-lg">
              <Card className="border-slate-700 bg-slate-950 shadow-2xl">
                {/* Header */}
                <CardHeader className="border-b border-slate-800/60 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-white">
                        Confirm Registration
                      </CardTitle>
                      <p className="text-sm text-slate-400 mt-1">
                        Review your details before registering
                      </p>
                    </div>
                    <button
                      onClick={() => { setIsRegisterOpen(false); setSelectedEvent(null); }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </CardHeader>

                {/* Event Summary Banner */}
                <div className="mx-6 mt-5 rounded-xl bg-violet-600/10 border border-violet-500/20 p-4">
                  <h3 className="font-semibold text-violet-300 text-sm mb-2">
                    📅 Event Details
                  </h3>
                  <p className="text-white font-medium">{selectedEvent.title}</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-violet-400" />
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-violet-400" />
                      {selectedEvent.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-violet-400" />
                      {selectedEvent._count?.registrations ?? 0} / {selectedEvent.capacity} spots filled
                    </div>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={regHandleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4 pt-5">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                      Your Information
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-name" required>Full Name</Label>
                        <Input
                          id="reg-name"
                          placeholder="Your full name"
                          {...regRegister('name')}
                          error={regErrors.name?.message}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email" required>Email</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@college.edu"
                          {...regRegister('email')}
                          error={regErrors.email?.message}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-phone">Phone Number</Label>
                        <Input
                          id="reg-phone"
                          type="tel"
                          placeholder="e.g. 9876543210"
                          {...regRegister('phone')}
                          error={regErrors.phone?.message}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-roll">Roll Number</Label>
                        <Input
                          id="reg-roll"
                          placeholder="e.g. CS2024001"
                          {...regRegister('rollNumber')}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="reg-dept">Department</Label>
                      <Input
                        id="reg-dept"
                        placeholder="e.g. Computer Science"
                        {...regRegister('department')}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="reg-special">Special Requirements <span className="text-slate-500 font-normal">(optional)</span></Label>
                      <Textarea
                        id="reg-special"
                        placeholder="Dietary needs, accessibility requirements, etc."
                        {...regRegister('specialRequirements')}
                        className="min-h-[70px]"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 bg-slate-900 rounded-lg p-3 leading-relaxed">
                      ✅ By clicking <strong className="text-slate-300">Confirm Registration</strong>, you agree to attend this event. 
                      Your details will be shared with the event organiser.
                    </p>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-3 border-t border-slate-800/60 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setIsRegisterOpen(false); setSelectedEvent(null); }}
                      disabled={isRegistering}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isRegistering}>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Registration
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </div>
          </div>
        </Portal>
      )}

      {/* ─── Create Event Modal ───────────────────────────────────────────────── */}
      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center">
            <div className="relative my-auto w-full max-w-lg">
              <Card className="border-slate-800 bg-slate-950">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white">Create New Event</CardTitle>
                    <button
                      onClick={() => setIsCreateOpen(false)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </CardHeader>
                <form onSubmit={handleSubmit(onCreateSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title" required>Event Title</Label>
                      <Input id="event-title" placeholder="Annual Tech Fest" {...register('title')} error={errors.title?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-description" required>Description</Label>
                      <Textarea id="event-description" placeholder="Provide details about the event..." {...register('description')} error={errors.description?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date" required>Date &amp; Time</Label>
                        <Input id="event-date" type="datetime-local" {...register('date')} error={errors.date?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-capacity" required>Capacity</Label>
                        <Input id="event-capacity" type="number" {...register('capacity', { valueAsNumber: true })} error={errors.capacity?.message} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-venue" required>Venue</Label>
                      <Input id="event-venue" placeholder="Main Auditorium" {...register('venue')} error={errors.venue?.message} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 border-t border-slate-800/60 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Create Event
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
