import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from '../types/authenticated-request';

export const CurrentUser = createParamDecorator<
  keyof AuthenticatedUser | undefined,
  AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser]
>(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user: AuthenticatedUser = request.user;
    if (data === undefined) {
      return user;
    }
    return user[data];
  },
);
