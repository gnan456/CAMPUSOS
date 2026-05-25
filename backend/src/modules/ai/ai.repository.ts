import { AIChatRole } from '@prisma/client';
import db from '@/config/db';

export class AIRepository {
  async saveMessage(userId: string, role: AIChatRole, content: string) {
    return db.aIChat.create({
      data: {
        userId,
        role,
        content,
      },
    });
  }

  async getChatHistory(userId: string, limit = 20) {
    return db.aIChat.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async clearHistory(userId: string) {
    return db.aIChat.deleteMany({
      where: { userId },
    });
  }
}
