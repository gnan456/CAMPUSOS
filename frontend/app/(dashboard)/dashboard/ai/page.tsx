'use client';

import { useState } from 'react';
import { Bot, Sparkles, Calendar, BookOpen, Send, X, Clock } from 'lucide-react';
import { aiApi } from '@/services/ai.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      setIsChatLoading(true);
      const { reply } = await aiApi.chat({ message: userMessage });
      setChatHistory((prev) => [...prev, { role: 'ai', content: reply }]);
    } catch {
      toast.error('AI is currently unavailable');
      setChatHistory((prev) => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again later.' }]);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="h-6 w-6 text-violet-400" />
          AI Assistant
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Your personal smart campus companion powered by OpenAI
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Tools */}
        <div className="space-y-4">
          <Card className="hover:border-violet-500/30 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-violet-300">
                <Sparkles className="h-4 w-4" />
                Smart Summarizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">
                Paste your long study notes or announcements and get a quick summary.
              </p>
              <Button className="w-full" variant="secondary" onClick={() => {
                setSummaryResult('');
                setSummarizeText('');
                setIsSummarizeOpen(true);
              }}>
                Open Summarizer
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-emerald-500/30 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-emerald-300">
                <Calendar className="h-4 w-4" />
                Study Planner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">
                Generate an optimized timetable based on your subjects and preferences.
              </p>
              <Button className="w-full" variant="secondary" onClick={() => {
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
        <Card className="lg:col-span-2 flex flex-col h-[600px] border-slate-700">
          <CardHeader className="border-b border-slate-800 bg-slate-900/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-5 w-5 text-violet-400" />
              Chat with Campus AI
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                <Bot className="h-12 w-12 text-slate-400" />
                <p className="text-slate-300 font-medium">How can I help you today?</p>
                <p className="text-sm text-slate-500 max-w-sm">
                  Ask me about campus events, study tips, or to explain complex topics. Try: "create a timetable for OS, CN, and TOC".
                </p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-slate-800 text-slate-200 rounded-bl-sm markdown-table-styles'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                  <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce delay-75" />
                  <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-4 bg-slate-900/50 border-t border-slate-800">
            <form onSubmit={handleChat} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Campus AI anything..."
                className="flex-1"
                disabled={isChatLoading}
              />
              <Button type="submit" disabled={!chatInput.trim() || isChatLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Summarizer Modal */}
      {isSummarizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-xl border-slate-800 bg-slate-950">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/60 pb-3">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                Smart Summarizer
              </CardTitle>
              <button onClick={() => setIsSummarizeOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <form onSubmit={handleSummarize}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="summarize-text" required>Text to Summarize</Label>
                  <Textarea
                    id="summarize-text"
                    rows={6}
                    placeholder="Paste study notes, lecture content, or notice boards here (Min 10 chars)..."
                    value={summarizeText}
                    onChange={(e) => setSummarizeText(e.target.value)}
                    required
                  />
                </div>
                {summaryResult && (
                  <div className="space-y-2 rounded-lg bg-slate-900/80 p-4 border border-slate-800">
                    <p className="text-sm font-semibold text-violet-300">AI Summary:</p>
                    <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">{summaryResult}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-800/60 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsSummarizeOpen(false)}>
                  Close
                </Button>
                <Button type="submit" isLoading={isSummarizeLoading} disabled={summarizeText.trim().length < 10}>
                  Summarize
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Timetable/Planner Modal */}
      {isPlannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl border-slate-800 bg-slate-950">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/60 pb-3">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                Study Planner
              </CardTitle>
              <button onClick={() => setIsPlannerOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <form onSubmit={handleGenerateTimetable}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="subjects-list" required>Subjects (Comma-separated)</Label>
                  <Input
                    id="subjects-list"
                    placeholder="e.g. Operating Systems, Theory of Computation, Graph Theory"
                    value={subjectsInput}
                    onChange={(e) => setSubjectsInput(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">Provide the list of subjects you want to organize schedule for.</p>
                </div>
                {timetableResult && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                    <p className="text-sm font-semibold text-emerald-300">Optimized Study Schedule:</p>
                    <div className="space-y-4">
                      {timetableResult.map((dayPlan: any, idx: number) => (
                        <div key={idx} className="space-y-1.5">
                          <p className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-1">{dayPlan.day}</p>
                          <div className="grid gap-2">
                            {dayPlan.slots.map((slot: any, sIdx: number) => (
                              <div key={sIdx} className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-800/40">
                                <span className="font-medium text-slate-300 flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-emerald-400" /> {slot.time}
                                </span>
                                <span className="font-semibold text-slate-200">{slot.subject}</span>
                                <span className="text-[10px] text-slate-500">({slot.duration})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-slate-800/60 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsPlannerOpen(false)}>
                  Close
                </Button>
                <Button type="submit" isLoading={isPlannerLoading} disabled={!subjectsInput.trim()}>
                  Generate Timetable
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
