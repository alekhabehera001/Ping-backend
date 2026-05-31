import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument, QuestionCategory } from '../../schemas/question.schema';

const DEFAULT_QUESTIONS = [
  { text: 'What made you smile today?', category: QuestionCategory.EMOTIONAL },
  { text: 'What is your favorite memory of us?', category: QuestionCategory.ROMANTIC },
  { text: 'If we had a superpower together, what would it be?', category: QuestionCategory.FUNNY },
  { text: 'Where do you see us in 5 years?', category: QuestionCategory.FUTURE_GOALS },
  { text: 'What stresses you most right now, and how can I help?', category: QuestionCategory.STRESS },
  { text: 'What is one thing you appreciate about me that you never say?', category: QuestionCategory.APPRECIATION },
  { text: 'What song reminds you of us?', category: QuestionCategory.ROMANTIC },
  { text: 'What is something new you want us to try together?', category: QuestionCategory.FUTURE_GOALS },
  { text: 'What do you do when you miss me?', category: QuestionCategory.EMOTIONAL },
  { text: 'What is the funniest thing that ever happened between us?', category: QuestionCategory.FUNNY },
  { text: 'What small thing do I do that means the most to you?', category: QuestionCategory.APPRECIATION },
  { text: 'How do you want to spend our next vacation?', category: QuestionCategory.FUTURE_GOALS },
  { text: 'What is one fear you have that I can help you face?', category: QuestionCategory.STRESS },
  { text: 'If we could live anywhere, where would it be?', category: QuestionCategory.ROMANTIC },
  { text: 'What is your love language today?', category: QuestionCategory.EMOTIONAL },
];

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async getTodayQuestion(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.questionModel
      .findOne({ scheduledFor: { $gte: today, $lt: tomorrow }, isActive: true })
      .lean();
  }

  async getOrCreateTodayQuestion(): Promise<any> {
    const existing = await this.getTodayQuestion();
    if (existing) return existing;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const randomQ = DEFAULT_QUESTIONS[Math.floor(Math.random() * DEFAULT_QUESTIONS.length)];
    const question = await this.questionModel.create({
      text: randomQ.text,
      category: randomQ.category,
      scheduledFor: today,
      isActive: true,
      createdByAdmin: false,
    });

    return question;
  }

  async create(data: { text: string; category: string; scheduledFor: Date }): Promise<any> {
    return this.questionModel.create({ ...data, isActive: true, createdByAdmin: true });
  }

  async list(page: number, limit: number, category?: string): Promise<{ items: any[]; total: number }> {
    const filter: any = {};
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      this.questionModel
        .find(filter)
        .sort({ scheduledFor: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.questionModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async seedDefaultQuestions(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < DEFAULT_QUESTIONS.length; i++) {
      const scheduledFor = new Date(today);
      scheduledFor.setDate(scheduledFor.getDate() + i);
      await this.questionModel.updateOne(
        { scheduledFor },
        { $setOnInsert: { ...DEFAULT_QUESTIONS[i], scheduledFor, isActive: true, createdByAdmin: false } },
        { upsert: true },
      );
    }
  }
}
