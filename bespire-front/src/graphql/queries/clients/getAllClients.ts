import { gql } from "@apollo/client";

export const GET_ALL_CLIENTS = gql`
  query getAllClients {
    getAllClients {
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
      successManagerId
      successManagerName
      notes
    }
  }
`;
