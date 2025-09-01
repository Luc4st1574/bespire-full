import { useState, useCallback, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_REQUEST_FIELDS } from "@/graphql/mutations/requests/UpdateRequestFields";
import { GET_REQUEST_DETAIL } from "@/graphql/queries/requests/getRequestDetail";

export function useRequestStatus(
  requestId: string,
  initialStatus: string,
  onStatusChange?: (newStatus: string) => void
) {
  // Estado local del status
  const [status, setStatus] = useState(initialStatus);

  // Actualizar el status cuando cambie initialStatus
  useEffect(() => {
    if (initialStatus && initialStatus !== status) {
      setStatus(initialStatus);
    }
  }, [initialStatus, status]);

  // Mutación para actualizar en el backend
  const [updateStatus, { loading }] = useMutation(UPDATE_REQUEST_FIELDS, {
    refetchQueries: [
      { query: GET_REQUEST_DETAIL, variables: { id: requestId } }
    ],
    awaitRefetchQueries: true
  });

  // Función para cambiar status
  const changeStatus = useCallback(
    async (newStatus: string) => {
      if (newStatus === status) return;
      try {
        await updateStatus({
          variables: { input: { requestId, status: newStatus } },
        });
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      } catch (error) {
        console.error("Error updating status:", error);
        // No actualizar el estado local si la mutación falla
      }
    },
    [requestId, status, updateStatus, onStatusChange]
  );

  return { status, changeStatus, loading };
}
