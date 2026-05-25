'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Download, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteApi } from '@/services/note.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Portal } from '@/components/ui/portal';
import { createNoteSchema, type CreateNoteFormData } from '@/lib/validators';
import type { Note } from '@/types';
import { Role } from '@/types';
import { useAuthStore } from '@/store/auth.store';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const user = useAuthStore((state) => state.user);

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { notes: data } = await noteApi.getNotes({ limit: 20 });
      setNotes(data);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteFormData>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: { title: '', description: '', subject: '', semester: 1 },
  });

  const onCreateSubmit = async (data: CreateNoteFormData) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      await noteApi.createNote({
        ...data,
        file,
      });
      toast.success('Note uploaded successfully!');
      setIsCreateOpen(false);
      setFile(null);
      reset();
      fetchNotes();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || 'Failed to upload note');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await noteApi.deleteNote(id);
      toast.success('Note deleted successfully');
      fetchNotes();
    } catch {
      toast.error('Failed to delete note');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Notes & Resources</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 w-2/3 rounded bg-slate-800 mb-3" />
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
          <h1 className="text-2xl font-bold text-white">Notes & Resources</h1>
          <p className="text-sm text-slate-400 mt-1">
            Share and discover study materials
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Upload className="h-4 w-4" />
          Upload Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-lg font-medium text-slate-400">No notes shared yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Be the first to share study resources!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="group hover:border-slate-700 transition-all duration-300"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-200 truncate">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        by {note.user?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
                {note.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {note.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="default">{note.subject}</Badge>
                  <Badge variant="secondary">Sem {note.semester}</Badge>
                </div>
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="sm" variant="secondary" className="w-full">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </a>
                {(user?.role === Role.ADMIN || note.userId === user?.id) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 mt-2"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Note
                  </Button>
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
                  <CardTitle className="text-xl font-bold text-white">Upload Study Material</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onCreateSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="note-title" required>Title</Label>
                      <Input id="note-title" placeholder="Engineering Physics Lecture Notes" {...register('title')} error={errors.title?.message} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note-subject" required>Subject</Label>
                      <Input id="note-subject" placeholder="Physics" {...register('subject')} error={errors.subject?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="note-semester" required>Semester</Label>
                        <Input id="note-semester" type="number" min={1} max={8} {...register('semester', { valueAsNumber: true })} error={errors.semester?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="note-file" required>File (PDF, Doc, Image)</Label>
                        <Input
                          id="note-file"
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              setFile(files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note-description">Description (Optional)</Label>
                      <Textarea id="note-description" placeholder="Brief details about the topic..." {...register('description')} error={errors.description?.message} />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-3 border-t border-slate-800/60 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Upload
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
