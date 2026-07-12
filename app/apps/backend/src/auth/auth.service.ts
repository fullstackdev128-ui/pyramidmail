import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomBytes, createHash, timingSafeEqual } from "crypto";
import type { FastifyReply } from "fastify";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async register(body: RegisterDto) {
    // Validate email domain - must be @pymail.cm for new registrations
    if (!this.isValidPymailEmail(body.email)) {
      throw new BadRequestException('Email must use @pymail.cm domain');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new ConflictException("email_exists");
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        displayName: body.displayName?.trim() || null,
        phone: body.phone?.trim() || null,
        city: body.city?.trim() || null,
      },
      select: { id: true, email: true, displayName: true, phone: true, city: true },
    });
    return user;
  }

  async login(email: string, password: string) {
    // For login attempts with non-pymail.cm domains, only allow if user already exists
    // (to not break existing accounts). Reject if user doesn't exist.
    let user: any;
    if (!email.endsWith('@pymail.cm')) {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new UnauthorizedException();
      }
    } else {
      user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) throw new UnauthorizedException();
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException();

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = randomBytes(32).toString("hex");
    const [session] = await this.prisma.$transaction([
      this.prisma.session.create({
        data: {
          userId: user.id,
          refreshTokenHash: this.hashRefreshToken(refreshToken),
          expiresAt: this.refreshExpiryDate(),
        },
        select: { id: true },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    return {
      user: { id: user.id, email: user.email },
      accessToken,
      sessionId: session.id,
      refreshToken,
    };
  }

  async refresh(sessionId?: string, refreshToken?: string) {
    if (!sessionId || !refreshToken) throw new UnauthorizedException();

    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!session) throw new UnauthorizedException();
    if (session.revokedAt) throw new UnauthorizedException();
    if (session.expiresAt.getTime() <= Date.now()) throw new UnauthorizedException();

    const expected = Buffer.from(session.refreshTokenHash, "hex");
    const actual = Buffer.from(this.hashRefreshToken(refreshToken), "hex");
    if (expected.length !== actual.length) throw new UnauthorizedException();
    if (!timingSafeEqual(expected, actual)) throw new UnauthorizedException();

    const accessToken = await this.jwtService.signAsync({
      sub: session.user.id,
      email: session.user.email,
    });

    const newRefreshToken = randomBytes(32).toString("hex");
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: this.hashRefreshToken(newRefreshToken),
        expiresAt: this.refreshExpiryDate(),
      },
    });

    return { accessToken, newRefreshToken };
  }

  async logout(sessionId?: string) {
    if (!sessionId) return;
    await this.prisma.session.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  setAuthCookies(
    reply: FastifyReply,
    args: { accessToken: string; sessionId: string; refreshToken: string }
  ) {
    const secure = process.env.NODE_ENV === "production";

    reply.setCookie("pm_access", args.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    reply.setCookie("pm_sid", args.sessionId, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    reply.setCookie("pm_refresh", args.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  clearAuthCookies(reply: FastifyReply) {
    const secure = process.env.NODE_ENV === "production";
    const opts = {
      httpOnly: true,
      secure,
      sameSite: "lax" as const,
      path: "/",
    };
    reply.clearCookie("pm_access", opts);
    reply.clearCookie("pm_sid", opts);
    reply.clearCookie("pm_refresh", opts);
  }

  // Helper method to validate email domain - only @pymail.cm allowed
  private isValidPymailEmail(email: string): boolean {
    return email.endsWith('@pymail.cm');
  }

  private hashRefreshToken(token: string) {
    const pepper = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";
    return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
  }

  private refreshExpiryDate() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  }
}
