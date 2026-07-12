import { Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { resolveTxt } from "dns/promises";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.customDomain.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, domainName: string) {
    const verificationToken = randomBytes(16).toString("hex");
    const expectedTxtRecord = `pyramid-mail-verification=${verificationToken}`;

    return this.prisma.customDomain.create({
      data: {
        userId,
        domainName,
        verificationToken,
        expectedTxtRecord,
        spfRecord: `v=spf1 include:_spf.pymail.cm ~all`,
        dmarcRecord: `v=DMARC1; p=none; rua=mailto:dmarc@${domainName}`,
      },
    });
  }

  async verify(userId: string, domainId: string) {
    const domain = await this.prisma.customDomain.findFirst({
      where: { id: domainId, userId },
    });
    if (!domain) throw new NotFoundException();
    if (domain.isVerified) return { ok: true };
    if (!domain.expectedTxtRecord) return { ok: false };

    const host = `_pyramidmail.${domain.domainName}`;
    let ok = false;
    let verificationError: string | null = null;

    try {
      const records = await resolveTxt(host);
      const flattened = records.flat().map((s) => s.trim());
      ok = flattened.includes(domain.expectedTxtRecord);
      if (!ok) verificationError = "txt_not_found";
    } catch (err: any) {
      verificationError = err?.code ? String(err.code) : "dns_error";
    }

    await this.prisma.customDomain.update({
      where: { id: domain.id },
      data: {
        lastCheckedAt: new Date(),
        verificationError,
        isVerified: ok ? true : false,
        verificationToken: ok ? null : domain.verificationToken,
      },
    });

    return {
      ok,
      host,
      expected: domain.expectedTxtRecord,
      error: verificationError,
    };
  }
}
