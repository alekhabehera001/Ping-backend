import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Streak, StreakDocument } from '../../schemas/streak.schema';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class StreaksService {
  constructor(
    @InjectModel(Streak.name) private readonly streakModel: Model<StreakDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getStreak(userId: string) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new NotFoundException('Couple not found');

    const existing = await this.streakModel.findOne({ coupleId: user.coupleId }).lean();
    if (existing) return existing;
    const streak = await this.streakModel.create({ coupleId: user.coupleId });
    return streak.toObject();
  }

  async recoverStreak(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new NotFoundException('Couple not found');

    const streak = await this.streakModel.findOne({ coupleId: user.coupleId }).exec();
    if (!streak) throw new NotFoundException('Streak not found');
    if (streak.recoveryTokens <= 0) throw new BadRequestException('No recovery tokens left');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastDate = streak.lastAnsweredDate ? new Date(streak.lastAnsweredDate) : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
      const diff = Math.floor((yesterday.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000));
      if (diff !== 1) throw new BadRequestException('Recovery only works for a 1-day break');
    }

    streak.currentStreak += 1;
    streak.recoveryTokens -= 1;
    streak.lastAnsweredDate = yesterday;
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }
    await streak.save();
  }
}
