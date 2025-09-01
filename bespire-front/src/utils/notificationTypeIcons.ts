// utils/notificationTypeIcons.tsx
import RequestIcon from "@/assets/icons/icon_requests.svg";
import AnalyticsIcon from "@/assets/icons/icon_analytics.svg";
import LibraryIcon from "@/assets/icons/icon_library.svg";
import AssigneeIcon from "@/assets/icons/account.svg";

export const NOTIFICATION_TYPE_ICONS: Record<
  string,
  React.FC<{ className?: string }>
> = {
  request: RequestIcon,
  analytic: AnalyticsIcon,
  library: LibraryIcon,
  assignee: AssigneeIcon,

  // ...más tipos aquí
};
