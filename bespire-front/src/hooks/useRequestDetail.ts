import { useQuery, useMutation } from "@apollo/client";
import { GET_REQUEST_DETAIL } from "@/graphql/queries/requests/getRequestDetail";
import { UPDATE_REQUEST_FIELDS } from "@/graphql/mutations/requests/UpdateRequestFields";

export function useRequestDetail(requestId: string | null) {
  // 1. Query para traer el detalle (network-only para evitar cache viejo)
  const { data, loading, error, refetch } = useQuery(GET_REQUEST_DETAIL, {
    variables: { id: requestId },
    skip: !requestId,
    fetchPolicy: "network-only",
  });
  console.log("useRequestDetail called with requestId:", requestId, data);
  // 2. Mutation para actualizar campos
  const [updateRequestFields, { loading: loadingUpdate, error: errorUpdate }] = useMutation(UPDATE_REQUEST_FIELDS);

  // 3. Función para actualizar un campo y actualizar cache localmente (sin refetch manual)
  const updateFields = async (fields: { [key: string]: any }) => {
    if (!requestId) return;
    await updateRequestFields({
      variables: {
        input: {
          requestId,
          ...fields,
        },
      },
      // Actualiza el cache de GET_REQUEST_DETAIL localmente con el nuevo valor
      update: (cache, { data }) => {
        if (!data) return;
        // Aquí puedes hacer que el cache de Apollo tenga el valor actualizado,
        // pero si la mutation solo devuelve un string, mejor usa refetchQueries.
      },
      refetchQueries: [{ query: GET_REQUEST_DETAIL, variables: { id: requestId } }],
      awaitRefetchQueries: true, // Espera a que el refetch termine antes de continuar
    });
  };

  const request = data?.requestDetail || null;

  return {
    request,
    loading,
    error,
    updateFields,
    loadingUpdate,
    errorUpdate,
    refetch,
  };
}
