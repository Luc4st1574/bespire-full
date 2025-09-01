"use client";

import PermissionGuard from "@/guards/PermissionGuard";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import { PERMISSIONS } from "@/constants/permissions";
import ClientsPage from "@/components/clients/clientsPage";
export default function ClientsPageMain() {
  return (
    <PermissionGuard required={PERMISSIONS.VIEW_CLIENTS}>
      <DashboardLayout >
        <ClientsPage />
      </DashboardLayout>
    </PermissionGuard>
  );
}
