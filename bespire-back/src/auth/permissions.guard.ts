import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions) return true;

    // En GraphQL, usuario está en ctx.getArgByIndex(2).req.user
    const ctx = context.getArgByIndex ? context.getArgByIndex(2) : null;
    const user = ctx?.req?.user;
    if (!user) throw new ForbiddenException('No user found');

    const userPerms = user.permissions || [];

    // Aquí usamos la nueva función
    const hasAll = requiredPermissions.every((perm) =>
      hasPermissionOrManage(userPerms, perm),
    );

    if (!hasAll) throw new ForbiddenException('Insufficient permissions');
    return true;
  }
}

// Helper function fuera de la clase
function hasPermissionOrManage(userPerms: string[], perm: string): boolean {
  if (userPerms.includes(perm)) return true;

  // Permisos tipo "edit_requests" => busca "manage_requests"
  const parts = perm.split('_');
  if (parts.length > 1) {
    const entity = parts.slice(1).join('_');
    const managePerm = `manage_${entity}`;
    console.log(`Checking for manage permission: ${managePerm}`);
    if (userPerms.includes(managePerm)) {
      console.log(`User has manage permission: ${managePerm}`);
      return true;
    }
  }
  return false;
}
