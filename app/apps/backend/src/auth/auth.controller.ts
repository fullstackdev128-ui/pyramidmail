import { Body, Controller, Get, Post, Res, UseGuards } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { CredentialsDto } from "./dto/credentials.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { CurrentUser, type CurrentUserType } from "./current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post("login")
  async login(@Body() body: CredentialsDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const { user, accessToken, sessionId, refreshToken } = await this.authService.login(
      body.email,
      body.password
    );

    this.authService.setAuthCookies(reply, {
      accessToken,
      sessionId,
      refreshToken,
    });

    return { user };
  }

  @Post("refresh")
  async refresh(@Res({ passthrough: true }) reply: FastifyReply, @Body() _body: unknown) {
    const req = reply.request as FastifyRequest;
    const sessionId = (req.cookies as any)?.pm_sid as string | undefined;
    const refreshToken = (req.cookies as any)?.pm_refresh as string | undefined;

    const { accessToken, newRefreshToken } = await this.authService.refresh(
      sessionId,
      refreshToken
    );

    this.authService.setAuthCookies(reply, {
      accessToken,
      sessionId: sessionId!,
      refreshToken: newRefreshToken,
    });

    return { ok: true };
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) reply: FastifyReply) {
    const req = reply.request as FastifyRequest;
    const sessionId = (req.cookies as any)?.pm_sid as string | undefined;
    await this.authService.logout(sessionId);
    this.authService.clearAuthCookies(reply);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: CurrentUserType) {
    return { user };
  }
}
