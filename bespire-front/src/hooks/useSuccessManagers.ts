import { useQuery } from "@apollo/client";
import { GET_SUCCESS_MANAGERS } from "../graphql/queries/users/getSuccessManagers";

export interface SuccessManager {
  id: string;
  name: string;
  avatarUrl?: string;
  teamRole?: string;
}

export function useSuccessManagers() {
  const { data, loading, error } = useQuery(GET_SUCCESS_MANAGERS);

  return {
    successManagers: (data?.getSuccessManagers || []) as SuccessManager[],
    loading,
    error,
  };
}
