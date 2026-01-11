import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    // TODO: Implement proper admin role check
    // For now, check if user has admin flag or specific role
    if (!user.isAdmin && user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
