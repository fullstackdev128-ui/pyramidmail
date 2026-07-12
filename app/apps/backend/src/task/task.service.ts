import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getTasks(userId: string, status?: string, priority?: string) {
    const where: any = { userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async createTask(userId: string, data: any) {
    return this.prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId,
      },
    });
  }

  async updateTask(id: string, userId: string, data: any) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException("Task not found");
    if (task.userId !== userId) throw new ForbiddenException();

    return this.prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }

  async deleteTask(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException("Task not found");
    if (task.userId !== userId) throw new ForbiddenException();

    return this.prisma.task.delete({ where: { id } });
  }

  async completeTask(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException("Task not found");
    if (task.userId !== userId) throw new ForbiddenException();

    return this.prisma.task.update({
      where: { id },
      data: {
        status: "done",
        completedAt: new Date(),
      },
    });
  }
}
