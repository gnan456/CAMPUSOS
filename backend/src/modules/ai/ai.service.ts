import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIRepository } from './ai.repository';
import { env } from '@/config/env';
import { AIChatRole } from '@prisma/client';
import { ApiError } from '@/utils/ApiError';

export class AIService {
  private repository: AIRepository;
  private openai: OpenAI;
  private genAI?: GoogleGenerativeAI;

  constructor() {
    this.repository = new AIRepository();
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    if (env.GEMINI_API_KEY && !env.GEMINI_API_KEY.startsWith('your-gemini') && env.GEMINI_API_KEY !== '') {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  private getMockResponse(message: string): string {
    const msg = message.toLowerCase();
    const matchedSegments: string[] = [];

    // 1. Gather all matching topic segments for combined responses
    
    // Timetable / Schedule / Planner queries
    if (msg.includes('timetable') || msg.includes('time table') || msg.includes('schedule') || msg.includes('planner')) {
      const subjectMatches = message.match(/\b(GT|OS|CN|EI|TOC|SNS|Physics|Maths|Chemistry|Biology|English)\b/gi);
      const subjects = subjectMatches ? Array.from(new Set(subjectMatches.map(s => s.toUpperCase()))) : [];
      
      if (subjects.length > 0) {
        matchedSegments.push(
          `🗓️ **Custom Study Timetable Generated:**\n\n` +
          `| Day | 9:00 AM - 11:00 AM | 11:30 AM - 1:30 PM | 2:30 PM - 4:30 PM |\n` +
          `| :--- | :--- | :--- | :--- |\n` +
          `| **Monday** | ${subjects[0] || 'Study'} | ${subjects[1] || 'Review'} | Lab/Practical |\n` +
          `| **Tuesday** | ${subjects[2] || 'Study'} | ${subjects[3] || 'Review'} | Self Study |\n` +
          `| **Wednesday** | ${subjects[4] || 'Study'} | ${subjects[0] || 'Review'} | Group Project |\n` +
          `| **Thursday** | ${subjects[1] || 'Study'} | ${subjects[2] || 'Review'} | Research / Library |\n` +
          `| **Friday** | ${subjects[3] || 'Study'} | ${subjects[4] || 'Review'} | Exam Prep |`
        );
      } else {
        matchedSegments.push(
          `🗓️ **Study Planner & Timetables:**\n` +
          `You can generate an optimized study schedule by clicking **'Create Timetable'** on the left panel or typing a request with subject names, like: *'create a study timetable for OS, CN, and TOC'*.`
        );
      }
    }

    // About CampusOS / Use of AI Assistant
    if (msg.includes('campusos') || msg.includes('purpose') || msg.includes('use of ai') || (msg.includes('what is') && msg.includes('assistant'))) {
      matchedSegments.push(
        `🏢 **About CampusOS:**\n` +
        `CampusOS is a smart campus management platform designed to streamline university life. As your AI companion, I help you organize study sessions, summarize announcements, and navigate campus modules easily.`
      );
    }

    // Navigation Guide & Instructions
    if (msg.includes('navigat') || msg.includes('guideline') || msg.includes('guide') || msg.includes('how to use') || msg.includes('how do i use')) {
      matchedSegments.push(
        `🗺️ **CampusOS Navigation & Usage Guide:**\n` +
        `Here is a quick directory to help you navigate and use the platform:\n` +
        `• **Events:** View, search, and register for student activities, or coordinate new events.\n` +
        `• **Complaints:** File feedback on campus issues and track their resolution progress.\n` +
        `• **Notes:** Download study slides and lecture notes uploaded by peers, or upload your own.\n` +
        `• **Lost & Found:** Report lost items or submit found belongings on the interactive pinboard.\n` +
        `• **AI Assistant:** Generate custom study plans or summarize notices instantly.`
      );
    }

    // Events module
    if (msg.includes('event')) {
      matchedSegments.push(
        `🎉 **Events Module:**\n` +
        `Browse and register for upcoming campus activities in the **Events** tab. Club Coordinators can create new event listings (which go to Admin for approval), and Students can register for them immediately.`
      );
    }

    // Complaints module
    if (msg.includes('complaint') || msg.includes('complain') || msg.includes('report')) {
      matchedSegments.push(
        `⚠️ **Complaints & Feedback:**\n` +
        `Report infrastructure, library, or hostel issues in the **Complaints** section. Click **'File Complaint'** to submit. Admins review and update statuses (OPEN → IN_PROGRESS → RESOLVED) in real-time.`
      );
    }

    // Notes / Summarizer module
    if (msg.includes('note') || msg.includes('study material') || msg.includes('resource') || msg.includes('download') || msg.includes('summariz')) {
      matchedSegments.push(
        `📚 **Notes & Summarizer:**\n` +
        `Access and share notes or study materials in the **Notes** section. You can also paste long syllabus docs or notices into the **'Smart Summarizer'** tool to get a concise bullet-point summary instantly.`
      );
    }

    // Lost & Found module
    if (msg.includes('lost') || msg.includes('found') || msg.includes('belonging') || msg.includes('wallet')) {
      matchedSegments.push(
        `🔍 **Lost & Found Bulletin:**\n` +
        `If you've misplaced an item or found someone's belongings, post it in the **Lost & Found** section. Provide a description, image, and claim location to help return items to their owners.`
      );
    }

    // Analytics module
    if (msg.includes('analytics') || msg.includes('users') || msg.includes('chart') || msg.includes('admin stats')) {
      matchedSegments.push(
        `📊 **Platform Analytics:**\n` +
        `If you are logged in as an Administrator, you can view engagement metrics, active users, and registration graphs under the **Analytics** dashboard.`
      );
    }

    // Theory of Computation academic topic
    if (msg.includes('theory of computation') || msg.includes('toc') || msg.includes('dfa') || msg.includes('nfa') || msg.includes('turing') || msg.includes('grammar')) {
      matchedSegments.push(
        `💻 **Theory of Computation (TOC) Reference:**\n` +
        `TOC is the study of what can and cannot be computed efficiently. Key areas include:\n` +
        `• **Finite Automata (DFA/NFA):** Mathematical models of machines with finite states used for pattern matching.\n` +
        `• **Context-Free Grammars (CFG):** Used to define the formal syntax of programming languages.\n` +
        `• **Turing Machines:** Universal models of computation that define the limits of what can be computed (e.g. Halting Problem).`
      );
    }

    // Operating Systems academic topic
    if (msg.includes('operating system') || msg.includes(' os ') || msg.startsWith('os ') || msg.endsWith(' os') || msg === 'os' || msg.includes('semaphore') || msg.includes('scheduling') || msg.includes('memory') || msg.includes('deadlock')) {
      matchedSegments.push(
        `🖥️ **Operating Systems (OS) Reference:**\n` +
        `An OS manages hardware, memory, and software processes. Key topics include:\n` +
        `• **CPU Scheduling:** Algorithms (like Round Robin, SJF) that allocate processor time to processes.\n` +
        `• **Semaphores & Mutexes:** Synchronization tools used to prevent race conditions in concurrent programming.\n` +
        `• **Virtual Memory:** Mapping program memory addresses to physical storage using paging or segmentation.`
      );
    }

    // Computer Networks academic topic
    if (msg.includes('computer network') || msg.includes('cn') || msg.includes('osi') || msg.includes('tcp') || msg.includes('routing') || msg.includes('handshake')) {
      matchedSegments.push(
        `🌐 **Computer Networks (CN) Reference:**\n` +
        `CN deals with data communication between devices. Key concepts include:\n` +
        `• **OSI Model:** A 7-layer framework (Physical to Application) standardizing networking protocols.\n` +
        `• **TCP 3-way Handshake:** The SYN ➔ SYN-ACK ➔ ACK process establishing reliable transport.\n` +
        `• **Routing Algorithms:** Path calculations (like Link State) that steer packets through the internet.`
      );
    }

    // 2. Return aggregated segments if any matched
    if (matchedSegments.length > 0) {
      return matchedSegments.join('\n\n');
    }

    // 3. Simple conversational fallbacks

    // Greetings
    if (msg.includes('hello') || msg.includes('hi ') || msg.startsWith('hi') || msg.includes('hey')) {
      return "Hello! I am your CampusOS AI assistant. I can help you summarize study notes, generate optimized timetables, or answer general questions about campus operations. How can I help you today?";
    }

    // Help
    if (msg.includes('help') || msg.includes('features') || msg.includes('can you do')) {
      return "As the CampusOS AI companion, I am here to help you:\n\n" +
             "• **Timetables**: Ask me to 'create a study timetable for OS and CN'.\n" +
             "• **Smart Summarizer**: Summarize announcements and notice boards.\n" +
             "• **General Campus Q&A**: Ask about events, notes, complaints, and lost & found.";
    }

    // Explain Academic Concepts (generic catch-all for school terms)
    if (msg.includes('explain') || msg.includes('concept') || msg.includes('academic') || msg.includes('define') || msg.includes('what is a ') || msg.includes('what is the ')) {
      return "I can help explain academic concepts across your subjects! For instance:\n\n" +
             "• **Operating Systems**: I can explain Semaphores, CPU Scheduling algorithms, or Virtual Memory.\n" +
             "• **Computer Networks**: I can describe the OSI model, TCP 3-way handshake, or routing algorithms.\n" +
             "• **Theory of Computation**: I can break down DFAs, NFAs, Turing Machines, or context-free grammars.\n\n" +
             "What specific topic or concept would you like me to explain?";
    }

    // Smart Fallback incorporating the query
    return `That's a great question! Regarding your query on "${message}", as the CampusOS AI, I can assist you with campus modules or academic planning. Specifically:\n\n` +
           `• **Timetables**: Ask me to 'create a study timetable for OS and CN'.\n` +
           `• **Study Notes**: Paste text in the 'Smart Summarizer' tool in the sidebar to get bullet point summaries.\n` +
           `• **Campus Modules**: Ask me how to register for events, file complaints, or report lost items.`;
  }

  async chat(userId: string, message: string) {
    // Save user message
    await this.repository.saveMessage(userId, AIChatRole.USER, message);

    // If Gemini API is configured and active, route there
    if (this.genAI) {
      try {
        const history = await this.repository.getChatHistory(userId, 10);
        history.reverse();

        // Configure system instruction in models that support it
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: 'You are CampusOS Assistant, an AI helper for a university campus management platform. Be helpful, concise, and polite. You help students and staff with events, complaints, lost and found, and general campus questions.',
        });

        // Convert db message format to Gemini format: roles must be 'user' or 'model'
        const contents = history.map((msg) => ({
          role: msg.role === AIChatRole.USER ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        // contents contains the user message just saved at the end of the history array.
        // We pass the history excluding the user's latest query, and then send the query.
        const chatSession = model.startChat({
          history: contents.slice(0, -1),
        });

        const result = await chatSession.sendMessage(message);
        const assistantReply = result.response.text() || 'I am sorry, I cannot respond right now.';

        // Save assistant reply
        const savedReply = await this.repository.saveMessage(userId, AIChatRole.ASSISTANT, assistantReply);

        return {
          reply: savedReply.content,
        };
      } catch (error) {
        console.error('Gemini Chat Error:', error);
        throw new ApiError(500, 'Failed to communicate with Gemini AI service');
      }
    }

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
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Summarize the following text concisely in a few sentences or bullet points:\n\n${text}`;
        const result = await model.generateContent(prompt);
        return result.response.text() || 'Failed to summarize.';
      } catch (error) {
        console.error('Gemini Summarize Error:', error);
        throw new ApiError(500, 'Failed to summarize text using Gemini AI');
      }
    }

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
