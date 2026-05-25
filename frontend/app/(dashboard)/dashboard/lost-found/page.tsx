'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lostFoundApi } from '@/services/lostfound.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Portal } from '@/components/ui/portal';
import { createLostFoundSchema, type CreateLostFoundFormData } from '@/lib/validators';
import { Role, LostFoundType, type LostFound } from '@/types';
import { useAuthStore } from '@/store/auth.store';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
  ACTIVE: 'warning',
  RESOLVED: 'success',
  EXPIRED: 'secondary',
};

export default function LostFoundPage() {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<LostFound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const { items: data } = await lostFoundApi.getItems({ limit: 20 });
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Lost & Found</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-32 bg-slate-800 rounded-md mb-3" />
                <div className="h-4 w-2/3 rounded bg-slate-800 mb-2" />
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
          <h1 className="text-2xl font-bold text-white">Lost & Found</h1>
          <p className="text-sm text-slate-400 mt-1">
            Report lost items or post found belongings
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Report Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-lg font-medium text-slate-400">No items reported</p>
            <p className="text-sm text-slate-500 mt-1">
              Lost something? Create a post to notify others.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className="group hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {item.imageUrl ? (
                <div className="h-40 bg-slate-800 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 bg-slate-800 flex items-center justify-center">
                  <Search className="h-10 w-10 text-slate-600" />
                </div>
              )}
              
              <CardHeader className="pb-3 flex-none">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base leading-tight">
                    {item.title}
                  </CardTitle>
                  <Badge variant={item.type === 'LOST' ? 'danger' : 'info'}>
                    {item.type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={statusVariant[item.status] || 'secondary'} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </div>
                </div>
                
                {(user?.id === item.userId || user?.role === Role.ADMIN) && (
                  <div className="flex gap-2 mt-4">
                    {item.status === 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleResolve(item.id)}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center">
            <div className="relative my-auto w-full max-w-lg">
              <Card className="border-slate-800 bg-slate-950">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Report Lost & Found Item</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onCreateSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-title" required>Item Name / Title</Label>
                      <Input id="item-title" placeholder="Keys with blue keychain, Black umbrella" {...register('title')} error={errors.title?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-type" required>Type</Label>
                        <select
                          id="item-type"
                          className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                          {...register('type')}
                        >
                          <option value="LOST">Lost</option>
                          <option value="FOUND">Found</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="item-location" required>Location</Label>
                        <Input id="item-location" placeholder="Near library, Class 204" {...register('location')} error={errors.location?.message} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-image">Photo (Optional)</Label>
                      <Input
                        id="item-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setImage(files[0]);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-description" required>Description</Label>
                      <Textarea id="item-description" placeholder="Provide details like brand, color, condition, where/when it was lost/found..." {...register('description')} error={errors.description?.message} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 border-t border-slate-800/60 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Submit Report
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
