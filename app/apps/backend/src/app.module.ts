import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { EmailModule } from "./email/email.module";
import { SsoModule } from "./sso/sso.module";
import { DomainModule } from "./domain/domain.module";
import { StorageModule } from "./storage/storage.module";
import { UserModule } from "./user/user.module";
import { AdminModule } from "./admin/admin.module";
import { CalendarModule } from "./calendar/calendar.module";
import { TaskModule } from "./task/task.module";
import { DeveloperModule } from "./developer/developer.module";

@Module({
  imports: [
    BullModule.forRoot({ connection: { url: process.env.REDIS_URL } }),
    PrismaModule,
    StorageModule,
    AuthModule,
    EmailModule,
    SsoModule,
    DomainModule,
    UserModule,
    AdminModule,
    CalendarModule,
    TaskModule,
    DeveloperModule,
  ],
})
export class AppModule {}
