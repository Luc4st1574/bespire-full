// layouts/DashboardLayout.tsx
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "sonner";
import AuthGuard from "@/guards/AuthGuard";
import { useState } from "react";
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

  return (
    <AuthProvider>
      <AuthGuard requireWorkspace>
        <div className="flex h-screen bg-[#fbfff7] text-sm text-brand-dark">
          {/* Sidebar Desktop */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="w-64">
              <Sidebar />
            </div>
          </div>

          {/* Sidebar Mobile - Overlay */}
          {isSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black opacity-10"
                onClick={() => setIsSidebarOpen(false)}
              />
              {/* Sidebar */}
              <div className="relative flex flex-col w-64 bg-white">
                <Sidebar />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex flex-col flex-1 min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Contenido principal */}
                <div className="flex-1 min-w-0">{children}</div>

                {/* Sidebar derecho si existe */}
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
              closeButton={false} // lo hacemos manual
              className="z-[100]"
              toastOptions={{
                unstyled: true, // para usar solo tus clases
              }}
            />
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
export default DashboardLayout;