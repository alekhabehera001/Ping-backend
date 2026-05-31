import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from '../../schemas/answer.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { Question, QuestionDocument } from '../../schemas/question.schema';
import { Streak, StreakDocument, StreakBadge } from '../../schemas/streak.schema';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class AnswersService {
  constructor(
    @InjectModel(Answer.name) private readonly answerModel: Model<AnswerDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Couple.name) private readonly coupleModel: Model<CoupleDocument>,
    @InjectModel(Streak.name) private readonly streakModel: Model<StreakDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async submitAnswer(userId: string, questionId: string, text: string) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new BadRequestException('You must be in a couple to answer');

    const question = await this.questionModel.findOne({ _id: questionId, isActive: true }).lean();
    if (!question) throw new NotFoundException('Question not found');

    const existingAnswer = await this.answerModel
      .findOne({ questionId, userId: new Types.ObjectId(userId) })
      .lean();
    if (existingAnswer) throw new BadRequestException('You already answered this question');

    const answer = await this.answerModel.create({
      questionId: new Types.ObjectId(questionId),
      userId: new Types.ObjectId(userId),
      coupleId: user.coupleId,
      text,
    });

    await this.checkAndRevealAnswers(questionId, user.coupleId.toString());

    return answer;
  }

  private async checkAndRevealAnswers(questionId: string, coupleId: string): Promise<void> {
    const couple = await this.coupleModel.findById(coupleId).lean();
    if (!couple || !couple.user2) return;

    const answers = await this.answerModel.find({ questionId, coupleId }).lean();
    const bothAnswered =
      answers.some((a) => a.userId.toString() === couple.user1.toString()) &&
      answers.some((a) => a.userId.toString() === couple.user2!.toString());

    if (!bothAnswered) return;

    await this.answerModel.updateMany({ questionId, coupleId }, { isRevealed: true });

    await this.updateStreak(coupleId);

    this.eventEmitter.emit('answers.revealed', {
      coupleId,
      questionId,
      answers: answers.map((a) => ({ userId: a.userId.toString(), text: a.text })),
    });
  }

  private async updateStreak(coupleId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = await this.streakModel.findOne({ coupleId }).exec();
    if (!streak) {
      streak = await this.streakModel.create({ coupleId, currentStreak: 0 });
    }

    const lastDate = streak.lastAnsweredDate ? new Date(streak.lastAnsweredDate) : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays === 0) return;
      if (diffDays === 1) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }
    } else {
      streak.currentStreak = 1;
    }

    streak.lastAnsweredDate = today;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    const newBadges: StreakBadge[] = [];
    if (streak.currentStreak >= 7 && !streak.badges.includes(StreakBadge.WEEK)) {
      streak.badges.push(StreakBadge.WEEK);
      newBadges.push(StreakBadge.WEEK);
    }
    if (streak.currentStreak >= 30 && !streak.badges.includes(StreakBadge.MONTH)) {
      streak.badges.push(StreakBadge.MONTH);
      newBadges.push(StreakBadge.MONTH);
    }
    if (streak.currentStreak >= 100 && !streak.badges.includes(StreakBadge.CENTURY)) {
      streak.badges.push(StreakBadge.CENTURY);
      newBadges.push(StreakBadge.CENTURY);
    }

    await streak.save();

    if (newBadges.length > 0) {
      this.eventEmitter.emit('streak.milestone', { coupleId, badges: newBadges, streak: streak.currentStreak });
    }
  }

  async getTodayAnswers(userId: string, questionId: string) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new BadRequestException('Not in a couple');

    const answers = await this.answerModel
      .find({ questionId, coupleId: user.coupleId })
      .populate('userId', 'name avatar')
      .lean();

    const myAnswer = answers.find((a) => a.userId.toString() === userId || (a.userId as any)._id?.toString() === userId);
    const revealed = answers.every((a) => a.isRevealed) && answers.length >= 2;

    return {
      myAnswer: myAnswer || null,
      partnerAnswer: revealed ? answers.find((a) => {
        const aId = (a.userId as any)._id?.toString() || a.userId.toString();
        return aId !== userId;
      }) : null,
      bothAnswered: revealed,
    };
  }

  async getHistory(userId: string, page: number, limit: number) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) return { items: [], total: 0 };

    const [items, total] = await Promise.all([
      this.answerModel
        .find({ coupleId: user.coupleId, isRevealed: true })
        .populate('questionId', 'text category')
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.answerModel.countDocuments({ coupleId: user.coupleId, isRevealed: true }),
    ]);

    return { items, total };
  }
}
