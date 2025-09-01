import { MARK_ALL_NOTIFICATIONS_AS_READ } from "@/graphql/mutations/notifications/MarkAllNotificationsAsRead";
import { useMutation } from "@apollo/client";

export function useMarkAllNotificationsAsRead() {
  const [markAll, { loading, error }] = useMutation(MARK_ALL_NOTIFICATIONS_AS_READ);

  return { markAll, loading, error };
}