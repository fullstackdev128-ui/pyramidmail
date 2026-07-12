import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getEvents(userId: string, from?: string, to?: string) {
    const where: any = { userId };
    if (from || to) {
      where.startDate = {};
      if (from) where.startDate.gte = new Date(from);
      if (to) where.startDate.lte = new Date(to);
    }
    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: "asc" },
    });
  }

  async createEvent(userId: string, data: any) {
    return this.prisma.calendarEvent.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        userId,
      },
    });
  }

  async updateEvent(id: string, userId: string, data: any) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException("Event not found");
    if (event.userId !== userId) throw new ForbiddenException();

    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException("Event not found");
    if (event.userId !== userId) throw new ForbiddenException();

    return this.prisma.calendarEvent.delete({ where: { id } });
  }
}
