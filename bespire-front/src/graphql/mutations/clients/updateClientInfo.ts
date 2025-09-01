import { gql } from "@apollo/client";

export const UPDATE_CLIENT_INFO_MUTATION = gql`
  mutation UpdateClientInfo($input: UpdateClientInfoInput!) {
    updateClientInfo(input: $input) {
      success
      message
      clientId
      workspaceId
      companyId
    }
  }
`;
