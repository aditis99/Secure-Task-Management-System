import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionName, RequestUser, RoleName } from '@secure-task-mgmt/data';
import { PERMISSIONS_KEY, ROLES_KEY, ORG_SCOPE_KEY } from '../constants';
import { OrgScope } from '../types/org-scope.type';

const ROLE_INHERITANCE: Record<RoleName, RoleName[]> = {
  [RoleName.OWNER]: [RoleName.OWNER, RoleName.ADMIN, RoleName.VIEWER],
  [RoleName.ADMIN]: [RoleName.ADMIN, RoleName.VIEWER],
  [RoleName.VIEWER]: [RoleName.VIEWER],
};

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const requiredPermissions =
      this.reflector.getAllAndOverride<PermissionName[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const orgScope =
      this.reflector.getAllAndOverride<OrgScope | undefined>(ORG_SCOPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? undefined;

    if (!requiredRoles.length && !requiredPermissions.length && !orgScope) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: RequestUser | undefined = request?.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (requiredRoles.length && !requiredRoles.some((role) => this.roleSatisfies(user.role, role))) {
      throw new ForbiddenException('Insufficient role');
    }

    if (requiredPermissions.length && !requiredPermissions.every((perm) => user.permissions.includes(perm))) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (orgScope && !user.organizationId) {
      throw new ForbiddenException('Organization membership required');
    }

    request.orgScope = orgScope;
    return true;
  }

  private roleSatisfies(userRole: RoleName, requiredRole: RoleName): boolean {
    const inheritanceChain = ROLE_INHERITANCE[userRole] ?? [userRole];
    return inheritanceChain.includes(requiredRole);
  }
}
