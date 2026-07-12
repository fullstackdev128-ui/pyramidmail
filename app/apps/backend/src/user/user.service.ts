import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MinioService } from "../storage/minio.service";
import { randomBytes } from "crypto";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        city: true,
        bio: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        role: true,
        plan: true,
        lastLoginAt: true,
      },
    });
    if (!user) throw new NotFoundException();

    // Calculate storage usage
    const _emailSizeResult = await this.prisma.email.aggregate({
      where: { userId },
      _sum: { size: true },
    });

    const storageUsed = _emailSizeResult._sum.size || 0;

    return {
      ...user,
      storageUsed,
    };
  }

  async updateProfile(
    userId: string,
    data: { displayName?: string; phone?: string; city?: string; bio?: string; avatar?: string }
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        phone: data.phone,
        city: data.city,
        bio: data.bio,
        avatar: data.avatar,
        // Note: role and plan should not be updatable by regular users through this method
        // These are typically admin-only operations
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        city: true,
        bio: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        role: true,
        plan: true,
        lastLoginAt: true,
      },
    });
  }

  async uploadAvatar(userId: string, file: any) {
    const key = `avatars/${userId}-${randomBytes(4).toString("hex")}-${file.filename}`;
    const buffer = await file.toBuffer();

    await this.minio.putObject(key, buffer, buffer.length, {
      "Content-Type": file.mimetype,
    });

    const avatarUrl = `/api/user/avatar-stream?key=${encodeURIComponent(key)}`;

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
      },
    });
  }

  async getSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async getAvatarStream(key: string) {
    const stat = await this.minio.statObject(key);
    const contentType =
      stat.metaData?.["content-type"] ?? stat.metaData?.["Content-Type"] ?? "image/jpeg";
    const stream = await this.minio.getObject(key);
    return { stream, contentType };
  }

  async updateSettings(userId: string, data: any) {
    // Ensure settings exist
    const existing = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!existing) {
      return this.prisma.userSettings.create({
        data: { userId, ...this.sanitizeSettings(data) },
      });
    }

    return this.prisma.userSettings.update({
      where: { userId },
      data: this.sanitizeSettings(data),
    });
  }

  private sanitizeSettings(data: Record<string, unknown>) {
    const allowed = [
      "language",
      "timezone",
      "density",
      "defaultReply",
      "theme",
      "accentColor",
      "signatureEnabled",
      "signatureContent",
      "notifDesktop",
      "notifSound",
      "notifImportantOnly",
      "vacationEnabled",
      "vacationSubject",
      "vacationMessage",
      "vacationStart",
      "vacationEnd",
      "filters",
      "blockedAddresses",
      "twoFactorEnabled",
    ];
    const sanitized: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in data) sanitized[key] = data[key];
    }
    return sanitized;
  }

  /**
   * Get storage limit in bytes for a given plan
   */
  getStorageLimitForPlan(plan: string): number {
    switch (plan) {
      case 'student':
        return 2 * 1024 * 1024 * 1024; // 2 GB
      case 'pro':
        return 15 * 1024 * 1024 * 1024; // 15 GB
      case 'corporate':
        // Corporate plan limits to be defined later - returning a large number for now
        return 100 * 1024 * 1024 * 1024; // 100 GB placeholder
      case 'free':
      default:
        return 500 * 1024 * 1024; // 500 MB for free tier
    }
  }

  /**
   * Check if user has exceeded their storage quota
   */
  async isOverStorageQuota(userId: string): Promise<boolean> {
    const user = await this.getProfile(userId);
    const storageUsed = user.storageUsed || 0;
    const storageLimit = this.getStorageLimitForPlan(user.plan);
    return storageUsed > storageLimit;
  }

  /**
   * Get storage usage and limit for a user
   */
  async getStorageUsage(userId: string): Promise<{ used: number; limit: number; percentage: number }> {
    const user = await this.getProfile(userId);
    const storageUsed = user.storageUsed || 0;
    const storageLimit = this.getStorageLimitForPlan(user.plan);
    const percentage = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

    return {
      used: storageUsed,
      limit: storageLimit,
      percentage: Math.min(100, Number(percentage.toFixed(2))),
    };
  }
}
