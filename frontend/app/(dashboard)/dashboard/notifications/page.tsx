'use client';

import { useEffect } from 'react';
import { Bell, Check, CheckCircle2, Calendar, MessageSquareWarning, Settings, Bot, Search } from 'lucide-react';
import { useNotificationStore } from '@/store/notification.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/types';

const typeIcon: Record<string, React.ElementType> = {
  [NotificationType.EVENT]: Calendar,
  [NotificationType.COMPLAINT]: MessageSquareWarning,
  [NotificationType.SYSTEM]: Settings,
  [NotificationType.AI]: Bot,
  [NotificationType.LOST_FOUND]: Search,
};

const typeColors: Record<string, { bg: string; text: string }> = {
  [NotificationType.EVENT]: { bg: 'bg-brand-primary/10 border-brand-primary/20', text: 'text-brand-primary' },
  [NotificationType.COMPLAINT]: { bg: 'bg-warning/10 border-warning/20', text: 'text-warning' },
  [NotificationType.SYSTEM]: { bg: 'bg-bg-elevated border-border-default/50', text: 'text-text-secondary' },
  [NotificationType.AI]: { bg: 'bg-brand-secondary/10 border-brand-secondary/20', text: 'text-brand-secondary' },
  [NotificationType.LOST_FOUND]: { bg: 'bg-success/10 border-success/20', text: 'text-success' },
};

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-syne text-text-primary tracking-tight">Notifications</h1>
            <p className="text-sm text-text-secondary">Loading incoming alerts...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="skeleton h-[80px] border border-border-subtle" />
          ))}
        </div>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-6 font-dm-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight">Notifications</h1>
          <p className="text-sm text-text-secondary mt-1">
            Stay updated on campus activities and bulletins
          </p>
        </div>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="cursor-pointer">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card variant="default">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Bell className="h-12 w-12 text-text-muted mb-4 animate-float" />
            <h3 className="text-lg font-bold font-syne text-text-primary">All caught up!</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm text-center">
              You have no new alerts. Enjoy the peace and quiet!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = typeIcon[notification.type] || Bell;
            const colors = typeColors[notification.type] || { bg: 'bg-bg-elevated', text: 'text-text-secondary' };

            return (
              <Card
                key={notification.id}
                variant="default"
                className={cn(
                  'border-border-subtle transition-all duration-150',
                  !notification.isRead
                    ? 'border-l-4 border-l-brand-primary bg-bg-surface shadow-md'
                    : 'border-l-4 border-l-transparent bg-bg-surface/50 opacity-75 hover:opacity-100'
                )}
              >
                <CardContent className="flex items-start justify-between p-4 gap-4">
                  <div className="flex gap-4 items-start min-w-0">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", colors.bg)}>
                      <Icon className={cn("h-4.5 w-4.5", colors.text)} />
                    </div>
                    <div className="min-w-0">
                      <h4 className={cn('font-bold text-sm tracking-tight', !notification.isRead ? 'text-text-primary' : 'text-text-secondary')}>
                        {notification.title}
                      </h4>
                      <p className="mt-1 text-sm text-text-secondary leading-normal font-dm-sans">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[10px] font-mono text-text-muted select-none">
                        {new Date(notification.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-text-muted hover:text-brand-primary h-8 w-8 rounded-lg cursor-pointer"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark notification as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
