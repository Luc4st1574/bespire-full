import { gql } from "@apollo/client";

export const UPDATE_REQUEST_FIELDS = gql`
  mutation UpdateRequestFields($input: UpdateRequestFieldsInput!) {
    updateRequestFields(input: $input)
  }
`;
