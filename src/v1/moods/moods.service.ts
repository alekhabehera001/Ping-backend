import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { Mood, MoodDocument, MoodType } from '../../schemas/mood.schema';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class MoodsService {
  constructor(
    @InjectModel(Mood.name) private readonly moodModel: Model<MoodDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private readonly coupleModel: Model<CoupleDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMood(userId: string, mood: MoodType, note?: string) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new BadRequestException('Must be in a couple to send mood');

    const newMood = await this.moodModel.create({
      userId: new Types.ObjectId(userId),
      coupleId: user.coupleId,
      mood,
      note,
    });

    this.eventEmitter.emit('mood.created', {
      senderId: userId,
      coupleId: user.coupleId.toString(),
      mood,
      note,
      moodId: (newMood._id as Types.ObjectId).toString(),
    });

    return newMood;
  }

  async getLatestMoods(userId: string) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) return { myMood: null, partnerMood: null };

    const couple = await this.coupleModel.findById(user.coupleId).lean();
    if (!couple) return { myMood: null, partnerMood: null };

    const partnerId =
      couple.user1.toString() === userId
        ? couple.user2?.toString()
        : couple.user1.toString();

    const [myMood, partnerMood] = await Promise.all([
      this.moodModel.findOne({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean(),
      partnerId
        ? this.moodModel.findOne({ userId: new Types.ObjectId(partnerId) }).sort({ createdAt: -1 }).lean()
        : Promise.resolve(null),
    ]);

    return { myMood, partnerMood };
  }

  async getMoodHistory(userId: string, page: number, limit: number) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) return { items: [], total: 0 };

    const [items, total] = await Promise.all([
      this.moodModel
        .find({ coupleId: user.coupleId })
        .populate('userId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.moodModel.countDocuments({ coupleId: user.coupleId }),
    ]);

    return { items, total };
  }
}
