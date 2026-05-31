import mongoose, { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare class Otp {
    code: string;
    type: string;
    expiresAt: Date;
    attempts: number;
    isUsed: boolean;
    lastSentAt: Date;
    verifiedAt?: Date;
}
export declare class Session {
    jti: string;
    refreshTokenHash?: string;
    deviceInfo: string;
    createdAt: Date;
    expiresAt: Date;
}
export declare class User extends Document {
    email: string;
    password: string;
    name: string;
    avatar?: string;
    fcmToken?: string;
    coupleId?: Types.ObjectId;
    isEmailVerified: boolean;
    provider: string;
    providerId: string;
    isActive: boolean;
    isDeleted: boolean;
    loginAttempts: number;
    lockUntil: Date;
    otp: Otp;
    sessions: Session[];
    appLanguage?: string;
}
export declare const UserSchema: mongoose.Schema<User, mongoose.Model<User, any, any, any, mongoose.Document<unknown, any, User, any, {}> & User & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, User, mongoose.Document<unknown, {}, mongoose.FlatRecord<User>, {}, mongoose.DefaultSchemaOptions> & mongoose.FlatRecord<User> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
