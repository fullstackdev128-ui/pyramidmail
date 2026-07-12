import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, CurrentUserType } from "../auth/current-user.decorator";

@Controller("tasks")
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  getTasks(
    @CurrentUser() user: CurrentUserType,
    @Query("status") status?: string,
    @Query("priority") priority?: string
  ) {
    return this.taskService.getTasks(user.id, status, priority);
  }

  @Post()
  createTask(@CurrentUser() user: CurrentUserType, @Body() data: any) {
    return this.taskService.createTask(user.id, data);
  }

  @Patch(":id")
  updateTask(@Param("id") id: string, @CurrentUser() user: CurrentUserType, @Body() data: any) {
    return this.taskService.updateTask(id, user.id, data);
  }

  @Delete(":id")
  deleteTask(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    return this.taskService.deleteTask(id, user.id);
  }

  @Patch(":id/complete")
  completeTask(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    return this.taskService.completeTask(id, user.id);
  }
}
