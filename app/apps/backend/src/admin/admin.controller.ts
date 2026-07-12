import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SuperAdminGuard } from "../auth/superadmin.guard";
import { AdminService } from "./admin.service";
import { CurrentUser, type CurrentUserType } from "../auth/current-user.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  async getStats() {
    return this.adminService.getStats();
  }

  @Get("users")
  async listUsers() {
    return this.adminService.listUsers();
  }

  @Patch("users/:id")
  async updateUserRole(
    @CurrentUser() admin: CurrentUserType,
    @Param("id") id: string,
    @Body("role") role: string
  ) {
    return this.adminService.updateUserRole(admin.id, id, role);
  }

  @Patch("users/:id/plan")
  async updateUserPlan(@Param("id") id: string, @Body("plan") plan: string) {
    return this.adminService.updateUserPlan(id, plan);
  }

  @Delete("users/:id")
  async deleteUser(@CurrentUser() admin: CurrentUserType, @Param("id") id: string) {
    return this.adminService.deleteUser(admin.id, id);
  }

  @Get("security")
  async getSecurityStats() {
    return this.adminService.getSecurityStats();
  }
}
