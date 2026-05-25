'use client';

import { useEffect } from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '@/store/notification.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/types';

const typeColor: Record<string, string> = {
  EVENT: 'bg-violet-500',
  COMPLAINT: 'bg-amber-500',
  SYSTEM: 'bg-slate-500',
  AI: 'bg-emerald-500',
  LOST_FOUND: 'bg-sky-500',
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
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 w-1/3 rounded bg-slate-800 mb-2" />
                <div className="h-3 w-1/2 rounded bg-slate-800" />
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
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">
            Stay updated on campus activities
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-lg font-medium text-slate-400">All caught up!</p>
            <p className="text-sm text-slate-500 mt-1">
              You have no new notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'transition-all duration-200',
                !notification.isRead ? 'border-violet-500/50 bg-slate-900/80' : 'opacity-70 hover:opacity-100'
              )}
            >
              <CardContent className="flex items-start justify-between p-4">
                <div className="flex gap-4">
                  <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full">
                    <span
                      className={cn(
                        'h-full w-full rounded-full',
                        typeColor[notification.type] || 'bg-slate-500',
                        !notification.isRead && 'animate-pulse ring-4 ring-current/20'
                      )}
                    />
                  </div>
                  <div>
                    <h4 className={cn('font-medium', !notification.isRead ? 'text-white' : 'text-slate-300')}>
                      {notification.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-400">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-slate-400 hover:text-violet-400"
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
