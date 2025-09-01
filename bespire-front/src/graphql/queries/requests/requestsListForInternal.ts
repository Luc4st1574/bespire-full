import { gql } from "@apollo/client";

export const GET_REQUESTS_LIST_FOR_INTERNAL = gql`
  query requestsListForInternal {
    requestsListForInternal {
      id
      title
      client
      createdAt
      category
      dueDate
      parentRequest
      assignees {
        id
        name
        avatarUrl
        teamRole
      }
      commentsCount
      attachmentsCount
      subtasksCount
      credits
      priority
      status
    }
  }
`;
