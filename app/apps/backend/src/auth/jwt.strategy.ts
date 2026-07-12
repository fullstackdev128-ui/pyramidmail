import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";

type JwtPayload = { sub: string; email: string };

function cookieExtractor(req: any) {
  return req?.cookies?.pm_access;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "dev-jwt-secret",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        isVerified: true,
        displayName: true,
        role: true,
        avatar: true,
        plan: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
