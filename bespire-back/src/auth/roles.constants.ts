// roles.constants.ts
export const USER_ROLES = {
  CLIENT: 'client',
  TEAM_MEMBER: 'team_member',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
