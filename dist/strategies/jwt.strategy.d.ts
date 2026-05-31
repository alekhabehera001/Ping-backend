import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { Request } from 'express';
import { User } from "../schemas/user.schema";
import { UserPayload } from "../dto/user-payload.dto";
interface JwtPayload {
    userId: string;
    jti?: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly UserModel;
    constructor(UserModel: Model<User>, configService: ConfigService);
    validate(_req: Request, payload: JwtPayload): Promise<UserPayload>;
}
export {};
