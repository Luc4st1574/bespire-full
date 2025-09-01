"use client";



import DashboardLayout from "../dashboard/layout/DashboardLayout";
import NotificationsPageMain from "@/components/notifications/NotificationPageMain";

export default function NotificationPage() {



  return (
    
      <DashboardLayout titleHead="Notifications"  >
        <NotificationsPageMain />
      </DashboardLayout>

  );
}
