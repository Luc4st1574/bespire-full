"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "sonner";
import AuthGuard from "@/guards/AuthGuard";
import { AuthProvider } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const DashboardLayout = React.memo(({
  children,
  sidebar,
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  // Check if the current route starts with /chat
  const isChatPage = pathname.startsWith('/chat');

  return (
    <AuthProvider>
      <AuthGuard requireWorkspace>
        <div className="flex h-screen bg-[#fbfff7] text-sm text-brand-dark">
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="w-64">
              <Sidebar />
            </div>
          </div>

          {isSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black opacity-10"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="relative flex flex-col w-64 bg-white">
                <Sidebar />
              </div>
            </div>
          )}

          <div className="flex flex-col flex-1 min-w-0">
            <Header />
            {/* Main content area now correctly handles chat page height */}
            <main className={`flex-1 p-6 ${isChatPage ? 'flex flex-col' : 'overflow-y-auto'}`}>
              <div className={`flex gap-6 ${isChatPage ? 'flex-1' : 'flex-col lg:flex-row'}`}>
                <div className={`min-w-0 ${isChatPage ? 'flex flex-1' : 'flex-1'}`}>
                  {children}
                </div>
                {sidebar && (
                  <aside className="w-full lg:w-[250px] shrink-0">
                    {sidebar}
                  </aside>
                )}
              </div>
            </main>
            <Toaster
              position="bottom-right"
              expand={false}
              duration={3000}
              closeButton={false}
              className="z-[100]"
              toastOptions={{ unstyled: true }}
            />
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
export default DashboardLayout;