'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Download, BookOpen, Trash2, X, Search, FileSignature } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { noteApi } from '@/services/note.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Portal } from '@/components/ui/portal';
import { createNoteSchema, type CreateNoteFormData } from '@/lib/validators';
import type { Note } from '@/types';
import { Role } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const user = useAuthStore((state) => state.user);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');

  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { notes: data } = await noteApi.getNotes({ limit: 40 });
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

  // Apply filters
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      subjectFilter === 'ALL' || note.subject.toLowerCase() === subjectFilter.toLowerCase();

    const matchesSemester =
      semesterFilter === 'ALL' || note.semester.toString() === semesterFilter;

    return matchesSearch && matchesSubject && matchesSemester;
  });

  // Unique subjects for filter list
  const uniqueSubjects = Array.from(
    new Set(notes.map((n) => n.subject.trim().toLowerCase()))
  );

  const getFileIcon = (fileUrl: string) => {
    const ext = fileUrl.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
          <FileText className="h-5 w-5" />
        </div>
      );
    }
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <FileSignature className="h-5 w-5" />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-syne text-text-primary tracking-tight">Study Notes</h1>
            <p className="text-sm text-text-secondary">Loading study resources library...</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="skeleton h-[200px] border border-border-subtle" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-dm-sans relative pb-16">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight">Study Notes</h1>
          <p className="text-sm text-text-secondary mt-1">
            Share and discover lecture slides, guides, and resources
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="hidden sm:inline-flex cursor-pointer">
          <Upload className="h-4 w-4 shrink-0" />
          Upload Note
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-bg-surface p-4 rounded-[10px] border border-border-subtle shadow-sm">
        <div className="w-full md:flex-1">
          <Input
            placeholder="Search notes by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <div className="w-1/2 md:w-44">
            <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              <option value="ALL">All Subjects</option>
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub} className="capitalize">
                  {sub}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-1/2 md:w-44">
            <Select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem.toString()}>
                  Semester {sem}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <Card variant="default">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <BookOpen className="h-12 w-12 text-text-muted mb-4" />
            <h3 className="text-lg font-bold font-syne text-text-primary">No resources shared</h3>
            <p className="text-sm text-text-secondary mt-1 max-w-sm text-center">
              Be the first to share study resources or notes for this subject filter.
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="mt-4">
              <Upload className="h-4 w-4" />
              Upload Study Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              variant="elevated"
              className="stagger-item group flex flex-col justify-between h-full bg-bg-surface border border-border-subtle"
            >
              <CardContent className="p-5 space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {getFileIcon(note.fileUrl)}
                      <div className="min-w-0">
                        <h3 className="font-bold text-text-primary truncate leading-snug group-hover:text-brand-secondary transition-colors">
                          {note.title}
                        </h3>
                        {/* Uploader profile information */}
                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-1 select-none">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold font-mono border border-brand-primary/20">
                            {note.user?.name ? note.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="truncate">by {note.user?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {note.description && (
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 font-dm-sans">
                      {note.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border-subtle/50">
                  {/* Category/Sem badge pill keys */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="capitalize">{note.subject}</Badge>
                      <Badge variant="ghost">Sem {note.semester}</Badge>
                    </div>
                    {/* Mock downloads count */}
                    <span className="text-[10px] font-mono text-text-muted select-none">
                      {(parseInt(note.id.substring(0, 2), 16) % 35) + 3} downloads
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block flex-1"
                    >
                      <Button size="sm" variant="secondary" className="w-full h-9">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    </a>
                    {(user?.role === Role.ADMIN || note.userId === user?.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:bg-error/15 hover:text-error text-text-muted h-9 w-9 rounded-lg"
                        onClick={() => handleDelete(note.id)}
                        title="Delete notes resource"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) for mobile & desktop upload accessibility */}
      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg shadow-brand-glow hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
          title="Upload resources"
        >
          <Upload className="h-5 w-5 text-white" />
        </Button>
      </div>

      {isCreateOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex justify-center items-center">
            <div className="relative w-full max-w-lg animate-page-enter">
              <Card variant="glass" className="border-border-strong shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-subtle p-5">
                  <h3 className="text-lg font-bold font-syne text-text-primary">Upload Study Material</h3>
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
                      <Label htmlFor="note-title" required>Title</Label>
                      <Input id="note-title" placeholder="Engineering Physics Lecture Notes" {...register('title')} error={errors.title?.message} />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="note-subject" required>Subject</Label>
                      <Input id="note-subject" placeholder="Physics" {...register('subject')} error={errors.subject?.message} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="note-semester" required>Semester</Label>
                        <Select id="note-semester" {...register('semester', { valueAsNumber: true })}>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="note-file-dummy" required>File Upload</Label>
                        <div className="relative border border-dashed border-border-default hover:border-brand-primary/50 transition-colors rounded-lg h-10 flex items-center px-3 bg-bg-base cursor-pointer overflow-hidden">
                          <input
                            id="note-file"
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                setFile(files[0]);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Upload className="h-4 w-4 text-text-muted mr-2" />
                          <span className="text-xs text-text-secondary truncate pr-6">
                            {file ? file.name : 'Choose study file...'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="note-description">Description (Optional)</Label>
                      <Textarea id="note-description" placeholder="Brief details about the topic..." {...register('description')} error={errors.description?.message} />
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-3 border-t border-border-subtle p-5 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                      Upload Resource
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
