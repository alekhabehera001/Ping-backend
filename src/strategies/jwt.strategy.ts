import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { User } from 'src/schemas/user.schema';
import { UserPayload } from 'src/dto/user-payload.dto';
import { ForbiddenException } from '../common/filters/forbidden-exception';

interface JwtPayload {
  userId: string;
  jti?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    configService: ConfigService,
  ) {
    const accessPublicKey = Buffer.from(
      configService.getOrThrow<string>('JWT_SECRET'),
      'base64',
    ).toString('utf-8');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessPublicKey,
      algorithms: ['RS256'],
      passReqToCallback: true,
      ignoreExpiration: false,
      jsonWebTokenOptions: {
        clockTolerance: 30,
      },
    });
  }

  async validate(_req: Request, payload: JwtPayload): Promise<UserPayload> {
    const { userId, jti } = payload;

    if (!Types.ObjectId.isValid(userId)) {
      throw new ForbiddenException('Invalid user identifier');
    }

    const userObjectId = new Types.ObjectId(userId);

    try {
      const checkUser = await this.UserModel.findOne({
        _id: userId,
        ...(jti ? { 'sessions.jti': jti } : {}),
      })
        .select('_id email')
        .lean<{ _id: Types.ObjectId; email: string }>()
        .exec();

      if (!checkUser) {
        throw new ForbiddenException('User not found');
      }

      return { _id: checkUser._id, email: checkUser.email };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      throw new ForbiddenException(message);
    }
  }
}
