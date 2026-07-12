import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from "@nestjs/common";
import { SecurityService } from "./security.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, CurrentUserType } from "../auth/current-user.decorator";

@Controller("user")
@UseGuards(JwtAuthGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get("security")
  async getSecurityInfo(@CurrentUser() user: CurrentUserType, @Req() req: any) {
    const currentSessionId = req.cookies?.pm_sid;
    const info = await this.securityService.getSecurityInfo(user.id);

    // Mark current session
    info.sessions = info.sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));

    return info;
  }

  @Get("sessions")
  async getSessions(@CurrentUser() user: CurrentUserType, @Req() req: any) {
    const currentSessionId = req.cookies?.pm_sid;
    const sessions = await this.securityService.getSessions(user.id);
    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }

  @Delete("sessions/:id")
  revokeSession(@Param("id") id: string, @CurrentUser() user: CurrentUserType, @Req() req: any) {
    const currentSessionId = req.cookies?.pm_sid;
    return this.securityService.revokeSession(user.id, id, currentSessionId);
  }

  @Delete("sessions")
  revokeAllSessions(@CurrentUser() user: CurrentUserType, @Req() req: any) {
    const currentSessionId = req.cookies?.pm_sid;
    return this.securityService.revokeAllSessions(user.id, currentSessionId);
  }

  @Post("change-password")
  changePassword(@CurrentUser() user: CurrentUserType, @Body() data: any) {
    return this.securityService.changePassword(user.id, data);
  }
}
