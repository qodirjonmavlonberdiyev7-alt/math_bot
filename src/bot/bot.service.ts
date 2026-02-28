import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Bot, BotDocument } from "src/schema/bot.schema";
import TelegramBot from "node-telegram-bot-api";

type Level = "easy" | "medium" | "hard";

interface Session {
  level: Level;
  currentQuestion: number;
  correct: number;
  wrong: number;
}

@Injectable()
export class BotService {
  private bot: TelegramBot;

  private readonly teacherId: number = Number(process.env.TEACHER_ID);

  private sessions = new Map<number, Session>();

private questions: Record<Level, { text: string; answer: string }[]> = {
  easy: [
    { text: "sin(30°) = ?", answer: "1/2" },
    { text: "log₁₀(100) = ?", answer: "2" },
    { text: "|−7| = ?", answer: "7" },
    { text: "d/dx (x²) = ?", answer: "2x" },
    { text: "∫ 2x dx = ?", answer: "x^2 + C" },
    { text: "Kub hajmi formulasi?", answer: "a^3" },
    { text: "cos(0°) = ?", answer: "1" },
    { text: "log₂(8) = ?", answer: "3" },
    { text: "|5 − 9| = ?", answer: "4" },
    { text: "d/dx (5x) = ?", answer: "5" },
  ],

  medium: [
    { text: "sin²x + cos²x = ?", answer: "1" },
    { text: "log₃(27) = ?", answer: "3" },
    { text: "|2x − 6| = 0 bo‘lsa x = ?", answer: "3" },
    { text: "d/dx (3x³) = ?", answer: "9x^2" },
    { text: "∫ 3x² dx = ?", answer: "x^3 + C" },
    { text: "Silindr hajmi formulasi?", answer: "πr^2h" },
    { text: "tan(45°) = ?", answer: "1" },
    { text: "log₅(125) = ?", answer: "3" },
    { text: "d/dx (sin x) = ?", answer: "cos x" },
    { text: "∫ cos x dx = ?", answer: "sin x + C" },
  ],

  hard: [
    { text: "sin(2x) formulasi?", answer: "2sinxcosx" },
    { text: "logₐ(bc) = ?", answer: "logₐb + logₐc" },
    { text: "|x − 2| = 5 bo‘lsa x = ?", answer: "7 yoki -3" },
    { text: "d/dx (x^x) = ?", answer: "x^x(lnx+1)" },
    { text: "∫ 1/x dx = ?", answer: "ln|x| + C" },
    { text: "Shar hajmi formulasi?", answer: "4/3πr^3" },
    { text: "d/dx (ln x) = ?", answer: "1/x" },
    { text: "∫ e^x dx = ?", answer: "e^x + C" },
    { text: "cos(2x) formulasi?", answer: "cos^2x - sin^2x" },
    { text: "∫ x e^x dx = ?", answer: "xe^x - e^x + C" },
  ],
};

  constructor(
    @InjectModel(Bot.name) private botModel: Model<BotDocument>
  ) {
    this.bot = new TelegramBot(process.env.BOT_TOKEN as string, {
      polling: true,
    });

    this.initializeBot();
  }

  private initializeBot() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.from?.id as number;

      if (chatId === this.teacherId) {
        this.bot.sendMessage(chatId, "Siz ustoz sifatida belgilangansiz ✅");
      }

      const foundedUser = await this.botModel.findOne({ chatId });

      if (!foundedUser) {
        await this.botModel.create({
          name: msg.from?.first_name,
          chatId,
        });

        this.bot.sendMessage(
          chatId,
          "Siz muvaffaqiyatli ro'yxatdan o'tdingiz 🎉"
        );
      }

     this.bot.sendMessage(chatId, "Darajani tanlang:", {
  reply_markup: {
    keyboard: [
      [{ text: "Oson" }],
      [{ text: "O'rta" }],
      [{ text: "Qiyin" }],
    ],
    resize_keyboard: true,
  },
});
      

    });

    this.bot.on("message", (msg) => this.handleMessage(msg));
  }

  private handleMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    if (text === "Oson" || text === "O'rta" || text === "Qiyin") {
      const level: Level =
        text === "Oson"
          ? "easy"
          : text === "O'rta"
          ? "medium"
          : "hard";

      this.sessions.set(chatId, {
        level,
        currentQuestion: 0,
        correct: 0,
        wrong: 0,
      });

      this.askQuestion(chatId);
      return;
    }

    const session = this.sessions.get(chatId);
    if (!session) return;

    const question =
      this.questions[session.level][session.currentQuestion];

    if (text === question.answer) {
      session.correct++;
    } else {
      session.wrong++;
    }

    session.currentQuestion++;

    if (session.currentQuestion >= 10) {
      this.bot.sendMessage(
        chatId,
        `Test yakunlandi ✅\n\n✅To‘g‘ri: ${session.correct}\n ❌Noto‘g‘ri: ${session.wrong}\n📊Umumiy: 10`
      );

      this.sessions.delete(chatId);
    } else {
      this.askQuestion(chatId);
    }
  }

  private askQuestion(chatId: number) {
    const session = this.sessions.get(chatId);
    if (!session) return;

    const question =
      this.questions[session.level][session.currentQuestion];

    this.bot.sendMessage(
      chatId,
      `Savol ${session.currentQuestion + 1}:\n${question.text}`
    );
  }
}