import { gql } from "@apollo/client";

export const LEAVE_REVIEW = gql`
  mutation LeaveReview($input: CreateReviewInput!) {
    leaveReview(input: $input) {
      _id
      linkedToId
      rating
      feedback
      createdAt
    }
  }
`;
