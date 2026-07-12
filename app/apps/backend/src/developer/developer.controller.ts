import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { DeveloperService } from "./developer.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PremiumGuard } from "../auth/premium.guard";
import { CurrentUser, CurrentUserType } from "../auth/current-user.decorator";

@Controller("developers")
@UseGuards(JwtAuthGuard, PremiumGuard)
export class DeveloperController {
  constructor(private readonly developerService: DeveloperService) {}

  @Get("keys")
  getKeys(@CurrentUser() user: CurrentUserType) {
    return this.developerService.getKeys(user.id);
  }

  @Post("keys")
  createKey(@CurrentUser() user: CurrentUserType, @Body() data: any) {
    return this.developerService.createKey(user.id, data);
  }

  @Delete("keys/:id")
  deleteKey(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.developerService.deleteKey(user.id, id);
  }

  @Patch("keys/:id/revoke")
  revokeKey(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.developerService.revokeKey(user.id, id);
  }

  @Get("stats")
  getStats(@CurrentUser() user: CurrentUserType) {
    return this.developerService.getStats(user.id);
  }
}
