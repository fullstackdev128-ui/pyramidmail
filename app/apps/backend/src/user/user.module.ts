import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { SecurityController } from "./security.controller";
import { SecurityService } from "./security.service";

@Module({
  controllers: [UserController, SecurityController],
  providers: [UserService, SecurityService],
})
export class UserModule {}
