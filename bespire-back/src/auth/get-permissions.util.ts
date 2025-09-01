// src/auth/get-permissions.util.ts
import { GLOBAL_ROLE_PERMISSIONS } from './role-permissions.map';
import { TEAM_ROLE_PERMISSIONS } from './team-role-permissions.map';
import { WORKSPACE_ROLE_PERMISSIONS } from './workspace-role-permissions.map';

export function getEffectivePermissions({
  role,
  teamRole,
  workspaceRole,
}: {
  role: string;
  teamRole?: string;
  workspaceRole?: 'admin' | 'user' | 'viewer' | null;
}) {
  const perms = new Set(GLOBAL_ROLE_PERMISSIONS[role] || []);
  if (teamRole && TEAM_ROLE_PERMISSIONS[teamRole])
    TEAM_ROLE_PERMISSIONS[teamRole].forEach((p) => perms.add(p));
  if (workspaceRole && WORKSPACE_ROLE_PERMISSIONS[workspaceRole])
    WORKSPACE_ROLE_PERMISSIONS[workspaceRole].forEach((p) => perms.add(p));
  return Array.from(perms);
}
