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
import { CalendarService } from "./calendar.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, CurrentUserType } from "../auth/current-user.decorator";

@Controller("calendar")
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get("events")
  getEvents(
    @CurrentUser() user: CurrentUserType,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.calendarService.getEvents(user.id, from, to);
  }

  @Post("events")
  createEvent(@CurrentUser() user: CurrentUserType, @Body() data: any) {
    return this.calendarService.createEvent(user.id, data);
  }

  @Patch("events/:id")
  updateEvent(@Param("id") id: string, @CurrentUser() user: CurrentUserType, @Body() data: any) {
    return this.calendarService.updateEvent(id, user.id, data);
  }

  @Delete("events/:id")
  deleteEvent(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    return this.calendarService.deleteEvent(id, user.id);
  }
}
