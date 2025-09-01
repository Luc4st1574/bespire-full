// hooks/useClients.ts
import { useMutation } from "@apollo/client";
import { useCallback } from "react";
import { toast } from "sonner";
import { PRE_REGISTER_CLIENT_MUTATION } from "../graphql/mutations/clients/preRegisterClient";

export interface PreRegisterClientInput {
  email: string;
  clientName: string;
  roleTitle: string;
  teamRole?: string;
  phoneNumber?: string;
  countryCode?: string;
  companyName: string;
  companyWebsite?: string;
  companyLocation?: string;
  successManager?: string;
  notes?: string;
  sendInvitation: boolean;
  isTeamMember?: boolean;
}

export interface PreRegisterClientResponse {
  success: boolean;
  message: string;
  userId?: string;
  workspaceId?: string;
}

export function useClients() {
  const [preRegisterClientMutation, { loading: preRegisterLoading }] = useMutation(PRE_REGISTER_CLIENT_MUTATION);

  const preRegisterClient = useCallback(
    async (input: PreRegisterClientInput): Promise<PreRegisterClientResponse> => {
      try {
        const result = await preRegisterClientMutation({
          variables: { input }
        });

        const response = result.data?.preRegisterClient;
        
        // Ya no mostramos toast aquí, se maneja en el componente
        return response;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Error al pre-registrar cliente";
        toast.error(errorMessage);
        throw error;
      }
    },
    [preRegisterClientMutation]
  );

  return {
    preRegisterClient,
    preRegisterLoading,
  };
}
