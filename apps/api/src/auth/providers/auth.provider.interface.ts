export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface IAuthProvider {
  signToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload>;
  logout(userId: string, token: string): Promise<void>;
}
