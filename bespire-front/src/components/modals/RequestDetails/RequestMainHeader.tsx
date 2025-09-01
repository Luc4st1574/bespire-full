/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// components/RequestMainHeader.tsx
import { Bell, Link, MoreHorizontal, X } from "lucide-react";
import RequestStatusDropdown from "../../ui/RequestStatusDropdown";
import RequestReviewBadge from "@/components/ui/RequestReviewBadge";


type RequestMainHeaderProps = {
  status: string;
  title: string;
  requestId: string | number;
  role: string;
  onClose: () => void;
  parentRequest?: any;
  onBackToMain?: () => void;
  parentRequestTitle?: string;
  onSeeReview?: () => void;
  loadingStatus: boolean;
  changeStatus: (status: string) => void;
};

export default function RequestMainHeader({
  status,
  title,
  requestId,
  role,
  onClose,
  parentRequest,
  onBackToMain,
  parentRequestTitle,
  onSeeReview,
  loadingStatus,
  changeStatus
}: RequestMainHeaderProps) {
  console.log("RequestMainHeader rendered with status:", status, "role:", role);

  return (
    <>
      <div className="flex items-start justify-between ">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
              <RequestStatusDropdown
                status={status}
                loading={loadingStatus}
                onChange={changeStatus}
                role={role}
              />
            <RequestReviewBadge 
            //@ts-ignore
            requestId={requestId} onSeeReview={onSeeReview} />
          </div>
          {/* Migas de pan si es subtask */}
          {parentRequest && (
            <div className="flex items-center gap-1 mt-3">
              <span className="text-black">{parentRequestTitle}</span>
              <img src="/assets/icons/mayorq.svg" alt="" className="w-4 h-4" />
            </div>
          )}
          <div className="font-bold text-2xl">{title}</div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            title="Copy Link"
            className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
          >
            <Link className="w-5 h-5" />
          </button>
          <button
            type="button"
            title="Notify"
            className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            title="More"
            className="hover:bg-gray-100 p-2 rounded-full cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <button
            type="button"
            title="Close"
            className="hover:bg-gray-200 p-2 rounded-full cursor-pointer"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

    </>
  );
}
