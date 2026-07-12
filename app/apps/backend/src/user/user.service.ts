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
      },
    });
    if (!user) throw new NotFoundException();
    return user;
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
}
