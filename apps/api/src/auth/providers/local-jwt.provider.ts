import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthProvider, TokenPayload } from './auth.provider.interface';

@Injectable()
export class LocalJwtProvider implements IAuthProvider {
  constructor(private jwtService: JwtService) {}

  async signToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync<TokenPayload>(token);
  }

  // Local JWT is stateless — logout is handled client-side.
  // The Cognito adapter will call globalSignOut here.
  async logout(_userId: string, _token: string): Promise<void> {}
}
