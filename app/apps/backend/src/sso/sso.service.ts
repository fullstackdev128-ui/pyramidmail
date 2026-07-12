import { Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";

type AuthCodePayload = { clientId: string; redirectUri: string };
type TokenPayload = { userId: string; email: string };

@Injectable()
export class SsoService {
  private readonly authCodes = new Map<string, AuthCodePayload>();
  private readonly accessTokens = new Map<string, TokenPayload>();

  async generateAuthCode(clientId: string, redirectUri: string) {
    const code = randomBytes(16).toString("hex");
    this.authCodes.set(code, { clientId, redirectUri });
    return code;
  }

  async exchangeCodeForTokens(code: string, clientId: string, clientSecret: string) {
    const payload = this.authCodes.get(code);
    if (!payload) throw new UnauthorizedException();
    if (payload.clientId !== clientId) throw new UnauthorizedException();
    if (!clientSecret) throw new UnauthorizedException();

    const accessToken = randomBytes(24).toString("hex");
    this.accessTokens.set(accessToken, { userId: "dev", email: "dev@pymail.cm" });
    this.authCodes.delete(code);

    return {
      access_token: accessToken,
      token_type: "bearer",
      expires_in: 3600,
    };
  }

  async getUserInfo(accessToken: string) {
    const payload = this.accessTokens.get(accessToken);
    if (!payload) throw new UnauthorizedException();
    return { sub: payload.userId, email: payload.email };
  }
}
