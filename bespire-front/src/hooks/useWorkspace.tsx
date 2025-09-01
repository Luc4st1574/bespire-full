import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useQuery, ApolloQueryResult } from "@apollo/client";
import { GET_WORKSPACE_BASIS_BY_ID } from "../graphql/queries/workspace/getWorkspaceBasisById";
import { User } from "../types/users";

type Workspace = {
  _id: string;
  name: string;
  currentStep: number;
  onboardingCompleted: boolean;
  hasPaid?: boolean;
  owner?: User;
  companyName?: string
  companyImg?: string
  defaultRequestsView?: "List" | "Grid";
  quickLinks?: boolean;
  getStarted?: boolean;
  plan?: string
  planCancelPending?: boolean;
  planEndsAt?: string;
};
interface GetWorkspaceData {
  getWorkspaceBasisById: Workspace;
}

type WorkspaceContextType = {
  workspace: Workspace | null;
  workspaceId: string;
  refetchWorkspace: () => Promise<ApolloQueryResult<GetWorkspaceData>>;
  loading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({
  children,
  workspaceId,
}: {
  children: ReactNode;
  workspaceId: string;
}) {
  console.log("WorkspaceProvider workspaceId", workspaceId)
  const { data, loading, refetch } = useQuery<GetWorkspaceData>(GET_WORKSPACE_BASIS_BY_ID, {
    variables: { workspaceId },
    skip: !workspaceId,
  });

  console.log("Workspace data:", data);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace: data?.getWorkspaceBasisById ?? null,
        workspaceId: workspaceId,
        refetchWorkspace: refetch,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}