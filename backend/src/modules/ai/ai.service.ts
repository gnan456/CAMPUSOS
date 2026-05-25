import OpenAI from 'openai';
import { AIRepository } from './ai.repository';
import { env } from '@/config/env';
import { AIChatRole } from '@prisma/client';
import { ApiError } from '@/utils/ApiError';

export class AIService {
  private repository: AIRepository;
  private openai: OpenAI;

  constructor() {
    this.repository = new AIRepository();
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  private getMockResponse(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('timetable') || msg.includes('time table') || msg.includes('schedule')) {
      const subjectMatches = message.match(/\b(GT|OS|CN|EI|TOC|SNS|Physics|Maths|Chemistry|Biology|English)\b/gi);
      const subjects = subjectMatches ? Array.from(new Set(subjectMatches.map(s => s.toUpperCase()))) : ['GT', 'OS', 'CN', 'TOC', 'SNS'];
      
      return `Here is a custom, optimized study timetable for your subjects (${subjects.join(', ')}):\n\n` +
             `| Day | 9:00 AM - 11:00 AM | 11:30 AM - 1:30 PM | 2:30 PM - 4:30 PM |\n` +
             `| :--- | :--- | :--- | :--- |\n` +
             `| **Monday** | ${subjects[0] || 'Study'} | ${subjects[1] || 'Review'} | Lab/Practical |\n` +
             `| **Tuesday** | ${subjects[2] || 'Study'} | ${subjects[3] || 'Review'} | Self Study |\n` +
             `| **Wednesday** | ${subjects[4] || 'Study'} | ${subjects[0] || 'Review'} | Group Project |\n` +
             `| **Thursday** | ${subjects[1] || 'Study'} | ${subjects[2] || 'Review'} | Research / Library |\n` +
             `| **Friday** | ${subjects[3] || 'Study'} | ${subjects[4] || 'Review'} | Exam Prep |`;
    }

    if (msg.includes('hello') || msg.includes('hi ') || msg.startsWith('hi')) {
      return "Hello! I am your CampusOS AI assistant. I can help you summarize study notes, generate optimized timetables, or answer general questions about campus operations. How can I help you today?";
    }

    if (msg.includes('event')) {
      return "You can view, register for, and manage campus events in the 'Events' section. If you are a Club Coordinator or Admin, you can also create events!";
    }

    if (msg.includes('complaint') || msg.includes('complain')) {
      return "Students can report campus issues by going to the 'Complaints' section and clicking 'File Complaint'. Admins can view and resolve all filed complaints.";
    }

    if (msg.includes('note') || msg.includes('study material')) {
      return "Study resources and lecture slides can be uploaded and downloaded in the 'Notes' section. Files are stored securely on Cloudinary.";
    }

    return "That's an interesting question! As the CampusOS AI, I can help you organize your study schedule, summarize text, or guide you through campus features. For example, try asking me to: 'create a study timetable for OS, CN, and TOC'.";
  }

  async chat(userId: string, message: string) {
    // Save user message
    await this.repository.saveMessage(userId, AIChatRole.USER, message);

    const isPlaceholderKey = !env.OPENAI_API_KEY || env.OPENAI_API_KEY.startsWith('sk-your') || env.OPENAI_API_KEY === 'your-openai-api-key';

    if (isPlaceholderKey) {
      const assistantReply = this.getMockResponse(message);
      const savedReply = await this.repository.saveMessage(userId, AIChatRole.ASSISTANT, assistantReply);
      return {
        reply: savedReply.content,
      };
    }

    // Retrieve last 10 messages for context (in reverse order because orderBy desc)
    const history = await this.repository.getChatHistory(userId, 10);
    history.reverse();

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = history.map((msg) => ({
      role: msg.role === AIChatRole.USER ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Prepend system prompt
    messages.unshift({
      role: 'system',
      content: 'You are CampusOS Assistant, an AI helper for a university campus management platform. Be helpful, concise, and polite. You help students and staff with events, complaints, lost and found, and general campus questions.',
    });

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
      });

      const assistantReply = response.choices[0]?.message?.content || 'I am sorry, I cannot respond right now.';

      // Save assistant reply
      const savedReply = await this.repository.saveMessage(userId, AIChatRole.ASSISTANT, assistantReply);

      return {
        reply: savedReply.content,
      };
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new ApiError(500, 'Failed to communicate with AI service');
    }
  }

  async getChatHistory(userId: string) {
    const history = await this.repository.getChatHistory(userId, 50);
    return history.reverse(); // Return in chronological order
  }

  async summarizeText(text: string) {
    const isPlaceholderKey = !env.OPENAI_API_KEY || env.OPENAI_API_KEY.startsWith('sk-your') || env.OPENAI_API_KEY === 'your-openai-api-key';

    if (isPlaceholderKey) {
      return `Here is a summary of the text:\n\n• Key Point 1: Campus activity and resource optimization.\n• Key Point 2: Main highlights and scheduled operations.\n• Key Point 3: Important guidelines for academic success.`;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Summarize the following text concisely in a few sentences or bullet points.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || 'Failed to summarize.';
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new ApiError(500, 'Failed to summarize text');
    }
  }

  async generateTimetable(subjects: string[], _preferences: Record<string, string>) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const subList = subjects.length > 0 ? [...subjects] : ['Maths', 'Physics', 'Chemistry'];
    
    const timetable = days.map((day) => {
      const slots = [
        { time: '09:00 AM', subject: subList[0] || 'Study', duration: '2 hours' },
        { time: '11:30 AM', subject: subList[1] || 'Review', duration: '2 hours' },
        { time: '02:30 PM', subject: subList[2] || 'Practical', duration: '2 hours' },
      ];
      // Rotate subjects for the next day
      if (subList.length > 1) {
        subList.push(subList.shift()!);
      }
      return {
        day,
        slots,
      };
    });

    return {
      timetable,
    };
  }
}
