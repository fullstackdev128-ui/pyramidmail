import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { ImapSyncService } from "./imap-sync.service";

@Module({
  controllers: [EmailController],
  providers: [EmailService, ImapSyncService],
})
export class EmailModule {}
