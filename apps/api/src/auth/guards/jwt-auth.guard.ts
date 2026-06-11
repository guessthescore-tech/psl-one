import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { LocalJwtProvider } from '../providers/local-jwt.provider';
import { TokenPayload } from '../providers/auth.provider.interface';

interface RawRequest {
  headers: { authorization?: string | string[] };
  user?: TokenPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private provider: LocalJwtProvider) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RawRequest>();
    const token = this.extractToken(req);
    if (!token) throw new UnauthorizedException();

    try {
      req.user = await this.provider.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractToken(req: RawRequest): string | null {
    const raw = req.headers['authorization'];
    const header = Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
    const [type, token] = header.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
