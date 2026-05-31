import { UserPayload } from '../dto/user-payload.dto';
declare const OptionalJwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class OptionalJwtAuthGuard extends OptionalJwtAuthGuard_base {
    handleRequest<TUser = UserPayload>(err: Error | null, user: UserPayload | false | null): TUser;
}
export {};
