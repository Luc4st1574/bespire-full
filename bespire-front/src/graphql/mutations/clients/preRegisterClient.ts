import { gql } from "@apollo/client";

export const PRE_REGISTER_CLIENT_MUTATION = gql`
  mutation PreRegisterClient($input: PreRegisterClientInput!) {
    preRegisterClient(input: $input) {
      success
      message
      userId
      workspaceId
    }
  }
`;
