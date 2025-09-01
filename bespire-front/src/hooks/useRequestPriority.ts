import { useMutation } from "@apollo/client";
import { UPDATE_REQUEST_FIELDS } from "@/graphql/mutations/requests/UpdateRequestFields";
import { GET_REQUEST_DETAIL } from "@/graphql/queries/requests/getRequestDetail";
import { GET_REQUESTS } from "@/graphql/mutations/requests/getRequests";

export function useRequestPriority() {
  const [updateRequestFields, { loading, error }] = useMutation(UPDATE_REQUEST_FIELDS);

  const updatePriority = async (requestId: string, newPriority: string) => {
    if (!requestId) return;
    
    try {
      await updateRequestFields({
        variables: {
          input: {
            requestId,
            priority: newPriority,
          },
        },
        // Actualizar múltiples queries que podrían mostrar la prioridad
        refetchQueries: [
          { query: GET_REQUEST_DETAIL, variables: { id: requestId } },
          { query: GET_REQUESTS }, // Para actualizar la lista principal
        ],
        awaitRefetchQueries: true,
      });
    } catch (err) {
      console.error('Error updating priority:', err);
      throw err;
    }
  };

  return {
    updatePriority,
    loading,
    error,
  };
}