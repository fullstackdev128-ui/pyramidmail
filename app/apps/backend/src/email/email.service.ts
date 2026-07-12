import { Injectable, NotFoundException } from "@nestjs/common";
import { $Enums } from "@prisma/client";
const MailFolder = $Enums.MailFolder;
type MailFolder = $Enums.MailFolder;
import nodemailer from "nodemailer";
import { Readable } from "stream";
import { PrismaService } from "../prisma/prisma.service";
import { SendEmailDto } from "./dto/send-email.dto";
import { MinioService } from "../storage/minio.service";

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService
  ) {}

  async listThreads(userId: string, folder: MailFolder) {
    const threads = await this.prisma.thread.findMany({
      where: {
        userId,
        emails: { some: { folder, isDeleted: false } },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
      include: {
        emails: {
          where: { folder, isDeleted: false },
          orderBy: { sentAt: "desc" },
          take: 1,
          select: {
            from: true,
            to: true,
            sentAt: true,
            isRead: true,
            isStarred: true,
            isImportant: true,
          },
        },
      },
    });

    const ids = threads.map((t: any) => t.id);

    const unreadCounts = await this.prisma.email.groupBy({
      by: ["threadId"],
      where: {
        userId,
        folder,
        isDeleted: false,
        isRead: false,
        threadId: { in: ids },
      },
      _count: { _all: true },
    });

    const countsByThreadId = new Map<string, number>();
    for (const row of unreadCounts) {
      if (row.threadId) countsByThreadId.set(row.threadId, row._count._all);
    }

    return threads.map((t: any) => {
      const last = t.emails[0];
      return {
        id: t.id,
        subject: t.subject,
        snippet: t.snippet,
        lastMessageAt: t.lastMessageAt,
        lastFrom: last?.from ?? null,
        lastTo: last?.to ?? [],
        lastSentAt: last?.sentAt ?? null,
        unreadCount: countsByThreadId.get(t.id) ?? 0,
        isStarred: last?.isStarred ?? false,
        isImportant: last?.isImportant ?? false,
      };
    });
  }

  async getThread(userId: string, threadId: string) {
    const thread = await this.prisma.thread.findFirst({
      where: { id: threadId, userId },
      include: {
        emails: {
          where: { isDeleted: false },
          orderBy: { sentAt: "asc" },
        },
      },
    });
    if (!thread) throw new NotFoundException();
    return thread;
  }

  async moveThread(userId: string, threadId: string, folder: MailFolder) {
    await this.assertThreadOwnership(userId, threadId);
    await this.prisma.email.updateMany({
      where: { userId, threadId, isDeleted: false },
      data: { folder },
    });
    return { ok: true };
  }

  async setThreadRead(userId: string, threadId: string, isRead: boolean) {
    await this.assertThreadOwnership(userId, threadId);
    await this.prisma.email.updateMany({
      where: { userId, threadId, isDeleted: false },
      data: { isRead },
    });
    return { ok: true };
  }

  async send(userId: string, fromEmail: string, body: SendEmailDto) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? "1025"),
      secure: String(process.env.SMTP_SECURE ?? "false") === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      tls: { rejectUnauthorized: false },
    });

    const attachments = body.attachments ?? [];
    const nodemailerAttachments = await Promise.all(
      attachments.map(async (a) => {
        const stream = (await this.minio.getObject(a.key)) as Readable;
        return {
          filename: a.name,
          contentType: a.contentType,
          content: await this.streamToBuffer(stream),
        };
      })
    );

    const res = await transport.sendMail({
      from: fromEmail,
      to: body.to.join(", "),
      cc: (body.cc ?? []).join(", "),
      bcc: (body.bcc ?? []).join(", "),
      subject: body.subject,
      html: body.bodyHtml,
      text: body.bodyText,
      attachments: nodemailerAttachments,
    });

    const sentAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      let senderThreadId = body.threadId;

      if (senderThreadId) {
        const existingThread = await tx.thread.findFirst({
          where: { id: senderThreadId, userId },
        });
        if (existingThread) {
          await tx.thread.update({
            where: { id: senderThreadId },
            data: {
              subject: body.subject,
              snippet: this.makeSnippet(body.bodyText, body.bodyHtml),
              lastMessageAt: sentAt,
            },
          });
          // Delete previous drafts
          await tx.email.deleteMany({
            where: { threadId: senderThreadId, userId, folder: MailFolder.DRAFT },
          });
        } else {
          senderThreadId = undefined;
        }
      }

      if (!senderThreadId) {
        const senderThread = await tx.thread.create({
          data: {
            userId,
            subject: body.subject,
            snippet: this.makeSnippet(body.bodyText, body.bodyHtml),
            lastMessageAt: sentAt,
          },
          select: { id: true },
        });
        senderThreadId = senderThread.id;
      }

      const senderEmail = await tx.email.create({
        data: {
          userId,
          threadId: senderThreadId,
          from: fromEmail,
          to: body.to,
          cc: body.cc ?? [],
          bcc: body.bcc ?? [],
          subject: body.subject,
          bodyHtml: body.bodyHtml,
          bodyText: body.bodyText,
          attachments: attachments as any,
          folder: MailFolder.SENT,
          isRead: true,
          messageId: res.messageId,
          sentAt,
        },
      });

      // ── NOUVEAU — Livraison interne ──────────────────────────────
      const allRecipients = [...(body.to ?? []), ...(body.cc ?? []), ...(body.bcc ?? [])];

      // On utilise un Set pour éviter les doublons de livraison si un email est dans plusieurs champs
      const uniqueRecipients = [...new Set(allRecipients)];

      for (const recipientEmail of uniqueRecipients) {
        // Ne pas se livrer à soi-même en INBOX si on est dans les destinataires
        if (recipientEmail === fromEmail) continue;

        const recipientUser = await this.prisma.user.findUnique({
          where: { email: recipientEmail },
        });

        if (recipientUser) {
          const recipientThread = await tx.thread.create({
            data: {
              userId: recipientUser.id,
              subject: body.subject,
              snippet: this.makeSnippet(body.bodyText, body.bodyHtml),
              lastMessageAt: sentAt,
            },
            select: { id: true },
          });

          await tx.email.create({
            data: {
              userId: recipientUser.id,
              threadId: recipientThread.id,
              from: fromEmail,
              to: body.to,
              cc: body.cc ?? [],
              bcc: body.bcc ?? [],
              subject: body.subject,
              bodyHtml: body.bodyHtml,
              bodyText: body.bodyText,
              attachments: attachments as any,
              folder: MailFolder.INBOX,
              isRead: false,
              messageId: res.messageId,
              sentAt,
            },
          });
        }
      }

      return senderEmail;
    });
  }

  private async assertThreadOwnership(userId: string, threadId: string) {
    const t = await this.prisma.thread.findFirst({
      where: { id: threadId, userId },
      select: { id: true },
    });
    if (!t) throw new NotFoundException();
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  private makeSnippet(bodyText?: string, bodyHtml?: string) {
    const raw = bodyText ?? bodyHtml ?? "";
    const text = raw
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 140) || null;
  }

  // ── List ALL threads (no folder filter) ────────────────────────
  async listAllThreads(userId: string) {
    const threads = await this.prisma.thread.findMany({
      where: {
        userId,
        emails: {
          some: {
            folder: { notIn: [MailFolder.TRASH, MailFolder.SPAM] },
            isDeleted: false,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 100,
      include: {
        emails: {
          where: { isDeleted: false, folder: { notIn: [MailFolder.TRASH, MailFolder.SPAM] } },
          orderBy: { sentAt: "desc" },
          take: 1,
          select: {
            from: true,
            to: true,
            sentAt: true,
            isRead: true,
            folder: true,
            isStarred: true,
            isImportant: true,
          },
        },
      },
    });

    return threads.map((t: any) => {
      const last = t.emails[0];
      return {
        id: t.id,
        subject: t.subject,
        snippet: t.snippet,
        lastMessageAt: t.lastMessageAt,
        lastFrom: last?.from ?? null,
        lastTo: last?.to ?? [],
        lastSentAt: last?.sentAt ?? null,
        unreadCount: 0,
        folder: last?.folder ?? "INBOX",
        isStarred: last?.isStarred ?? false,
        isImportant: last?.isImportant ?? false,
      };
    });
  }

  // ── List STARRED threads ───────────────────────────────────────
  async listStarred(userId: string) {
    const threads = await this.prisma.thread.findMany({
      where: {
        userId,
        emails: { some: { isStarred: true, isDeleted: false } },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
      include: {
        emails: {
          where: { isStarred: true, isDeleted: false },
          orderBy: { sentAt: "desc" },
          take: 1,
          select: {
            from: true,
            to: true,
            sentAt: true,
            isRead: true,
            isStarred: true,
            isImportant: true,
          },
        },
      },
    });

    return threads.map((t: any) => {
      const last = t.emails[0];
      return {
        id: t.id,
        subject: t.subject,
        snippet: t.snippet,
        lastMessageAt: t.lastMessageAt,
        lastFrom: last?.from ?? null,
        lastTo: last?.to ?? [],
        lastSentAt: last?.sentAt ?? null,
        unreadCount: 0,
        isStarred: true,
        isImportant: last?.isImportant ?? false,
      };
    });
  }

  // ── List IMPORTANT threads ─────────────────────────────────────
  async listImportant(userId: string) {
    const threads = await this.prisma.thread.findMany({
      where: {
        userId,
        emails: { some: { isImportant: true } },
      },
      include: {
        emails: {
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return threads.map((t) => {
      const lastEmail = t.emails[0];
      return {
        id: t.id,
        subject: t.subject,
        lastFrom: lastEmail?.from || "Unknown",
        lastTo: lastEmail?.to?.[0] || "",
        date: lastEmail?.sentAt || t.updatedAt,
        snippet: lastEmail?.bodyHtml?.replace(/<[^>]*>/g, "").slice(0, 100) || "",
        isRead: lastEmail?.isRead ?? true,
        isStarred: lastEmail?.isStarred ?? false,
        isImportant: lastEmail?.isImportant ?? false,
        hasAttachments: lastEmail?.attachments
          ? (lastEmail.attachments as any[]).length > 0
          : false,
      };
    });
  }

  // ── Toggle star on all emails of a thread ──────────────────────
  async toggleStar(userId: string, threadId: string) {
    await this.assertThreadOwnership(userId, threadId);
    const emails = await this.prisma.email.findMany({
      where: { userId, threadId, isDeleted: false },
      select: { isStarred: true },
      take: 1,
    });
    const newState = !(emails[0]?.isStarred ?? false);
    await this.prisma.email.updateMany({
      where: { userId, threadId, isDeleted: false },
      data: { isStarred: newState },
    });
    return { ok: true, isStarred: newState };
  }

  // ── Toggle important on all emails of a thread ─────────────────
  async toggleImportant(userId: string, threadId: string) {
    await this.assertThreadOwnership(userId, threadId);
    const emails = await this.prisma.email.findMany({
      where: { userId, threadId, isDeleted: false },
      select: { isImportant: true },
      take: 1,
    });
    const newState = !(emails[0]?.isImportant ?? false);
    await this.prisma.email.updateMany({
      where: { userId, threadId, isDeleted: false },
      data: { isImportant: newState },
    });
    return { ok: true, isImportant: newState };
  }

  // ── Hard delete a thread and its emails ────────────────────────
  async deleteThread(userId: string, threadId: string) {
    await this.assertThreadOwnership(userId, threadId);
    await this.prisma.email.deleteMany({ where: { userId, threadId } });
    await this.prisma.thread.delete({ where: { id: threadId } });
    return { ok: true };
  }

  // ── Empty an entire folder (trash/spam) ────────────────────────
  async emptyFolder(userId: string, folder: MailFolder) {
    const threads = await this.prisma.thread.findMany({
      where: {
        userId,
        emails: { some: { folder, isDeleted: false } },
      },
      select: { id: true },
    });
    const ids = threads.map((t) => t.id);
    if (ids.length > 0) {
      await this.prisma.email.deleteMany({ where: { userId, threadId: { in: ids }, folder } });
      // Delete threads that no longer have emails
      for (const id of ids) {
        const remaining = await this.prisma.email.count({ where: { threadId: id } });
        if (remaining === 0) {
          await this.prisma.thread.delete({ where: { id } });
        }
      }
    }
    return { ok: true, deleted: ids.length };
  }

  // ── Save draft ─────────────────────────────────────────────────
  async saveDraft(userId: string, fromEmail: string, body: SendEmailDto) {
    let threadId = body.threadId;

    return this.prisma.$transaction(async (tx) => {
      if (threadId) {
        const existingThread = await tx.thread.findFirst({
          where: { id: threadId, userId },
        });

        if (existingThread) {
          await tx.thread.update({
            where: { id: threadId },
            data: {
              subject: body.subject || "(Sans objet)",
              snippet: this.makeSnippet(body.bodyText, body.bodyHtml),
              lastMessageAt: new Date(),
            },
          });

          // Look for an existing draft in this thread
          const existingDraft = await tx.email.findFirst({
            where: { threadId, userId, folder: MailFolder.DRAFT },
          });

          if (existingDraft) {
            return tx.email.update({
              where: { id: existingDraft.id },
              data: {
                to: body.to ?? [],
                cc: body.cc ?? [],
                bcc: body.bcc ?? [],
                subject: body.subject || "(Sans objet)",
                bodyHtml: body.bodyHtml,
                bodyText: body.bodyText,
                attachments: (body.attachments as any) ?? [],
              },
            });
          }
        } else {
          threadId = undefined; // Invalid threadId, fallback to create
        }
      }

      if (!threadId) {
        const thread = await tx.thread.create({
          data: {
            userId,
            subject: body.subject || "(Sans objet)",
            snippet: this.makeSnippet(body.bodyText, body.bodyHtml),
            lastMessageAt: new Date(),
          },
          select: { id: true },
        });
        threadId = thread.id;
      }

      return tx.email.create({
        data: {
          userId,
          threadId,
          from: fromEmail,
          to: body.to ?? [],
          cc: body.cc ?? [],
          bcc: body.bcc ?? [],
          subject: body.subject || "(Sans objet)",
          bodyHtml: body.bodyHtml,
          bodyText: body.bodyText,
          attachments: (body.attachments as any) ?? [],
          folder: MailFolder.DRAFT,
          isRead: true,
        },
      });
    });
  }

  // ── Search emails ──────────────────────────────────────────────
  async searchEmails(
    userId: string,
    query: string,
    filters: {
      from?: string;
      to?: string;
      subject?: string;
      folder?: string;
      hasAttachments?: boolean;
    }
  ) {
    const emailSomeAnd: any[] = [{ isDeleted: false }];

    if (filters.from) {
      emailSomeAnd.push({ from: { contains: filters.from, mode: "insensitive" } });
    }

    if (filters.to) {
      emailSomeAnd.push({
        OR: [
          { to: { hasSome: [filters.to] } },
          { cc: { hasSome: [filters.to] } },
          { bcc: { hasSome: [filters.to] } },
          { from: { contains: filters.to, mode: "insensitive" } },
        ],
      });
    }

    if (filters.folder) {
      emailSomeAnd.push({ folder: filters.folder as MailFolder });
    }

    if (filters.hasAttachments) {
      emailSomeAnd.push({ attachments: { not: [] as any } });
    }

    const threadAnd: any[] = [{ userId }];

    if (filters.subject) {
      threadAnd.push({ subject: { contains: filters.subject, mode: "insensitive" } });
    }

    const hasAdvancedEmailFilters =
      !!filters.from || !!filters.to || !!filters.folder || !!filters.hasAttachments;

    if (query) {
      const recipientThreadIds = await this.threadIdsWithRecipientContaining(userId, query);
      const textMatchOr: any[] = [
        { subject: { contains: query, mode: "insensitive" } },
        { snippet: { contains: query, mode: "insensitive" } },
        {
          emails: {
            some: {
              AND: [
                ...emailSomeAnd,
                {
                  OR: [
                    { from: { contains: query, mode: "insensitive" } },
                    { bodyHtml: { contains: query, mode: "insensitive" } },
                    { bodyText: { contains: query, mode: "insensitive" } },
                  ],
                },
              ],
            },
          },
        },
      ];

      if (recipientThreadIds.length > 0) {
        textMatchOr.push({ id: { in: recipientThreadIds } });
      }

      threadAnd.push({ OR: textMatchOr });
    } else if (hasAdvancedEmailFilters) {
      threadAnd.push({
        emails: {
          some: {
            AND: emailSomeAnd,
          },
        },
      });
    }

    const threads = await this.prisma.thread.findMany({
      where: { AND: threadAnd },
      include: {
        emails: {
          where: { isDeleted: false },
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return threads.map((t) => {
      const lastEmail = t.emails[0];
      return {
        id: t.id,
        subject: t.subject,
        lastFrom: lastEmail?.from || "Unknown",
        lastTo: lastEmail?.to?.[0] || "",
        date: lastEmail?.sentAt || t.updatedAt,
        snippet: t.snippet || "",
        isRead: lastEmail?.isRead ?? true,
        isStarred: lastEmail?.isStarred ?? false,
        isImportant: lastEmail?.isImportant ?? false,
        hasAttachments: lastEmail?.attachments
          ? (lastEmail.attachments as any[]).length > 0
          : false,
      };
    });
  }

  private async threadIdsWithRecipientContaining(userId: string, term: string): Promise<string[]> {
    const pattern = `%${term}%`;
    const rows = await this.prisma.$queryRaw<Array<{ threadId: string | null }>>`
      SELECT DISTINCT e."threadId" AS "threadId"
      FROM "Email" e
      WHERE e."userId" = ${userId}
        AND e."isDeleted" = false
        AND e."threadId" IS NOT NULL
        AND (
          EXISTS (SELECT 1 FROM unnest(e."to") AS addr WHERE addr ILIKE ${pattern})
          OR EXISTS (SELECT 1 FROM unnest(e."cc") AS addr WHERE addr ILIKE ${pattern})
          OR EXISTS (SELECT 1 FROM unnest(e."bcc") AS addr WHERE addr ILIKE ${pattern})
        )
    `;
    return rows.map((r) => r.threadId).filter((id): id is string => !!id);
  }
}
