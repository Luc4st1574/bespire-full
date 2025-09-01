// src/auth/role-permissions.map.ts
import { USER_ROLES } from './roles.constants';
import { PERMISSIONS } from './permissions.constants';

export const GLOBAL_ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.CLIENT]: [PERMISSIONS.VIEW_FILES],
  [USER_ROLES.TEAM_MEMBER]: [PERMISSIONS.VIEW_INTERNAL_REQUESTS],
};
