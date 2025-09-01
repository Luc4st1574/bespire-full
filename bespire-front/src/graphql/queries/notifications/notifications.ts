import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query Notifications($skip: Int = 0, $limit: Int = 20) {
    notifications(skip: $skip, limit: $limit) {
      _id
      title
      description
      message
      type
      category
      read
      date
      avatar
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
  query UnreadNotificationsCount {
    unreadNotificationsCount
  }
`;
