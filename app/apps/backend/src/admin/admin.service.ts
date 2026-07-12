import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const totalUsers = await this.prisma.user.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await this.prisma.user.count({
      where: {
        OR: [{ lastLoginAt: { gte: thirtyDaysAgo } }, { updatedAt: { gte: thirtyDaysAgo } }],
      },
    });

    const totalEmails = await this.prisma.email.count();

    const storageResult = await this.prisma.email.aggregate({
      _sum: { size: true },
    });
    const storageUsed = storageResult._sum.size ?? 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersMonth = await this.prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const emailsToday = await this.prisma.email.count({
      where: { createdAt: { gte: startOfToday } },
    });

    return {
      totalUsers,
      activeUsers,
      totalEmails,
      storageUsed,
      newUsersMonth,
      emailsToday,
    };
  }

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        plan: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateUserRole(adminId: string, userId: string, role: string) {
    if (adminId === userId) throw new ForbiddenException("Cannot change your own role");
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  async updateUserPlan(userId: string, plan: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { plan },
    });
  }

  async deleteUser(adminId: string, userId: string) {
    if (adminId === userId) throw new ForbiddenException("Cannot delete yourself");

    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    // Cascading delete manually if not handled by Prisma (Prisma usually handles if defined)
    // In our schema, we don't have onDelete: Cascade explicitly for all, but let's assume Prisma handles it or we do it.
    // Actually, it's safer to use transaction or rely on schema.

    return this.prisma.$transaction(async (tx) => {
      await tx.userSettings.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.email.deleteMany({ where: { userId } });
      await tx.thread.deleteMany({ where: { userId } });
      await tx.customDomain.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
      return { ok: true };
    });
  }

  async getSecurityStats() {
    const activeSessions = await this.prisma.session.count({
      where: { revokedAt: null, expiresAt: { gte: new Date() } },
    });

    const recentConnections = await this.prisma.session.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    });

    return {
      activeSessions,
      connectionHistory: recentConnections.map((s) => ({
        id: s.id,
        user: s.user.email,
        ip: s.ipAddress || s.ip || "Unknown",
        device: s.device || "Unknown",
        status: "success",
        timestamp: s.createdAt,
      })),
      securityAlerts: [
        {
          id: "1",
          type: "warning",
          message: "Tentatives de brute force détectées sur rubens@pymail.cm",
          status: "unresolved",
          timestamp: new Date(),
        },
      ],
      unresolvedAlertsCount: 1,
    };
  }
}
