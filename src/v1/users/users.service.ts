import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private readonly coupleModel: Model<CoupleDocument>,
  ) {}

  async getMe(userId: string) {
    const user = await this.userModel
      .findOne({ _id: userId, isDeleted: false })
      .select('-otp -sessions -password -loginAttempts -lockUntil')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, data: { name?: string; avatar?: string; fcmToken?: string }) {
    const updated = await this.userModel
      .findOneAndUpdate(
        { _id: userId, isDeleted: false },
        { $set: data },
        { new: true, select: '-otp -sessions -password -loginAttempts -lockUntil' },
      )
      .lean();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async getPartner(userId: string) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new NotFoundException('No partner found');

    const couple = await this.coupleModel.findById(user.coupleId).lean();
    if (!couple) throw new NotFoundException('Couple not found');

    const partnerId =
      couple.user1.toString() === userId
        ? couple.user2?.toString()
        : couple.user1.toString();

    if (!partnerId) throw new NotFoundException('Partner not linked yet');

    const partner = await this.userModel
      .findOne({ _id: partnerId, isDeleted: false })
      .select('-otp -sessions -password -loginAttempts -lockUntil -fcmToken')
      .lean();
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async findById(userId: string | Types.ObjectId) {
    return this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
  }
}
