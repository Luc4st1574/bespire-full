// src/hooks/useRequestReviews.ts
import { LEAVE_REVIEW } from "@/graphql/mutations/reviews/reviews";
import { REVIEWS_BY_REQUEST } from "@/graphql/queries/reviews/reviews";
import { useQuery, useMutation } from "@apollo/client";


export function useReviews(requestId: string) {
  const {
    data,
    loading: loadingReviews,
    error: errorReviews,
    refetch,
  } = useQuery(REVIEWS_BY_REQUEST, {
    variables: { requestId },
    skip: !requestId,
    fetchPolicy: "network-only",
  });


  const [leaveReviewMutation, { loading: loadingLeave }] = useMutation(
    LEAVE_REVIEW,
    {
      onCompleted: () => {
        // tras crear, recargamos la lista para que existing aparezca
        refetch();
      },
      refetchQueries: [{ query: REVIEWS_BY_REQUEST, variables: { requestId } }],
    }
  );

  const leaveReview = async (opts: { rating: number; feedback?: string }) => {
    await leaveReviewMutation({
      variables: {
        input: {
          linkedToId: requestId,
          linkedToType: "request",
          rating: opts.rating,
          feedback: opts.feedback,
        },
      },
    });
  };

  return {
    reviews: data?.reviewsByRequest || [],
    loadingReviews,
    errorReviews,
    leaveReview,
    loadingLeave,
  };
}
