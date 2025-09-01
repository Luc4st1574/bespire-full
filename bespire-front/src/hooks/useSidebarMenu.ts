/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppContext } from "@/context/AppContext";
import {
  ALL_MAIN_MENU,
  ALL_EXPLORE_MENU,
  ALL_SETTINGS_MENU,
  SidebarMenuItem,
} from "@/config/sidebarMenu";
import { hasPermission } from "@/utils/permissions";

function filterMenuByRoleAndPerms(
  menu: SidebarMenuItem[],
  userRole: string,
  permissions: string[]
): SidebarMenuItem[] {
  return menu
    .filter((item) => {
      // Filtra por roles si está definido
      if (item.roles && !item.roles.includes(userRole)) return false;
      // Filtra por permisos si está definido (permite si tiene al menos uno)
      if (
        item.permissions &&
        !item.permissions.some((p) => hasPermission(permissions, p as any))
      )
        return false;
      return true;
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterMenuByRoleAndPerms(item.children, userRole, permissions)
        : undefined,
    }));
}

export function useSidebarMenu() {
  const {  permissions, role } = useAppContext();
    const teamRole = role || "viewer"; // Fallback a "viewer" si no hay rol
  return {
    mainMenu: filterMenuByRoleAndPerms(ALL_MAIN_MENU, teamRole, permissions),
    exploreMenu: filterMenuByRoleAndPerms(ALL_EXPLORE_MENU, teamRole, permissions),
    settingsMenu: filterMenuByRoleAndPerms(
      ALL_SETTINGS_MENU,
      teamRole,
      permissions
    ),
  };
}
