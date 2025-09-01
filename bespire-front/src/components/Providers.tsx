"use client";

import { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "@/graphql/apollo-client";
import { AppProvider } from "../context/AppContext";
import { AuthProvider, useAuth } from "../context/AuthContext"; // Import AuthProvider and useAuth
import { WorkspaceProvider } from "@/hooks/useWorkspace"; // Import WorkspaceProvider
import { Toaster } from "sonner";

// This new inner component can safely call useAuth because it's a child of AuthProvider.
function AppWithWorkspace({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const workspaceId = user?.workspaceSelected || "";

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      {children}
    </WorkspaceProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppProvider>
          <AppWithWorkspace>
            {children}
          </AppWithWorkspace>
          <Toaster
            position="bottom-right"
            toastOptions={{
              unstyled: true,
            }}
          />
        </AppProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}