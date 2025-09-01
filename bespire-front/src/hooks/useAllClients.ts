import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_CLIENTS } from "../graphql/queries/clients/getAllClients";
import { UPDATE_CLIENT_INFO_MUTATION } from "../graphql/mutations/clients/updateClientInfo";
import { toast } from "sonner";

export interface ClientWithWorkspaceInfo {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleTitle?: string;
  workspaceId: string;
  workspaceName: string;
  companyId: string;
  companyName: string;
  companyWebsite?: string;
  companyLocation?: string;
  isWorkspaceOwner: boolean;
  workspaceRole?: string;
  phoneNumber?: string;
  countryCode?: string;
  notes?: string;
  successManagerId?: string;
  successManagerName?: string;
}

export interface UpdateClientInfoInput {
  clientId: string;
  email?: string;
  clientName?: string;
  roleTitle?: string;
  phoneNumber?: string;
  countryCode?: string;
  workspaceRole?: string;
  companyName?: string;
  companyWebsite?: string;
  companyLocation?: string;
  successManager?: string;
  notes?: string;
  sendConfirmation: boolean;
}

export function useAllClients() {
  const { data, loading, error, refetch } = useQuery(GET_ALL_CLIENTS);

  return {
    clients: (data?.getAllClients || []) as ClientWithWorkspaceInfo[],
    loading,
    error,
    refetch,
  };
}

export function useUpdateClientInfo() {
  const [updateClientInfoMutation, { loading }] = useMutation(UPDATE_CLIENT_INFO_MUTATION);

  const updateClientInfo = async (input: UpdateClientInfoInput) => {
    try {
      const result = await updateClientInfoMutation({
        variables: { input }
      });

      const response = result.data?.updateClientInfo;
      
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error updating client information";
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    updateClientInfo,
    loading,
  };
}
