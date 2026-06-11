import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../providers/auth.provider.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload => {
    const req = ctx.switchToHttp().getRequest<{ user?: TokenPayload }>();
    if (!req.user) throw new Error('JwtAuthGuard must run before @CurrentUser()');
    return req.user;
  },
);
