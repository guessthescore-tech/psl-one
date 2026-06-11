import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly verifier = CognitoJwtVerifier.create({
    userPoolId: process.env['COGNITO_USER_POOL_ID'] ?? '',
    tokenUse: 'access',
    clientId: process.env['COGNITO_CLIENT_ID'] ?? '',
  });

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Record<string, unknown>>();
    const token = this.extractBearerToken(request);
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await this.verifier.verify(token);
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        roles: (payload['cognito:groups'] as string[]) ?? [],
        tenantId: process.env['TENANT_ID'] ?? 'psl',
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractBearerToken(request: Record<string, unknown>): string | null {
    const headers = request['headers'] as Record<string, string> | undefined;
    const auth = headers?.['authorization'] ?? '';
    return auth.startsWith('Bearer ') ? auth.slice(7) : null;
  }
}
