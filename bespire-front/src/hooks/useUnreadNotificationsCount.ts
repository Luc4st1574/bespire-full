import { useQuery } from "@apollo/client";
import { GET_UNREAD_NOTIFICATIONS_COUNT } from "@/graphql/queries/notifications/notifications";

export function useUnreadNotificationsCount() {
  const { data, loading, error, refetch } = useQuery(GET_UNREAD_NOTIFICATIONS_COUNT);

  return {
    unreadCount: data?.unreadNotificationsCount ?? 0,
    loading,
    error,
    refetch,
  };
}
