import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserPayload } from '../dto/user-payload.dto';

interface TokenInfo {
  name?: string;
  message?: string;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = UserPayload>(
    err: Error | null,
    user: UserPayload | false | null,
    info?: TokenInfo,
  ): TUser {
    // Strategy validate() throws ForbiddenException (e.g. user deleted) — do not mask as invalid JWT.
    if (err instanceof ForbiddenException) {
      throw err;
    }

    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token is expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token is not valid');
      }
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token is not active');
      }
      throw new UnauthorizedException('Token is not valid');
    }
    return { ...user } as unknown as TUser;
  }
}
