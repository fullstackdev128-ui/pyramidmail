import { Controller, Get, Post, Query, Res, UseGuards } from "@nestjs/common";
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
    private readonly prisma: PrismaService
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

    const key = `${user.id}/${randomBytes(12).toString("hex")}-${file.filename}`;
    const buffer = await file.toBuffer();
    await this.minio.putObject(key, buffer, buffer.length, {
      "Content-Type": file.mimetype,
    });

    return { key, name: file.filename, size: buffer.length, contentType: file.mimetype };
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
}
