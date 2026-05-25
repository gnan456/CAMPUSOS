'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MapPin, Trash2, X, CheckCircle2, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lostFoundApi } from '@/services/lostfound.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Portal } from '@/components/ui/portal';
import { createLostFoundSchema, type CreateLostFoundFormData } from '@/lib/validators';
import { Role, LostFoundType, type LostFound } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export default function LostFoundPage() {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<LostFound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const { items: data } = await lostFoundApi.getItems({ limit: 40 });
      setItems(data);
    } catch {
      toast.error('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateLostFoundFormData>({
    resolver: zodResolver(createLostFoundSchema),
    defaultValues: { title: '', description: '', type: LostFoundType.LOST, location: '' },
  });

  const onCreateSubmit = async (data: CreateLostFoundFormData) => {
    try {
      await lostFoundApi.createItem({
        ...data,
        ...(image ? { image } : {}),
      });
      toast.success('Item reported successfully!');
      setIsCreateOpen(false);
      setImage(null);
      reset();
      fetchItems();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || 'Failed to report item');
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleResolve = async (id: string) => {
    try {
      await lostFoundApi.resolveItem(id);
      toast.success('Item marked as resolved');
      fetchItems();
    } catch {
      toast.error('Failed to resolve item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await lostFoundApi.deleteItem(id);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  // Filter items based on active tab
  const filteredItems = items.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.type === activeTab;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-syne text-text-primary tracking-tight">Lost & Found</h1>
            <p className="text-sm text-text-secondary">Loading reported items bulletin...</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="skeleton h-[280px] border border-border-subtle" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-dm-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight">Lost & Found</h1>
          <p className="text-sm text-text-secondary mt-1">
            Report lost items or post found belongings
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="cursor-pointer">
          <Plus className="h-4 w-4 shrink-0" />
          Report Item
        </Button>
      </div>

      {/* Lost & Found toggles */}
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
          All Items
        </button>
        <button
          onClick={() => setActiveTab('LOST')}
          className={cn(
            'px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer font-syne',
            activeTab === 'LOST'
              ? 'border-brand-primary text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Lost Items
        </button>
        <button
          onClick={() => setActiveTab('FOUND')}
          className={cn(
            'px-4 py-2 text-sm font-semibold border-b-2 transition-all duration-150 cursor-pointer font-syne',
            activeTab === 'FOUND'
              ? 'border-brand-primary text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          Found Items
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <Card variant="default">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Search className="h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-bold font-syne text-text-primary">No items reported</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm text-center">
              Have you misplaced something? File a bulletin post to let the campus know.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
              <Plus className="h-4 w-4" />
              Report Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              variant="elevated"
              className="stagger-item group flex flex-col justify-between h-full relative"
            >
              {/* Overlay for Resolved Items */}
              {item.status === 'RESOLVED' && (
                <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center select-none rounded-[10px] animate-fade-in">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success border border-success/20 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-success uppercase tracking-widest">Belonging Returned</span>
                </div>
              )}

              {/* Item Photo banner or placeholder */}
              <div className="relative shrink-0 overflow-hidden select-none border-b border-border-subtle bg-bg-elevated h-40">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:15px_15px]">
                    <Search className="h-10 w-10 text-text-muted group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
                <Badge variant={item.type === LostFoundType.LOST ? 'error' : 'default'} className="absolute top-3 right-3 shadow-md uppercase tracking-wider scale-95 font-mono">
                  {item.type}
                </Badge>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-base font-bold font-syne text-text-primary tracking-tight leading-snug group-hover:text-brand-secondary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary font-dm-sans line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-5 space-y-4 pt-4 border-t border-border-subtle/50">
                  <div className="space-y-1.5 text-xs text-text-secondary font-dm-sans">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                      <span className="truncate">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {(user?.id === item.userId || user?.role === Role.ADMIN) && (
                    <div className="flex gap-2">
                      {item.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full h-9 text-xs"
                          onClick={() => handleResolve(item.id)}
                        >
                          Mark Resolved
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-error/15 hover:text-error text-text-muted h-9 w-9 rounded-lg px-0 shrink-0"
                        onClick={() => handleDelete(item.id)}
                        title="Delete bulletin entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center items-center">
            <div className="relative w-full max-w-lg animate-page-enter">
              <Card variant="glass" className="border-border-strong shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-subtle p-5">
                  <h3 className="text-lg font-bold font-syne text-text-primary">Report Lost & Found Item</h3>
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
                      <Label htmlFor="item-title" required>Item Name / Title</Label>
                      <Input id="item-title" placeholder="Keys with blue keychain, Black umbrella" {...register('title')} error={errors.title?.message} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="item-type" required>Type</Label>
                        <Select id="item-type" {...register('type')}>
                          <option value={LostFoundType.LOST}>Lost</option>
                          <option value={LostFoundType.FOUND}>Found</option>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="item-location" required>Location</Label>
                        <Input id="item-location" placeholder="Near library, Class 204" {...register('location')} error={errors.location?.message} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="item-image-selector">Photo (Optional)</Label>
                      <div className="relative border border-dashed border-border-default hover:border-brand-primary/50 transition-colors rounded-lg h-10 flex items-center px-3 bg-bg-base cursor-pointer overflow-hidden">
                        <input
                          id="item-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              setImage(files[0]);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Upload className="h-4 w-4 text-text-muted mr-2" />
                        <span className="text-xs text-text-secondary truncate pr-6">
                          {image ? image.name : 'Upload item photo (optional)'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="item-description" required>Description</Label>
                      <Textarea id="item-description" placeholder="Provide details like brand, color, condition, where/when it was lost/found..." {...register('description')} error={errors.description?.message} />
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-3 border-t border-border-subtle p-5 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Publish Report
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
