import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class SecurityService {
  constructor(private prisma: PrismaService) {}

  async getSecurityInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        sessions: {
          where: { revokedAt: null },
          orderBy: { lastSeenAt: "desc" },
        },
      },
    });

    if (!user) throw new NotFoundException("User not found");

    return {
      twoFactorEnabled: user.settings?.twoFactorEnabled || false,
      lastLoginAt: user.lastLoginAt,
      sessions: user.sessions.map((s) => ({
        id: s.id,
        device: s.device || "Unknown",
        ip: s.ipAddress || s.ip || "Unknown",
        lastSeenAt: s.lastSeenAt,
        createdAt: s.createdAt,
        isCurrent: false, // Will be set in controller
      })),
    };
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastSeenAt: "desc" },
    });
  }

  async revokeSession(userId: string, sessionId: string, currentSessionId?: string) {
    if (sessionId === currentSessionId) {
      throw new ForbiddenException("Cannot revoke current session");
    }

    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException("Session not found");
    if (session.userId !== userId) throw new ForbiddenException();

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllSessions(userId: string, currentSessionId: string) {
    return this.prisma.session.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException("Invalid current password");

    const newHash = await bcrypt.hash(data.newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }
}
