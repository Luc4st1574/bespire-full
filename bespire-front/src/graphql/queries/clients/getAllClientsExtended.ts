import { gql } from '@apollo/client';

export const GET_ALL_CLIENTS_EXTENDED = gql`
  query GetAllClientsExtended {
    getAllClientsExtended {
      id
      name
      email
      avatarUrl
      roleTitle
      workspaceId
      workspaceName
      companyId
      companyName
      companyWebsite
      companyLocation
      isWorkspaceOwner
      workspaceRole
      phoneNumber
      countryCode
      notes
      successManagerId
      successManagerName
      plan {
        name
        icon
        bg
      }
      rating
      timeRequest
      revisions
      lastSession
      contractStart
      status
      totalRequests
      completedRequests
      totalRevisions
    }
  }
`;
