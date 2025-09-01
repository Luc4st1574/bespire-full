import IconDashboard from "@/assets/icons/icon_dashboard.svg";
import IconRequests from "@/assets/icons/icon_requests.svg";
import IconBrands from "@/assets/icons/icon_brands.svg";
import IconFileManager from "@/assets/icons/icon_file_manager.svg";
import IconAnalitycs from "@/assets/icons/icon_analytics.svg";
import IconLibrary from "@/assets/icons/icon_library.svg";
import IconFolders from "@/assets/icons/icon_folders.svg";
import IconFiles from "@/assets/icons/icon_files.svg";
import IconDocs from "@/assets/icons/icon_docs.svg";
import Settings from "@/assets/icons/icon_settings.svg";
import Sales from "@/assets/icons/sidebar/sales.svg";
import Prospects from "@/assets/icons/sidebar/prospects.svg";
import Contracts from "@/assets/icons/sidebar/contracts.svg";

import Client from "@/assets/icons/sidebar/client.svg";
import Invoices from "@/assets/icons/sidebar/invoices.svg";
import IconTeam from "@/assets/icons/sidebar/team.svg";
import IconCalendar from "@/assets/icons/sidebar/calendar.svg";
import IconPerformance from "@/assets/icons/sidebar/performance.svg";
import IconServices from "@/assets/icons/sidebar/services.svg";
import IconBlogs from "@/assets/icons/sidebar/blogs.svg";
import IconPlans from "@/assets/icons/sidebar/plans.svg";
import IconFeedback from "@/assets/icons/sidebar/feedback.svg";

export type MenuRole =
  | "admin"
  | "client"
  | "designer"
  | "success_manager"
  | "sales_manager"
  | "viewer"
  | string;

export type SidebarMenuItem = {
  label: string;
  href: string;
  icon: any;
  roles?: MenuRole[]; // Opcional: array de roles permitidos
  permissions?: string[]; // Opcional: array de permisos requeridos
  children?: SidebarMenuItem[];
};

export const ALL_MAIN_MENU: SidebarMenuItem[] = [
  // Admin
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconDashboard,
    roles: ["admin", "client", "designer", "success_manager", "sales_manager"],
  },

  {
    label: "Requests",
    href: "/requests",
    icon: IconRequests,
    roles: ["client", "designer", "success_manager"],
  },
  {
    label: "Sales Pipeline",
    href: "/sales",
    icon: Sales,
    roles: ["admin", "sales_manager"],
  },
  {
    label: "Prospects & Clients",
    href: "/prospects-clients",
    icon: Prospects,
    roles: ["sales_manager"],
  },
  {
    label: "Contracts & Proposals",
    href: "/contracts-proposals",
    icon: Contracts,
    roles: ["sales_manager"],
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Client,
    roles: ["admin", "designer"],
  },
  {
    label: "Team",
    href: "/team",
    icon: IconTeam,
    roles: ["admin", "success_manager"],
  },

  {
    label: "Orders",
    href: "/orders",
    icon: IconRequests,
    roles: ["admin", "success_manager"],
  },
  { label: "Invoices", href: "/invoices", icon: Invoices, roles: ["admin"] },

  { label: "Brands", href: "/brands", icon: IconBrands, roles: ["client"] },

  
];

export const ALL_EXPLORE_MENU: SidebarMenuItem[] = [
  // File Manager (solo client, pero podrías permitir a más)
  {
    label: "File Manager",
    href: "/files",
    icon: IconFileManager,
    roles: ["client", "designer", "success_manager", "admin", "sales_manager"],
    children: [
      {
        label: "Folders",
        href: "/files/folders",
        icon: IconFolders,
        roles: [
          "client",
          "designer",
          "success_manager",
          "admin",
          "sales_manager",
        ],
      },
      {
        label: "Documents",
        href: "/files/documents",
        icon: IconFiles,
        roles: [
          "client",
          "designer",
          "success_manager",
          "admin",
          "sales_manager",
        ],
      },
      {
        label: "Trash",
        href: "/files/trash",
        icon: IconDocs,
        roles: [
          "client",
          "designer",
          "success_manager",
          "admin",
          "sales_manager",
        ],
      },
    ],
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: IconCalendar,
    roles: ["admin", "designer", "success_manager", "sales_manager"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: IconAnalitycs,
    roles: ["admin", "client", "designer", "success_manager"],
  },
   {
    label: "Sales Analytics",
    href: "/sales-analytics",
    icon: IconAnalitycs,
    roles: ["sales_manager"],
  },
  {
    label: "Performance Metrics",
    href: "/metrics",
    icon: IconPerformance,
    roles: ["admin", "success_manager"],
  },

  {
    label: "Services",
    href: "/services",
    icon: IconServices,
    roles: ["admin", "client"],
  },
  { label: "Blogs", href: "/blogs", icon: IconBlogs, roles: ["admin"] },
  {
    label: "Plans & Discounts",
    href: "/plans",
    icon: IconPlans,
    roles: ["admin"],
  },
  { label: "Template Library", href: "/templates", icon: IconLibrary }, // Todos pueden ver
  {
    label: "Feedback Center",
    href: "/feedback",
    icon: IconFeedback,
    roles: ["admin"],
  },
];

export const ALL_SETTINGS_MENU: SidebarMenuItem[] = [
  { label: "Settings", href: "/settings", icon: Settings }, // Todos
];
