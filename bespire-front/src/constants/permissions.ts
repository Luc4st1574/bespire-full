// src/auth/permissions.constants.ts
export const PERMISSIONS = {
  //requests
  MANAGE_REQUESTS: 'manage_requests',
  CREATE_REQUESTS: 'create_requests',
  VIEW_REQUESTS: 'view_requests',
  EDIT_REQUESTS: 'edit_requests',
  DELETE_REQUESTS: 'delete_requests',
  //brands
  MANAGE_BRANDS: 'manage_brands',
  CREATE_BRANDS: 'create_brands',
  VIEW_BRANDS: 'view_brands',
  EDIT_BRANDS: 'edit_brands',
  DELETE_BRANDS: 'delete_brands',
  //files
  UPLOAD_FILES: 'upload_files',
  DELETE_FILES: 'delete_files',
  MANAGE_FILES: 'manage_files',
  VIEW_FILES: 'view_files',
  //workspace
  MANAGE_WORKSPACE: 'manage_workspace',
  VIEW_WORKSPACE: 'view_workspace',
  EDIT_WORKSPACE: 'edit_workspace',
  //members
  MANAGE_MEMBERS: 'manage_members',
  VIEW_MEMBERS: 'view_members',
  EDIT_MEMBERS: 'edit_members',
  DELETE_MEMBERS: 'delete_members',
  INVITE_MEMBERS: 'invite_members',
  //Dashboard permissions
  MANAGE_DASHBOARD: 'manage_dashboard',
  VIEW_DASHBOARD: 'view_dashboard',
  EDIT_DASHBOARD: 'edit_dashboard',
  //user assignments
  USER_ASSIGNMENTS: 'user_assignments',
  //comments
  MANAGE_COMMENTS: 'manage_comments',
  VIEW_COMMENTS: 'view_comments',
  CREATE_COMMENTS: 'create_comments',
  EDIT_COMMENTS: 'edit_comments',
  DELETE_COMMENTS: 'delete_comments',
  //feedback
  MANAGE_FEEDBACK: 'manage_feedback',
  CREATE_FEEDBACK: 'create_feedback',
  VIEW_FEEDBACK: 'view_feedback',
  EDIT_FEEDBACK: 'edit_feedback',
  DELETE_FEEDBACK: 'delete_feedback',

  //settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  DELETE_SETTINGS: 'delete_settings',
  //plan
  MANAGE_PLAN: 'manage_plan',
  VIEW_PLAN: 'view_plan',
  EDIT_PLAN: 'edit_plan',
  DELETE_PLAN: 'delete_plan',
  //user profile
  EDIT_PROFILE: 'edit_profile',
  VIEW_PROFILE: 'view_profile',
  MANAGE_PROFILE: 'manage_profile',
  //links
  MANAGE_LINKS: 'manage_links',
  CREATE_LINKS: 'create_links',
  VIEW_LINKS: 'view_links',
  EDIT_LINKS: 'edit_links',
  DELETE_LINKS: 'delete_links',
  //services
  MANAGE_SERVICES: 'manage_services',
  CREATE_SERVICES: 'create_services',
  VIEW_SERVICES: 'view_services',
  EDIT_SERVICES: 'edit_services',
  DELETE_SERVICES: 'delete_services',
  //users
  MANAGE_USERS: 'manage_users',
  CREATE_USERS: 'create_users',
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',

  //sales
  MANAGE_SALES: 'manage_sales',
  CREATE_SALES: 'create_sales',
  VIEW_SALES: 'view_sales',
  EDIT_SALES: 'edit_sales',
  DELETE_SALES: 'delete_sales',
  //client
  MANAGE_CLIENTS: 'manage_clients',
  CREATE_CLIENTS: 'create_clients',
  VIEW_CLIENTS: 'view_clients',
  EDIT_CLIENTS: 'edit_clients',
  DELETE_CLIENTS: 'delete_clients',

  //invoices
  MANAGE_INVOICES: 'manage_invoices',
  CREATE_INVOICES: 'create_invoices',
  VIEW_INVOICES: 'view_invoices',
  EDIT_INVOICES: 'edit_invoices',
  DELETE_INVOICES: 'delete_invoices',

  //analytics
  MANAGE_ANALYTICS: 'manage_analytics',
  VIEW_ANALYTICS: 'view_analytics',
  EDIT_ANALYTICS: 'edit_analytics',
  DELETE_ANALYTICS: 'delete_analytics',

    //calendar
    MANAGE_CALENDAR: 'manage_calendar',
    CREATE_CALENDAR_EVENTS: 'create_calendar_events',
    VIEW_CALENDAR_EVENTS: 'view_calendar_events',
    EDIT_CALENDAR_EVENTS: 'edit_calendar_events',
    DELETE_CALENDAR_EVENTS: 'delete_calendar_events',

} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
