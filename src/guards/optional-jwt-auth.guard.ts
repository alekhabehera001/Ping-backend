import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserPayload } from '../dto/user-payload.dto';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UserPayload>(err: Error | null, user: UserPayload | false | null): TUser {
    // Don't throw if there's no token — just skip attaching user
    if (err || !user) {
      return null as unknown as TUser;
    }
    return { ...user } as unknown as TUser;
  }
}
