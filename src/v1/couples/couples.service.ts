import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Couple, CoupleDocument, CoupleStatus } from '../../schemas/couple.schema';
import { User, UserDocument } from '../../schemas/user.schema';

function generateInviteCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

@Injectable()
export class CouplesService {
  constructor(
    @InjectModel(Couple.name) private readonly coupleModel: Model<CoupleDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async generateInvite(userId: string): Promise<{ inviteCode: string; coupleId: string }> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user) throw new NotFoundException('User not found');
    if (user.coupleId) throw new ConflictException('You are already in a couple');

    let code: string;
    let exists = true;
    do {
      code = generateInviteCode();
      const existing = await this.coupleModel.findOne({ inviteCode: code }).lean();
      exists = !!existing;
    } while (exists);

    const couple = await this.coupleModel.create({
      user1: new Types.ObjectId(userId),
      inviteCode: code,
      status: CoupleStatus.PENDING,
    });

    await this.userModel.updateOne({ _id: userId }, { coupleId: couple._id });

    return { inviteCode: code, coupleId: (couple._id as Types.ObjectId).toString() };
  }

  async joinCouple(userId: string, inviteCode: string): Promise<object> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user) throw new NotFoundException('User not found');
    if (user.coupleId) throw new ConflictException('You are already in a couple');

    const couple = await this.coupleModel
      .findOne({ inviteCode: inviteCode.toUpperCase(), status: CoupleStatus.PENDING })
      .exec();

    if (!couple) throw new NotFoundException('Invalid or expired invite code');
    if (couple.user1.toString() === userId) {
      throw new BadRequestException('Cannot join your own invite');
    }

    couple.user2 = new Types.ObjectId(userId);
    couple.status = CoupleStatus.ACTIVE;
    await couple.save();

    await this.userModel.updateOne({ _id: userId }, { coupleId: couple._id });

    const [user1, user2] = await Promise.all([
      this.userModel.findById(couple.user1).select('name avatar email').lean(),
      this.userModel.findById(couple.user2).select('name avatar email').lean(),
    ]);

    return { coupleId: (couple._id as Types.ObjectId).toString(), user1, user2 };
  }

  async getCouple(userId: string): Promise<object> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new NotFoundException('Couple not found');

    const couple = await this.coupleModel.findById(user.coupleId).lean();
    if (!couple) throw new NotFoundException('Couple not found');

    const [user1, user2] = await Promise.all([
      this.userModel.findById(couple.user1).select('name avatar email').lean(),
      couple.user2
        ? this.userModel.findById(couple.user2).select('name avatar email').lean()
        : Promise.resolve(null),
    ]);

    return { ...couple, user1, user2 };
  }

  async setAnniversary(userId: string, anniversary: Date): Promise<object> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new NotFoundException('Couple not found');

    const couple = await this.coupleModel
      .findByIdAndUpdate(user.coupleId, { anniversary }, { new: true })
      .lean();
    if (!couple) throw new NotFoundException('Couple not found');
    return couple;
  }

  async unlinkPartner(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new NotFoundException('No couple to unlink');

    const couple = await this.coupleModel.findById(user.coupleId).exec();
    if (!couple) throw new NotFoundException('Couple not found');

    const partnerIds = [couple.user1.toString(), couple.user2?.toString()].filter(Boolean);

    couple.status = CoupleStatus.UNLINKED;
    couple.unlinkedAt = new Date();
    await couple.save();

    await this.userModel.updateMany({ _id: { $in: partnerIds } }, { $unset: { coupleId: 1 } });
  }

  async getCoupleIdForUser(userId: string): Promise<string | null> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    return user?.coupleId?.toString() || null;
  }

  async getPartnerFcmToken(userId: string): Promise<string | null> {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user?.coupleId) return null;

    const couple = await this.coupleModel.findById(user.coupleId).lean();
    if (!couple) return null;

    const partnerId =
      couple.user1.toString() === userId
        ? couple.user2?.toString()
        : couple.user1.toString();

    if (!partnerId) return null;
    const partner = await this.userModel.findOne({ _id: partnerId, isDeleted: false }).lean();
    return partner?.fcmToken || null;
  }
}
