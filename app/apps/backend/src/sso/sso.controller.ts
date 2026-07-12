import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { SsoService } from "./sso.service";

@Controller("oauth")
export class SsoController {
  constructor(private readonly ssoService: SsoService) {}

  @Get("authorize")
  async authorize(
    @Query("client_id") clientId: string,
    @Query("redirect_uri") redirectUri: string,
    @Res() reply: FastifyReply
  ) {
    const authCode = await this.ssoService.generateAuthCode(clientId, redirectUri);
    return reply.redirect(`${redirectUri}?code=${authCode}`);
  }

  @Post("token")
  async token(
    @Body("grant_type") grantType: string,
    @Body("code") code: string,
    @Body("client_id") clientId: string,
    @Body("client_secret") clientSecret: string
  ) {
    if (grantType !== "authorization_code") {
      return { error: "unsupported_grant_type" };
    }
    return this.ssoService.exchangeCodeForTokens(code, clientId, clientSecret);
  }

  @Get("userinfo")
  async userinfo(@Query("access_token") accessToken: string) {
    return this.ssoService.getUserInfo(accessToken);
  }
}
