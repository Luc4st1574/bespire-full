// components/RequestDetailsModal.tsx
import { Dialog, DialogBackdrop } from "@headlessui/react";
import { useCallback, useEffect, useState } from "react";
import { useRequestDetail } from "@/hooks/useRequestDetail";
import { useReviews } from "@/hooks/useReviews";
import { useRequestStatus } from "@/hooks/useRequestStatus";
import { useAppContext } from "@/context/AppContext";
import { RequestProvider } from "@/context/RequestContext";
import RequestOverviewSidebar from "./RequestOverviewSidebar";
import RequestMainContent from "./RequestMainContent";
import ReviewModal from "../ReviewModal";
import { showSuccessToast } from "@/components/ui/toast";

export default function RequestDetailsModal({
  open,
  onClose,
  requestId,
  onBackToMain,
  onOpenSubtask,
  parentRequest,
}: {
  open: boolean;
  onClose: () => void;
  requestId: string;
  onBackToMain: () => void;
  onOpenSubtask: () => void;
  parentRequest?: { id: string; title: string };
}) {
  // 2) Reviews existentes
  const { reviews, loadingReviews, leaveReview, loadingLeave } =
    useReviews(requestId);
  const { request, loading, error } = useRequestDetail(requestId);
  const { role } = useAppContext();
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 1) Hook para manejar status + mutación
  //    dispara callback SOLO cuando editas desde el dropdown
  const {
    status,
    changeStatus,
    loading: loadingStatus,
  } = useRequestStatus(
    requestId,
    request?.status || "queued", // Fallback para evitar undefined
    (newStatus) => {
      console.log("Status changed to:", newStatus);
      if (newStatus === "completed" && reviews.length === 0) {
        handleSeeReview();
      }
    }
  );

  // Usar el status del hook si se está cargando (después de mutación), 
  // sino usar el status del request
  const currentStatus = loadingStatus ? status : (request?.status || status);

  // 4) Handlers memoizados para el badge
  const handleSeeReview = useCallback(() => setShowReviewModal(true), []);
  const handleCloseReviewModal = useCallback(
    () => setShowReviewModal(false),
    []
  );



  // 6) Loading & error states
  if (!open) return null;
  if (loading) {
    return (
      <Dialog open={true} onClose={onClose} className="relative z-50 p-4">
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 flex justify-end p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-2xl flex w-full max-w-4xl overflow-hidden items-center justify-center">
            <div className="p-10 text-gray-500">Loading request...</div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }
  if (error || !request) {
    return (
      <Dialog open={true} onClose={onClose} className="relative z-50 p-4">
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 flex justify-end p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-2xl flex w-full max-w-4xl overflow-hidden items-center justify-center">
            <div className="p-10 text-red-500">Error loading request</div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <RequestProvider status={currentStatus} role={role}>
      {/* Modal principal */}
      <Dialog open={open} onClose={onClose} className="relative z-50 p-4">
        <DialogBackdrop className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="fixed inset-0 flex justify-end p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-2xl flex w-full max-w-4xl overflow-hidden">
            {/* Sidebar */}
            <RequestOverviewSidebar
              request={request}
              onBackToMain={onBackToMain}
            />

            {/* Contenido principal */}
            <RequestMainContent
              parentRequest={parentRequest}
              request={request}
              onSeeReview={handleSeeReview}
              onClose={onClose}
              onBackToMain={onBackToMain}
              onOpenSubtask={onOpenSubtask}
              loadingStatus={loadingStatus}
              changeStatus={changeStatus}
              status={currentStatus}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Review Modal */}
      <ReviewModal
        open={showReviewModal}
        onClose={handleCloseReviewModal}
        requestTitle={request.title}
        reviews={reviews}
        loadingReviews={loadingReviews}
        onSubmit={(rating, feedback) =>
          leaveReview({ rating, feedback }).then(() => {
            handleCloseReviewModal();
            showSuccessToast("Review submitted!");
          })
        }
        loadingSubmit={loadingLeave}
      />
    </RequestProvider>
  );
}
