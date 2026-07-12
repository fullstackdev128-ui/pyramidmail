import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { DomainService } from "./domain.service";
import { CreateDomainDto } from "./dto/create-domain.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserType } from "../auth/current-user.decorator";

@Controller("domains")
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@CurrentUser() user: CurrentUserType) {
    return this.domainService.list(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: CurrentUserType, @Body() body: CreateDomainDto) {
    return this.domainService.create(user.id, body.domainName);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/verify")
  async verify(@CurrentUser() user: CurrentUserType, @Param("id") id: string) {
    return this.domainService.verify(user.id, id);
  }
}
