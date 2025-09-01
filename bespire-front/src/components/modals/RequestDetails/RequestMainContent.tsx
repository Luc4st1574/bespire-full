/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import RequestMainHeader from "./RequestMainHeader";
import RequestTabs from "./RequestTabs";
import RequestTabDetails from "./RequestTabDetails";
import RequestTabFiles from "./RequestTabFiles";
import RequestTabSubtasks from "./RequestTabSubtasks";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/context/AppContext";



interface RequestMainContentProps {
  request: any;
  onClose: () => void;
  onBackToMain: () => void;
  onOpenSubtask: (subtaskId: string) => void;
  parentRequest?: any
  onSeeReview: () => void;
  loadingStatus: boolean;
  changeStatus: (status: string) => void;
  status: string;
}

export default function RequestMainContent({
  request,
  onClose,
  onBackToMain,
  onOpenSubtask,
  parentRequest,
  onSeeReview,
  loadingStatus,
  changeStatus,
  status,
}: RequestMainContentProps) {
  const { role } = useAppContext();
  const [activeTab, setActiveTab] = useState<"details" | "files" | "subtasks">(
    "details"
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  // Detectar si estamos en el fondo del scroll
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      // “pegado abajo” si faltan menos de 8px para el fondo
      setIsAtBottom(
        container.scrollHeight - container.scrollTop - container.clientHeight <
          8
      );
    };
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToEnd = () => {
    console.log("Scrolling to end");
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    } else {
      console.warn("Scroll container not found");
    }
  };
  // ¿Es subtask?
  const isSubtask = !!request.parentRequest;

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-6 flex flex-col ">
        {/* Header con migas si es subtask */}
        <RequestMainHeader
          status={status}
          title={request.title}
          requestId={request.id}
          //@ts-ignore
          role={role}
          onClose={onClose}
          parentRequest={request.parentRequest}
          onBackToMain={onBackToMain}
          parentRequestTitle={parentRequest?.title || "Main Request"}
          onSeeReview={onSeeReview}
          loadingStatus={loadingStatus}
          changeStatus={changeStatus}
        />

        {/* Tabs */}
        <RequestTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showSubtasks={!isSubtask} // Solo muestra subtasks si NO es subtask
        />
      </div>
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {activeTab === "details" && (
          <RequestTabDetails
            request={request}
            scrollToEnd={scrollToEnd}
            isAtBottom={isAtBottom}
          />
        )}
        {activeTab === "files" && <RequestTabFiles request={request} />}
        {activeTab === "subtasks" && <RequestTabSubtasks request={request} onOpenSubtask={onOpenSubtask}
        //@ts-ignore
        onClose={onClose} />}
      </div>
    </div>
  );
}
