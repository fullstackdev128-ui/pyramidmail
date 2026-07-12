import { Body, Controller, Get, Patch, Post, UseGuards, Res, Query } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserType } from "../auth/current-user.decorator";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@CurrentUser() user: CurrentUserType) {
    return this.userService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  async updateProfile(
    @CurrentUser() user: CurrentUserType,
    @Body()
    body: { displayName?: string; phone?: string; city?: string; bio?: string; avatar?: string }
  ) {
    return this.userService.updateProfile(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("settings")
  async getSettings(@CurrentUser() user: CurrentUserType) {
    return this.userService.getSettings(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("settings")
  async updateSettings(
    @CurrentUser() user: CurrentUserType,
    @Body() body: Record<string, unknown>
  ) {
    return this.userService.updateSettings(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("plan")
  async getPlan(@CurrentUser() user: CurrentUserType) {
    const profile = await this.userService.getProfile(user.id);
    const storageUsage = await this.userService.getStorageUsage(user.id);

    return {
      plan: profile.plan ?? "free",
      role: profile.role ?? "user",
      storage: {
        used: storageUsage.used,
        limit: storageUsage.limit,
        percentage: storageUsage.percentage
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post("avatar")
  async uploadAvatar(
    @Res({ passthrough: true }) reply: FastifyReply,
    @CurrentUser() user: CurrentUserType
  ) {
    const req = reply.request as FastifyRequest & { file: () => Promise<any> };
    const file = await req.file();
    if (!file) return reply.status(400).send({ error: "missing_file" });

    const updatedUser = await this.userService.uploadAvatar(user.id, file);
    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Get("avatar-stream")
  async streamAvatar(
    @Query("key") key: string,
    @Res() reply: FastifyReply,
    @CurrentUser() user: CurrentUserType
  ) {
    // Only allow streaming if the key belongs to an avatar or the user's own file
    if (!key.startsWith("avatars/") || !key.includes(user.id)) {
      return reply.status(403).send({ error: "forbidden" });
    }
    const { stream, contentType } = await this.userService.getAvatarStream(key);
    reply.header("Content-Type", contentType);
    return reply.send(stream);
  }
}
