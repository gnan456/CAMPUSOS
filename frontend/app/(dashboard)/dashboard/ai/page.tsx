'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Calendar, Send, X, Clock, Trash2 } from 'lucide-react';
import { aiApi } from '@/services/ai.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Portal } from '@/components/ui/portal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  text: string;
}

function MarkdownRenderer({ text }: MarkdownRendererProps) {
  // Helper to parse inline styles: bold (**text**) and code (`text`)
  const parseInlineStyles = (line: string) => {
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = line.split(regex);
    
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold text-text-primary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-bg-base/70 font-mono text-xs border border-border-subtle text-brand-secondary">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Split text into structural blocks (paragraphs, lists, tables)
  const blocks = text.replace(/\r\n/g, '\n').split('\n\n');

  return (
    <div className="space-y-3 font-dm-sans">
      {blocks.map((block, bIdx) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;

        // 1. Render Markdown Table
        if (trimmedBlock.startsWith('|')) {
          const lines = trimmedBlock.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length >= 2) {
            // Header columns
            const headers = lines[0]
              .split('|')
              .map(cell => cell.trim())
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

            // Skip lines[1] because it is the alignment row e.g. | :--- | :--- |
            // Body rows
            const bodyRows = lines.slice(2).map(line => {
              return line
                .split('|')
                .map(cell => cell.trim())
                .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            });

            return (
              <div key={bIdx} className="my-3 overflow-x-auto border border-border-subtle rounded-xl bg-bg-base/40 shadow-sm max-w-full">
                <table className="min-w-full divide-y divide-border-subtle text-xs border-collapse">
                  <thead className="bg-bg-surface/80 backdrop-blur-xs font-syne">
                    <tr>
                      {headers.map((header, hIdx) => (
                        <th key={hIdx} className="px-4 py-2.5 text-left font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle">
                          {parseInlineStyles(header)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle/30 bg-bg-surface/20">
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-bg-surface/50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 text-text-secondary">
                            {parseInlineStyles(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 2. Render Bullet List
        const lines = trimmedBlock.split('\n');
        const isBulletList = lines.every(line => {
          const l = line.trim();
          return l.startsWith('•') || l.startsWith('*') || l.startsWith('-');
        });

        if (isBulletList && lines.length > 0) {
          return (
            <ul key={bIdx} className="list-disc pl-5 my-2 space-y-1.5 text-text-secondary">
              {lines.map((line, lIdx) => {
                const cleanLine = line.trim().replace(/^[•*\-]\s*/, '');
                return (
                  <li key={lIdx} className="leading-relaxed">
                    {parseInlineStyles(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // 3. Render Normal Paragraph / Mixed content
        return (
          <p key={bIdx} className="leading-relaxed text-text-primary mb-2 last:mb-0">
            {lines.map((line, lIdx) => (
              <span key={lIdx} className="block mt-1 first:mt-0">
                {parseInlineStyles(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function AIPage() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Summarizer states
  const [isSummarizeOpen, setIsSummarizeOpen] = useState(false);
  const [summarizeText, setSummarizeText] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [isSummarizeLoading, setIsSummarizeLoading] = useState(false);

  // Planner states
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [subjectsInput, setSubjectsInput] = useState('');
  const [timetableResult, setTimetableResult] = useState<any>(null);
  const [isPlannerLoading, setIsPlannerLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatLoading]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    await sendChatMessage(chatInput);
  };

  const sendChatMessage = async (text: string) => {
    const userMessage = text;
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      setIsChatLoading(true);
      const { reply } = await aiApi.chat({ message: userMessage });
      setChatHistory((prev) => [...prev, { role: 'ai', content: reply }]);
    } catch {
      toast.error('AI is currently unavailable');
      setChatHistory((prev) => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please check your connection and try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summarizeText.trim()) return;

    try {
      setIsSummarizeLoading(true);
      const res = await aiApi.summarize({ noticeText: summarizeText });
      const summaryContent = Array.isArray(res.summary) ? res.summary.join('\n') : (res.summary as string);
      setSummaryResult(summaryContent);
    } catch {
      toast.error('Failed to generate summary');
    } finally {
      setIsSummarizeLoading(false);
    }
  };

  const handleGenerateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectsInput.trim()) return;

    const subjects = subjectsInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (subjects.length === 0) return;

    try {
      setIsPlannerLoading(true);
      const res = await aiApi.generateTimetable({ subjects, preferences: {} });
      setTimetableResult(res.timetable);
    } catch {
      toast.error('Failed to generate timetable');
    } finally {
      setIsPlannerLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    toast.success('Conversation history cleared');
  };

  const suggestedPrompts = [
    'Create a study timetable for OS and Networking',
    'Summarize notice regarding semester end exams',
    'How do I file a library wifi complaint?',
  ];

  return (
    <div className="space-y-6 font-dm-sans">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-extrabold font-syne text-text-primary tracking-tight flex items-center gap-2.5">
            <Bot className="h-7 w-7 text-brand-secondary shrink-0" />
            AI Assistant
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your personal smart campus companion powered by Gemini AI
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Tools */}
        <div className="space-y-4">
          <Card variant="default" className="hover-lift">
            <CardContent className="p-5 space-y-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-syne text-text-primary">Smart Summarizer</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Paste long syllabus guides or notice boards and get a precise bullet-point summary instantly.
                </p>
              </div>
              <Button className="w-full text-xs h-9 cursor-pointer" variant="secondary" onClick={() => {
                setSummaryResult('');
                setSummarizeText('');
                setIsSummarizeOpen(true);
              }}>
                Open Summarizer
              </Button>
            </CardContent>
          </Card>

          <Card variant="default" className="hover-lift">
            <CardContent className="p-5 space-y-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success border border-success/20">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-syne text-text-primary">Study Planner</h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Provide your active semester modules to build an optimized daily review schedule with intervals.
                </p>
              </div>
              <Button className="w-full text-xs h-9 cursor-pointer" variant="secondary" onClick={() => {
                setTimetableResult(null);
                setSubjectsInput('');
                setIsPlannerOpen(true);
              }}>
                Create Timetable
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card variant="default" className="lg:col-span-2 flex flex-col h-[580px] border-border-subtle overflow-hidden">
          <CardHeader className="border-b border-border-subtle bg-bg-surface px-5 py-3.5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2 shrink-0 rounded-full bg-brand-secondary animate-pulse" />
              <CardTitle className="text-sm font-bold font-syne text-text-primary">
                Chat with Campus AI
              </CardTitle>
            </div>
            {chatHistory.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8 text-text-muted hover:text-error rounded-lg cursor-pointer"
                title="Clear conversation history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-5 space-y-4 bg-bg-base/40">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 select-none">
                <Bot className="h-12 w-12 text-text-muted animate-float" />
                <div>
                  <h4 className="text-sm font-bold font-syne text-text-primary">How can I help you today?</h4>
                  <p className="text-xs text-text-secondary max-w-sm mt-1.5 leading-relaxed font-dm-sans">
                    Ask me to schedule a study plan, draft a campus complaint, or explain academic concepts. Click a suggestion below:
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2 pt-2">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendChatMessage(prompt)}
                      className="w-full text-left text-xs bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-brand-primary/45 p-3 rounded-lg transition-all duration-150 cursor-pointer block font-dm-sans"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn('flex items-start gap-3 w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  {msg.role === 'ai' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary select-none mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm font-dm-sans leading-relaxed shadow-sm border',
                      msg.role === 'user'
                        ? 'bg-brand-primary text-white border-brand-primary/30 rounded-tr-none whitespace-pre-line'
                        : 'bg-bg-surface text-text-primary border-border-subtle rounded-tl-none'
                    )}
                  >
                    {msg.role === 'user' ? msg.content : <MarkdownRenderer text={msg.content} />}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary select-none mt-0.5 animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-bg-surface border border-border-subtle rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center shadow-sm select-none">
                  <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </CardContent>

          <div className="p-4 bg-bg-surface border-t border-border-subtle">
            <form onSubmit={handleChat} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message Campus AI..."
                className="flex-1"
                disabled={isChatLoading}
              />
              <Button type="submit" disabled={!chatInput.trim() || isChatLoading} className="h-10 px-4 cursor-pointer">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Summarizer Modal wrapped in Portal */}
      {isSummarizeOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-xl animate-page-enter">
              <Card variant="glass" className="border-border-strong shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-subtle p-5">
                  <h3 className="text-lg font-bold font-syne text-text-primary flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-primary" />
                    Smart Summarizer
                  </h3>
                  <button onClick={() => setIsSummarizeOpen(false)} className="text-text-muted hover:text-text-primary cursor-pointer rounded-lg p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSummarize}>
                  <CardContent className="space-y-4 pt-5 pb-2">
                    <div className="space-y-1">
                      <Label htmlFor="summarize-text" required>Announcement or Notes Text</Label>
                      <Textarea
                        id="summarize-text"
                        rows={5}
                        placeholder="Paste study materials or notice content (Min 10 characters)..."
                        value={summarizeText}
                        onChange={(e) => setSummarizeText(e.target.value)}
                        required
                      />
                    </div>
                    {summaryResult && (
                      <div className="space-y-2 rounded-lg bg-bg-base/75 p-4 border border-border-subtle">
                        <p className="text-xs font-bold text-brand-primary font-syne uppercase tracking-wider">AI Summary Output</p>
                        <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed font-dm-sans">{summaryResult}</p>
                      </div>
                    )}
                  </CardContent>
                  <div className="flex justify-end gap-3 border-t border-border-subtle p-5 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsSummarizeOpen(false)}>
                      Close
                    </Button>
                    <Button type="submit" isLoading={isSummarizeLoading} disabled={summarizeText.trim().length < 10}>
                      Summarize
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </Portal>
      )}

      {/* Planner Modal wrapped in Portal */}
      {isPlannerOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl animate-page-enter">
              <Card variant="glass" className="border-border-strong shadow-2xl">
                <div className="flex items-center justify-between border-b border-border-subtle p-5">
                  <h3 className="text-lg font-bold font-syne text-text-primary flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-success" />
                    Study Planner
                  </h3>
                  <button onClick={() => setIsPlannerOpen(false)} className="text-text-muted hover:text-text-primary cursor-pointer rounded-lg p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleGenerateTimetable}>
                  <CardContent className="space-y-4 pt-5 pb-2">
                    <div className="space-y-1">
                      <Label htmlFor="subjects-list" required>Subjects (Comma-separated)</Label>
                      <Input
                        id="subjects-list"
                        placeholder="e.g. Operating Systems, Theory of Computation, Graph Theory"
                        value={subjectsInput}
                        onChange={(e) => setSubjectsInput(e.target.value)}
                        required
                      />
                      <p className="text-[11px] text-text-muted mt-1">Separate subject names with a comma to populate slots.</p>
                    </div>

                    {timetableResult && (
                      <div className="space-y-3 max-h-[260px] overflow-y-auto rounded-lg border border-border-subtle bg-bg-base/75 p-4 scrollbar-none select-none">
                        <p className="text-xs font-bold text-success font-syne uppercase tracking-wider">Generated Schedule</p>
                        <div className="space-y-4">
                          {timetableResult.map((dayPlan: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              <p className="text-xs font-bold text-text-primary border-b border-border-subtle/50 pb-1 font-syne">{dayPlan.day}</p>
                              <div className="grid gap-2">
                                {dayPlan.slots.map((slot: any, sIdx: number) => (
                                  <div key={sIdx} className="flex items-center justify-between text-xs text-text-secondary bg-bg-surface px-3 py-2 rounded-lg border border-border-subtle">
                                    <span className="font-medium text-text-primary flex items-center gap-1.5 font-mono">
                                      <Clock className="h-3 w-3 text-success" /> {slot.time}
                                    </span>
                                    <span className="font-bold text-text-primary font-dm-sans">{slot.subject}</span>
                                    <span className="text-[10px] text-text-muted font-mono">({slot.duration})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <div className="flex justify-end gap-3 border-t border-border-subtle p-5 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsPlannerOpen(false)}>
                      Close
                    </Button>
                    <Button type="submit" isLoading={isPlannerLoading} disabled={!subjectsInput.trim()}>
                      Generate Timetable
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
