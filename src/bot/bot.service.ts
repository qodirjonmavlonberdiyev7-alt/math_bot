import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot, { InlineKeyboardButton } from 'node-telegram-bot-api';
import { UserService } from '../user/user.service';
import { QuestionService } from '../question/question.service';
import { ResultService } from '../result/result.service';
import * as dotenv from 'dotenv';

dotenv.config();

// Foydalanuvchi sessionlari
const sessions = new Map<string, any>();

@Injectable()
export class BotService implements OnModuleInit {
  private bot: TelegramBot;

  constructor(
    private userService: UserService,
    private questionService: QuestionService,
    private resultService: ResultService,
  ) {}

  onModuleInit() {
    const token = process.env.BOT_TOKEN;
    if (!token) {
      console.error('⚠️ BOT_TOKEN .env faylda topilmadi!');
      return;
    }

    this.bot = new TelegramBot(token, { polling: true });
    console.log('🤖 Telegram bot ishga tushdi...');

    // /start komandasi
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = String(msg.from.id);

      try {
        let user = await this.userService.findByTelegramId(telegramId);

        if (!user) {
          user = await this.userService.createUser(telegramId, msg.from.first_name);

          await this.bot.sendSticker(
            chatId,
            'CAACAgIAAxkBAAEBJzVg0lK9vNFXkJzMKZhSjIwtv5nUHwAC-wIAAladvQpNNj0ZzYw74yQE'
          );
        } else {
          await this.bot.sendSticker(
            chatId,
            'CAACAgIAAxkBAAEBJzRg0lNqU_eJvN0p-Ur0sLqR5MZL3gACXwIAAladvQpOEox4Zz1O5yQE'
          );
        }

        const levelKeyboard: InlineKeyboardButton[][] = [
          [{ text: 'Oson', callback_data: 'level_1' }],
          [{ text: 'Orta', callback_data: 'level_2' }],
          [{ text: 'Qiyin', callback_data: 'level_3' }],
        ];

        await this.bot.sendMessage(chatId, `Salom ${msg.from.first_name}! Darajani tanlang:`, {
          reply_markup: { inline_keyboard: levelKeyboard },
        });
      } catch (error) {
        console.error('Start xatolik:', error);
        await this.bot.sendMessage(chatId, 'Botda xatolik yuz berdi. Iltimos qayta urinib ko‘ring.');
      }
    });

    // Daraja tanlandi
    this.bot.on('callback_query', async (callbackQuery) => {
      const telegramId = String(callbackQuery.from.id);
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      // Daraja tanlash
      if (!data?.startsWith('level_')) return;

      const level = parseInt(data.split('_')[1], 10);

      try {
        const questions = await this.questionService.getRandomQuestions(level);
        if (!questions || questions.length === 0)
          return await this.bot.sendMessage(chatId, 'Bu daraja uchun savol topilmadi.');

        // Session yaratish
        sessions.set(telegramId, {
          level,
          questions,
          index: 0,
          correct: 0,
          wrong: 0,
        });

        // Birinchi savolni yuborish
        await this.sendQuestion(chatId, telegramId);
      } catch (error) {
        console.error('Daraja xatolik:', error);
        await this.bot.sendMessage(chatId, 'Savollarni olishda xatolik yuz berdi.');
      }
    });

    // Javob tugmasi bosildi
    this.bot.on('callback_query', async (callbackQuery) => {
      const telegramId = String(callbackQuery.from.id);
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      if (!data?.startsWith('answer_')) return;

      const session = sessions.get(telegramId);
      if (!session) return;

      const answerIndex = parseInt(data.split('_')[1], 10);
      const currentQuestion = session.questions[session.index];

      if (currentQuestion.correctAnswerIndex === answerIndex) session.correct++;
      else session.wrong++;

      session.index++;

      if (session.index === session.questions.length) {
        await this.resultService.saveResult({
          telegramId,
          level: session.level,
          correct: session.correct,
          wrong: session.wrong,
          total: session.questions.length,
        });

        sessions.delete(telegramId);

        return await this.bot.sendMessage(
          chatId,
          `Test tugadi!\n\n✅ To‘g‘ri: ${session.correct}\n❌ Noto‘g‘ri: ${session.wrong}\n📊 Jami: ${session.questions.length}`
        );
      }

      await this.sendQuestion(chatId, telegramId);
    });

    this.bot.on('polling_error', (error) => console.error('Polling error:', error));
  }

  // Savol yuborish funktsiyasi
  private async sendQuestion(chatId: number, telegramId: string) {
    const session = sessions.get(telegramId);
    if (!session) return;

    const question = session.questions[session.index];

    const answerButtons: InlineKeyboardButton[][] = question.answers.map((ans, idx) => [
      { text: ans, callback_data: `answer_${idx}` },
    ]);

    await this.bot.sendMessage(chatId, `${session.index + 1}️⃣ Savol: ${question.text}`, {
      reply_markup: { inline_keyboard: answerButtons },
    });
  }
}