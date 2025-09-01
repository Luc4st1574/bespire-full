import { GET_NOTIFICATIONS } from "@/graphql/queries/notifications/notifications";
import { useQuery } from "@apollo/client";

export function useNotifications({ skip = 0, limit = 10 } = {}) {
  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_NOTIFICATIONS,
    {
      variables: { skip, limit },
      fetchPolicy: "cache-and-network",
    }
  );

  console.log("useNotifications data:", data);

  return {
    notifications: data?.notifications || [],
    loading,
    error,
    fetchMore,
    refetch,
  };
}
