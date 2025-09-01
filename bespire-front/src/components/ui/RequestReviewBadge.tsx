// components/RequestReviewBadge.tsx
import React from "react";
import { useReviews } from "@/hooks/useReviews";
import Star from "@/assets/icons/reviews/star.svg"; // Asegúrate de tener un icono de estrella
import Button from "./Button";
export default function RequestReviewBadge({
  requestId,
    onSeeReview,
}: {
  /** ID del request a consultar */
  requestId: string;
  /** Callback al click en “See Review” */
  onSeeReview: () => void;
}) {
  const { reviews, loadingReviews } = useReviews(requestId);

  // Si está cargando o no hay reviews, no mostramos nada
  if (loadingReviews || reviews.length === 0) return null;

  // Como solo hay una review por request, tomamos la primera
  const { rating } = reviews[0];

  return (
    <Button
      variant="see_review"
      type="button"
      size="md"
          onClick={onSeeReview}
      className="w-full"
    >
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-[#697D67]" />
        <span>{rating}</span>
        <span className="underline hover:text-green-900">See Review</span>
      </div>
    </Button>
  );
}
