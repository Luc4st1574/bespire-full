// src/auth/utils/buildUserJwtPayload.util.ts

interface BuildUserJwtPayloadParams {
  user: {
    id: string;
    email: string;
    role: string; // user.role (client, admin, team_member, etc)
    teamRole?: string; // user.teamRole (designer, success_manager, etc)
  };
  workspaceRole?: string; // admin, user, viewer
  permissions: string[]; // Permisos efectivos calculados
  extra?: Record<string, any>; // Por si quieres inyectar algo extra
}

/**
 * Construye el payload para el JWT del usuario,
 * combinando role, teamRole, workspaceRole y permisos.
 */
export function buildUserJwtPayload({
  user,
  workspaceRole,
  permissions,
  extra = {},
}: BuildUserJwtPayloadParams) {
  // Usa el teamRole como "role" solo si es team_member, si no el role base
  const mainRole =
    user.role === 'team_member' && user.teamRole ? user.teamRole : user.role;

  return {
    sub: user.id,
    email: user.email,
    role: mainRole, // designer, admin, client, etc
    permissions, // array de permisos efectivos
    workspaceRole, // admin, user, viewer
    ...extra, // cualquier otro dato extra opcional
  };
}
