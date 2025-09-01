export const TEAM_ROLES = {
  DESIGNER: 'designer',
  SUCCESS_MANAGER: 'success_manager',
  PRODUCT_MANAGER: 'product_manager',
  CREATIVE_DIRECTOR: 'creative_director',
  PROJECT_MANAGER: 'project_manager',
  DATA_ANALYST: 'data_analyst',
  MARKETING: 'marketing',
  FRONTEND_DEV: 'frontend_dev',
  BACKEND_DEV: 'backend_dev',
  QA: 'qa',
} as const;

export type TeamRole = (typeof TEAM_ROLES)[keyof typeof TEAM_ROLES];

// src/auth/workspace-roles.constants.ts
export type WorkspaceRole = 'admin' | 'user' | 'viewer';
