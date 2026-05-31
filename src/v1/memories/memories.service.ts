import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { S3Service } from '../../services/s3.service';
import { Memory, MemoryDocument, MemoryType } from '../../schemas/memory.schema';
import { User, UserDocument } from '../../schemas/user.schema';

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'ping-app-memories';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'audio/m4a', 'audio/x-m4a'];

@Injectable()
export class MemoriesService {
  constructor(
    @InjectModel(Memory.name) private readonly memoryModel: Model<MemoryDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly s3Service: S3Service,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getPresignedUrl(userId: string, contentType: string, fileName: string) {
    if (!ALLOWED_MIME.includes(contentType)) {
      throw new BadRequestException('File type not allowed');
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const key = `couples/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadUrl = await this.s3Service.generatePresignedPutUrl(S3_BUCKET, key, contentType, 300);
    const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;

    return { uploadUrl, key, publicUrl };
  }

  async createMemory(
    userId: string,
    data: { type: MemoryType; s3Key?: string; caption?: string; noteText?: string },
  ) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) throw new BadRequestException('Must be in a couple');

    let s3Url: string | undefined;
    if (data.s3Key) {
      s3Url = `https://${S3_BUCKET}.s3.amazonaws.com/${data.s3Key}`;
    }

    const memory = await this.memoryModel.create({
      coupleId: user.coupleId,
      uploadedBy: new Types.ObjectId(userId),
      type: data.type,
      s3Key: data.s3Key,
      s3Url,
      caption: data.caption,
      noteText: data.noteText,
    });

    this.eventEmitter.emit('memory.created', {
      senderId: userId,
      coupleId: user.coupleId.toString(),
      memoryId: (memory._id as Types.ObjectId).toString(),
      type: data.type,
    });

    return memory;
  }

  async getTimeline(userId: string, cursor?: string, limit = 20) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) return { items: [], nextCursor: null };

    const filter: any = { coupleId: user.coupleId, isDeleted: false };
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    const items = await this.memoryModel
      .find(filter)
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = items.length > limit;
    if (hasMore) items.pop();

    const nextCursor = hasMore ? (items[items.length - 1] as any).createdAt.toISOString() : null;

    return { items, nextCursor };
  }

  async getMonthlyRecap(userId: string) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: false }).lean();
    if (!user || !user.coupleId) return [];

    return this.memoryModel.aggregate([
      { $match: { coupleId: user.coupleId, isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          items: { $push: { _id: '$_id', type: '$type', s3Url: '$s3Url', caption: '$caption', createdAt: '$createdAt' } },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);
  }

  async deleteMemory(userId: string, memoryId: string): Promise<void> {
    const memory = await this.memoryModel
      .findOne({ _id: memoryId, uploadedBy: new Types.ObjectId(userId), isDeleted: false })
      .exec();
    if (!memory) throw new NotFoundException('Memory not found');

    memory.isDeleted = true;
    await memory.save();
  }
}
