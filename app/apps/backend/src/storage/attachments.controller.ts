import { Controller, Get, Post, Query, Res, UseGuards, BadRequestException } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { randomBytes } from "crypto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserType } from "../auth/current-user.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { MinioService } from "./minio.service";

@Controller("attachments")
export class AttachmentsController {
  constructor(
    private readonly minio: MinioService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post("upload")
  async upload(
    @Res({ passthrough: true }) reply: FastifyReply,
    @CurrentUser() user: CurrentUserType
  ) {
    const req = reply.request as FastifyRequest & { file: () => Promise<any> };
    const file = await req.file();
    if (!file) return reply.status(400).send({ error: "missing_file" });

    // Check storage quota before uploading
    const { used, limit } = await this.userService.getStorageUsage(user.id);
    const fileBuffer = await file.toBuffer();
    const fileSize = fileBuffer.length;

    if (used + fileSize > limit) {
      return reply.status(413).send({
        error: "insufficient_storage",
        message: `Storage quota exceeded. Used: ${this.formatBytes(used)}, Limit: ${this.formatBytes(limit)}`
      });
    }

    const key = `${user.id}/${randomBytes(12).toString("hex")}-${file.filename}`;
    await this.minio.putObject(key, fileBuffer, fileBuffer.length, {
      "Content-Type": file.mimetype,
    });

    return { key, name: file.filename, size: fileSize, contentType: file.mimetype };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async download(
    @CurrentUser() user: CurrentUserType,
    @Query("key") key: string,
    @Res() reply: FastifyReply
  ) {
    if (!key || !(await this.userCanAccessAttachment(user.id, key))) {
      return reply.status(404).send({ error: "not_found" });
    }

    const stat = await this.minio.statObject(key);
    const contentType =
      stat.metaData?.["content-type"] ??
      stat.metaData?.["Content-Type"] ??
      "application/octet-stream";
    const filename = key.split("/").pop() ?? "download";

    const stream = await this.minio.getObject(key);
    reply.header("Content-Type", contentType);
    reply.header("Content-Disposition", `inline; filename="${encodeURIComponent(filename)}"`);
    return reply.send(stream);
  }

  /** Own uploads or attachments referenced on one of the user's emails (incl. received mail) */
  private async userCanAccessAttachment(userId: string, key: string): Promise<boolean> {
    if (key.startsWith(`${userId}/`)) return true;

    const emails = await this.prisma.email.findMany({
      where: { userId, isDeleted: false },
      select: { attachments: true },
    });

    return emails.some((e) => {
      const list = e.attachments as Array<{ key?: string }> | null;
      return Array.isArray(list) && list.some((a) => a.key === key);
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
