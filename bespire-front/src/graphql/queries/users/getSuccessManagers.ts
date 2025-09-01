import { gql } from "@apollo/client";

export const GET_SUCCESS_MANAGERS = gql`
  query getSuccessManagers {
    getSuccessManagers {
      id
      name
      avatarUrl
      teamRole
    }
  }
`;
