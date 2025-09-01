// components/ReviewModal.tsx
import { Dialog, DialogBackdrop } from "@headlessui/react";
import { X } from "lucide-react";
import Star from "@/assets/icons/reviews/star.svg";
import Button from "../ui/Button";
import { useState } from "react";

export interface Review {
  rating: number;
  feedback?: string;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  requestTitle?: string;

  /** Reviews existentes para este request */
  reviews: Review[];
  /** Mientras cargan las reviews */
  loadingReviews?: boolean;

  /** Callback que dispara el envío de una nueva review */
  onSubmit?: (rating: number, feedback?: string) => Promise<void>;
  /** Flag de carga durante el envío */
  loadingSubmit?: boolean;
}

export default function ReviewModal({
  open,
  onClose,
  requestTitle,
  reviews,
  loadingReviews = false,
  onSubmit,
  loadingSubmit = false,
}: ReviewModalProps) {
  const existing = reviews[0];

  // Estado local sólo para el formulario
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleStar = (n: number) => setRating(n);
  const handleSubmit = () => {
    if (!onSubmit || rating < 1) return;
    onSubmit(rating, feedback || undefined);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
          {/* Cerrar */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-gray-600 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mientras cargan las reviews, un placeholder simple */}
          {loadingReviews ? (
            <div className="py-10 text-center text-gray-500">Loading…</div>

          ) : existing ? (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-medium">Your Review</h2>
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((n) => (
                  <Star
                    key={n}
                    className={`w-8 h-8 ${
                      n <= existing.rating ? "text-[#697D67]" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              {existing.feedback && (
                <p className="text-sm text-gray-700">{existing.feedback}</p>
              )}
            </div>

          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-1">
                  Satisfied with the request?
                </h2>
                {requestTitle && (
                  <p className="text-gray-600 text-sm">
                    Let us know by giving <b>{requestTitle}</b> a quick rating.
                  </p>
                )}
              </div>

              {/* Estrellas */}
              <div className="flex justify-center gap-1">
                {[1,2,3,4,5].map((n) => (
                  <Star
                    key={n}
                    className={`w-8 h-8 cursor-pointer ${
                      n <= rating ? "text-[#697D67]" : "text-gray-300"
                    }`}
                    onClick={() => handleStar(n)}
                  />
                ))}
              </div>

              {/* Feedback */}
              <textarea
                className="w-full border rounded-lg p-2 resize-none outline-none border-[#C4CCC8]"
                rows={2}
                placeholder="Tell us more (optional)…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              {/* Botones */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  type="button"
                  disabled={loadingSubmit}
                >
                  Cancel
                </Button>
                <Button
                  variant="green2"
                  className="flex-1"
                  type="button"
                  onClick={handleSubmit}
                  disabled={rating < 1 || loadingSubmit}
                >
                  {loadingSubmit ? "Submitting…" : "Submit"}
                </Button>
              </div>
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
