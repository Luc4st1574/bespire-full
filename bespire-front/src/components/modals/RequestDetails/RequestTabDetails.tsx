/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useComments } from "@/hooks/useComments";
import CommentInputBar from "../../comments/CommentInputBar";
import CommentsList from "../../comments/CommentsList";
import React, { useEffect,  useState } from "react";
import AttachmentsBlock from "../../inputs/AttachmentsBlock";
import LinksBlock from "../../form/LinksBlock";
import { showErrorToast } from "@/components/ui/toast";
import { useRequestDetail } from "@/hooks/useRequestDetail";
import { useAppContext } from "@/context/AppContext";
import { useRequestContext } from "@/context/RequestContext";
import { isAdminLike } from "@/utils/utils";
import EditableDescription from "@/components/ui/EditableDescription";

export default function RequestTabDetails({
  request,
  isAtBottom = false,
  scrollToEnd,
}: {
  request: any;
  isAtBottom?: boolean;
  scrollToEnd?: () => void;
}) {
  // 1. Estado local para lista de comentarios (inicial con request.comments)
  const [comments, setComments] = useState(request.comments || []);

  // 2. Usa el hook para tener data viva desde backend
  const {
    comments: fetchedComments,
    loading,
    addComment,
  } = useComments(request.id);

  // 3. Cuando fetchedComments cambia (ej: después de crear un comment), actualiza la lista
  useEffect(() => {
    if (fetchedComments && fetchedComments.length > 0) {
      setComments(fetchedComments);
    }
  }, [fetchedComments]);

  // 4. Función para crear comentario
  const handleCommentSubmit = async (editorState:any, html:any, clear:any) => {
    console.log("Submitting comment... clearEditor", html);
    try {
      // Envía SOLO el html o el texto plano, depende de tu backend.
      await addComment(html);
      clear();
    } catch (e) {
      // Mostrar error, toast, etc.
      // No limpies el editor si hay error
      console.error(e);
      const errorMessage = (e instanceof Error && e.message) ? e.message : "Error to add comment";
      showErrorToast(errorMessage);
    }
  };

  const { updateFields, loadingUpdate } = useRequestDetail(request.id);
  const { role } = useAppContext();
  const { isBlocked } = useRequestContext();
  const canEdit = isAdminLike(role || "");

  return (
    <div>
      <div className="text-base px-6 flex flex-col gap-4 ">
        <section className="flex flex-col gap-2">
          <div className="text-base  font-medium text-[#5E6B66]">
            Description
          </div>
            <EditableDescription
              value={request.details}
              onSave={(newValue) => {
                if (newValue !== request.details) {
                  updateFields({ details: newValue });
                }
              }}
              loading={loadingUpdate}
              canEdit={canEdit}
            />
        </section>
        {/* Links (Preview Only) */}

        <LinksBlock 
          linkedToId={request.id} 
          linkedToType="request" 
          disabled={isBlocked}
        />

        {/* Subtasks  */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-medium text-[#5E6B66]">Subtasks</label>
            <button
              type="button"
              className={`text-xs text-[#758C5D] mt-1 px-2 py-1 rounded border border-[#758C5D] hover:bg-[#F1F3EE] ${
                isBlocked ? 'opacity-50 pointer-events-none' : ''
              }`}
              disabled={isBlocked}
            >
              Add +
            </button>
          </div>
        </section>

        {/* Attachments (Placeholder) */}
        <AttachmentsBlock 
          linkedToId={request.id} 
          linkedToType="request" 
          disabled={isBlocked}
        />

        <section>
          {/* Comments title y view all, sticky */}

          <CommentsList comments={comments} />
        </section>
      </div>

      {/* Sticky Comment Input */}
      <div
        className={
          "transition-all " +
          (!isAtBottom
            ? "sticky bottom-0 bg-white z-20 shadow-[0_-2px_12px_0px_rgba(0,0,0,0.03)]"
            : "")
        }
        style={{
          borderTop: !isAtBottom ? "1px solid #f2f4f3" : undefined,
        }}
      >
        <CommentInputBar
          onSubmit={handleCommentSubmit}
          userAvatar="/assets/avatars/avatar1.svg"
          scrollToEnd={scrollToEnd}
          disabled={isBlocked}
          commentCount={
            request.comments.filter((c: any) => c.type === "comment").length
          }
        />
      </div>
    </div>
  );
}
