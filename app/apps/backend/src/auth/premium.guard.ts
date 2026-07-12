import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";

@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    if (user.role === "superadmin" || user.plan === "premium") {
      return true;
    }

    throw new ForbiddenException("Premium or Superadmin plan required");
  }
}
