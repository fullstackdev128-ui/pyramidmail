import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { randomBytes } from "crypto";

@Injectable()
export class DeveloperService {
  constructor(private prisma: PrismaService) {}

  async getKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createKey(userId: string, data: any) {
    const key = `pm_${randomBytes(32).toString("hex")}`;
    return this.prisma.apiKey.create({
      data: {
        name: data.name,
        permissions: data.permissions || [],
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        key,
        userId,
      },
    });
  }

  async deleteKey(userId: string, id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) throw new NotFoundException("API Key not found");
    if (apiKey.userId !== userId) throw new ForbiddenException();

    return this.prisma.apiKey.delete({ where: { id } });
  }

  async revokeKey(userId: string, id: string) {
    const apiKey = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) throw new NotFoundException("API Key not found");
    if (apiKey.userId !== userId) throw new ForbiddenException();

    return this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(userId: string) {
    const activeKeysCount = await this.prisma.apiKey.count({
      where: { userId, isActive: true },
    });

    return {
      totalRequests: 1250, // Mocked as requested
      successRate: 99.8, // Mocked as requested
      activeKeys: activeKeysCount,
    };
  }
}
