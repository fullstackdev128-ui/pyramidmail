import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type CurrentUserType = { id: string; email: string; isVerified: boolean; role: string };

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as CurrentUserType;
});
