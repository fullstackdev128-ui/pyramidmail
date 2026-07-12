import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { $Enums } from "@prisma/client";
const MailFolder = $Enums.MailFolder;
type MailFolder = $Enums.MailFolder;
import { EmailService } from "./email.service";
import { SendEmailDto } from "./dto/send-email.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserType } from "../auth/current-user.decorator";

@Controller("emails")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(JwtAuthGuard)
  @Get("threads")
  async listThreads(
    @CurrentUser() user: CurrentUserType,
    @Query("folder") folder?: string,
    @Query("starred") starred?: string,
    @Query("important") important?: string
  ) {
    if (starred === "true" || folder === "STARRED") return this.emailService.listStarred(user.id);
    if (important === "true" || folder === "IMPORTANT")
      return this.emailService.listImportant(user.id);
    if (!folder || folder === "ALL") return this.emailService.listAllThreads(user.id);
    return this.emailService.listThreads(user.id, folder as MailFolder);
  }

  @UseGuards(JwtAuthGuard)
  @Get("threads/:id")
  async getThread(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.emailService.getThread(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("threads/:id/move")
  async move(
    @CurrentUser() user: CurrentUserType,
    @Param("id") id: string,
    @Body("folder") folder: MailFolder
  ) {
    return this.emailService.moveThread(user.id, id, folder);
  }

  @UseGuards(JwtAuthGuard)
  @Post("threads/:id/read")
  async read(
    @CurrentUser() user: CurrentUserType,
    @Param("id") id: string,
    @Body("isRead") isRead: boolean
  ) {
    return this.emailService.setThreadRead(user.id, id, isRead);
  }

  @UseGuards(JwtAuthGuard)
  @Post("send")
  async send(@CurrentUser() user: CurrentUserType, @Body() body: SendEmailDto) {
    return this.emailService.send(user.id, user.email, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("threads/:id/star")
  async star(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.emailService.toggleStar(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("threads/:id/important")
  async important(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.emailService.toggleImportant(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("threads/:id/spam")
  async markAsSpam(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.emailService.moveThread(user.id, id, MailFolder.SPAM);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("threads/:id")
  async deleteThread(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.emailService.deleteThread(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("search")
  async searchEmails(
    @CurrentUser() user: CurrentUserType,
    @Query("q") q: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("subject") subject?: string,
    @Query("folder") folder?: string,
    @Query("hasAttachments") hasAttachments?: string
  ) {
    return this.emailService.searchEmails(user.id, q || "", {
      from,
      to,
      subject,
      folder,
      hasAttachments: hasAttachments === "true",
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete("threads")
  async emptyFolder(@CurrentUser() user: CurrentUserType, @Query("folder") folder: MailFolder) {
    return this.emailService.emptyFolder(user.id, folder);
  }

  @UseGuards(JwtAuthGuard)
  @Post("draft")
  async saveDraft(@CurrentUser() user: CurrentUserType, @Body() body: SendEmailDto) {
    return this.emailService.saveDraft(user.id, user.email, body);
  }
}
