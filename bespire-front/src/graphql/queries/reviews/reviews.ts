import { gql } from "@apollo/client";
export const REVIEWS_BY_REQUEST = gql`
 query ReviewsByRequest($requestId: String!) {
  reviewsByRequest(requestId: $requestId) {
    _id
    rating
    feedback
    createdAt
  }
}
`;
