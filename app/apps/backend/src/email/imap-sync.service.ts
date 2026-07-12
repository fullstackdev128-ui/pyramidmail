import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { ImapFlow } from "imapflow";
import { simpleParser, ParsedMail, AddressObject } from "mailparser";
import { PrismaService } from "../prisma/prisma.service";
import { $Enums } from "@prisma/client";

const MailFolder = $Enums.MailFolder;

@Injectable()
export class ImapSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ImapSyncService.name);
  private intervalHandle: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const interval = Number(process.env.IMAP_SYNC_INTERVAL_MS ?? "30000");
    this.logger.log(
      `IMAP sync: premier run dans 15s, puis toutes les ${interval / 1000}s`
    );
    setTimeout(() => {
      this.syncAllUsers().catch((e) =>
        this.logger.error("Sync initiale échouée", e?.message)
      );
      this.intervalHandle = setInterval(() => {
        this.syncAllUsers().catch((e) =>
          this.logger.error("Sync périodique échouée", e?.message)
        );
      }, interval);
    }, 15_000);
  }

  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private async syncAllUsers() {
    if (this.isRunning) {
      this.logger.debug("Sync déjà en cours, skip");
      return;
    }
    this.isRunning = true;
    try {
      const users = await this.prisma.user.findMany({
        where: { email: { endsWith: "@pymail.cm" } },
        select: { id: true, email: true },
      });
      this.logger.debug(`Sync de ${users.length} compte(s) @pymail.cm`);
      for (const user of users) {
        await this.syncUserInbox(user).catch((e) =>
          this.logger.error(`Échec sync ${user.email}: ${e?.message}`)
        );
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async syncUserInbox(user: { id: string; email: string }) {
    const existing = await this.prisma.email.findMany({
      where: { userId: user.id, messageId: { not: null } },
      select: { messageId: true },
    });
    const knownIds = new Set(existing.map((e) => e.messageId as string));

    const client = new ImapFlow({
      host: process.env.IMAP_HOST ?? "127.0.0.1",
      port: Number(process.env.IMAP_PORT ?? "143"),
      secure: false,
      auth: {
        user: `${user.email}*${process.env.IMAP_MASTER_USER ?? "pyramidmaster"}`,
        pass: process.env.IMAP_MASTER_PASS ?? "",
      },
      logger: false,
      tls: { rejectUnauthorized: false },
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    let newCount = 0;

    try {
      const mailbox = client.mailbox;
      if (!mailbox || mailbox.exists === 0) {
        this.logger.debug(`${user.email}: INBOX vide`);
        return;
      }

      for await (const msg of client.fetch("1:*", {
        uid: true,
        source: true,
      })) {
        try {
          const parsed: ParsedMail = await simpleParser(msg.source);
          const msgId = parsed.messageId ?? null;

          if (msgId && knownIds.has(msgId)) continue;

          // Skip mails internes @pymail.cm (déjà gérés par send())
          const fromAddress = parsed.from?.value?.[0]?.address ?? "";
          if (fromAddress.endsWith("@pymail.cm")) continue;

          await this.insertEmail(user.id, parsed);

          if (msgId) knownIds.add(msgId);
          newCount++;
        } catch (e: any) {
          this.logger.warn(`Parsing échoué uid=${msg.uid}: ${e?.message}`);
        }
      }

      if (newCount > 0) {
        this.logger.log(
          `${user.email}: ${newCount} nouveau(x) mail(s) importé(s)`
        );
      } else {
        this.logger.debug(`${user.email}: rien de nouveau`);
      }
    } finally {
      lock.release();
      await client.logout();
    }
  }

  private async insertEmail(userId: string, parsed: ParsedMail) {
    const subject   = parsed.subject ?? "(sans objet)";
    const from      = this.formatAddress(parsed.from) ?? "";
    const to        = this.extractAddresses(parsed.to);
    const cc        = this.extractAddresses(parsed.cc);
    const bcc       = this.extractAddresses(parsed.bcc);
    const messageId = parsed.messageId ?? null;
    const inReplyTo = parsed.inReplyTo ?? null;
    const references = Array.isArray(parsed.references)
      ? parsed.references
      : parsed.references
      ? [parsed.references]
      : [];
    const bodyHtml  = parsed.html || null;
    const bodyText  = parsed.text || null;
    const sentAt    = parsed.date ?? new Date();
    const receivedAt = new Date();
    const snippet   = this.makeSnippet(bodyText, bodyHtml);

    await this.prisma.$transaction(async (tx) => {
      // Threading RFC : cherche un thread existant via References / In-Reply-To
      let thread = await this.findExistingThread(
        tx,
        userId,
        references,
        inReplyTo
      );

      if (!thread) {
        const normalizedSubject = subject
          .replace(/^(Re|Fwd?|Tr):\s*/gi, "")
          .trim();
        thread = await tx.thread.create({
          data: {
            userId,
            subject: normalizedSubject,
            snippet,
            lastMessageAt: sentAt,
          },
        });
      } else {
        await tx.thread.update({
          where: { id: thread.id },
          data: {
            lastMessageAt:
              sentAt > thread.lastMessageAt ? sentAt : thread.lastMessageAt,
            snippet,
          },
        });
      }

      await tx.email.create({
        data: {
          userId,
          threadId:    thread.id,
          from,
          to,
          cc,
          bcc,
          subject,
          bodyHtml,
          bodyText,
          folder:      MailFolder.INBOX,
          messageId,
          inReplyTo,
          references,
          sentAt,
          receivedAt,
          isRead:      false,
          isDeleted:   false,
          size:        Buffer.byteLength(bodyText ?? bodyHtml ?? "", "utf8"),
        },
      });

      this.logger.log(`✉  Importé: "${subject}" de ${from}`);
    });
  }

  private async findExistingThread(
    tx: any,
    userId: string,
    references: string[],
    inReplyTo: string | null
  ) {
    if (references.length === 0 && !inReplyTo) return null;
    const lookup = [...references, ...(inReplyTo ? [inReplyTo] : [])];
    const pivot = await tx.email.findFirst({
      where: { userId, messageId: { in: lookup } },
      select: { threadId: true },
    });
    if (!pivot?.threadId) return null;
    return tx.thread.findUnique({ where: { id: pivot.threadId } });
  }

  private formatAddress(
    addr: AddressObject | AddressObject[] | undefined
  ): string | null {
    if (!addr) return null;
    const a = Array.isArray(addr) ? addr[0] : addr;
    const first = a?.value?.[0];
    if (!first) return null;
    return first.name
      ? `${first.name} <${first.address}>`
      : (first.address ?? null);
  }

  private extractAddresses(
    addr: AddressObject | AddressObject[] | undefined | null
  ): string[] {
    if (!addr) return [];
    const arr = Array.isArray(addr) ? addr : [addr];
    return arr.flatMap(
      (a) => a.value?.map((v) => v.address ?? "").filter(Boolean) ?? []
    );
  }

  private makeSnippet(bodyText?: string | null, bodyHtml?: string | null) {
    const raw = bodyText ?? bodyHtml ?? "";
    return raw
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140) || null;
  }
}
