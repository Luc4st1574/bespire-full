"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { Plus, Search, Edit2, UserPlus } from "lucide-react";
import CreateRequestModal from "@/components/modals/CreateRequestModal";
import SharePopover from "@/components/ui/SharePopOver";
import { useAppContext } from "@/context/AppContext";
import { PERMISSIONS } from "@/constants/permissions";
import { usePermission } from "@/hooks/usePermission";
import NotificationBell from "@/components/notifications/NotificationBell";
import ChatPreview from "@/components/chat/ChatPreview";

const Header = React.memo(() => {
  const {
    showModalRequest,
    setShowModalRequest,
    setParentId,
    isEditorMode,
    setIsEditorMode,
    editorFileName,
    setEditorFileName,
    saveDoc,
    cancelEdit,
  } = useAppContext();

  const pathname = usePathname();
  const canCreateRequest = usePermission(PERMISSIONS.CREATE_REQUESTS);
  const [isSharePopoverOpen, setSharePopoverOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const localFileNameRef = useRef("");
  const [localFileName, setLocalFileName] = useState("");

  useEffect(() => {
    if (!pathname.includes("/files") && isEditorMode) {
      setIsEditorMode(false);
      setEditorFileName("");
    }
  }, [pathname, isEditorMode, setIsEditorMode, setEditorFileName]);

  const getPageTitle = useMemo(() => {
    if (isEditorMode) return editorFileName || "Untitled";
    if (pathname === "/files") return "File Manager";
    if (pathname === "/files/folders") return "Folders";
    if (pathname === "/files/documents") return "Documents";
    if (pathname === "/files/trash") return "Trash";
    if (pathname === "/files/editor") return "Document Editor";
    if (pathname.includes("/clients")) return "Clients";
    if (pathname.includes("/requests")) return "Requests";
    if (pathname.includes("/reviews")) return "Reviews";
    if (pathname.includes("/calendar")) return "Calendar";
    if (pathname.includes("/analytics")) return "Analytics";
    if (pathname.includes("/settings")) return "Settings";
    if (pathname.includes("/chat")) return "Messages";
    return "Dashboard";
  }, [pathname, isEditorMode, editorFileName]);

  const handleStartRenaming = useCallback(() => {
    const fileName = editorFileName || "Untitled";
    setLocalFileName(fileName);
    localFileNameRef.current = fileName;
    setIsRenaming(true);
  }, [editorFileName]);

  const handleFinishRenaming = useCallback(() => {
    setIsRenaming(false);
    const finalName =
      localFileNameRef.current.trim() === ""
        ? "Untitled"
        : localFileNameRef.current.trim();
    setEditorFileName(finalName);
  }, [setEditorFileName]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleFinishRenaming();
      }
    },
    [handleFinishRenaming]
  );

  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isRenaming, handleClickOutside]);

  const renderHeaderContent = () => {
    if (isEditorMode) {
      return (
        <>
          <div className="flex items-center gap-2">
            {isRenaming ? (
              <input
                ref={inputRef}
                type="text"
                value={localFileName}
                onChange={(e) => {
                  setLocalFileName(e.target.value);
                  localFileNameRef.current = e.target.value;
                }}
                className="text-xl font-medium text-[#181B1A] bg-transparent focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFinishRenaming();
                  } else if (e.key === "Escape") {
                    setIsRenaming(false);
                  }
                }}
                title="File name"
              />
            ) : (
              <span
                className="text-xl font-medium text-[#181B1A] cursor-pointer"
                onDoubleClick={handleStartRenaming}
                title="Double-click to rename"
              >
                {editorFileName || "Untitled"}
              </span>
            )}
            <Edit2
              className="w-5 h-5 text-gray-500 fill-gray-500 cursor-pointer hover:text-gray-800 hover:fill-gray-800 ml-2"
              onClick={handleStartRenaming}
              aria-label="Rename"
            />
          </div>

          <div className="flex-grow"></div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSharePopoverOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#697D67] rounded-full hover:bg-opacity-90 transition-colors"
                title="Share"
              >
                <span>Share</span>
                <UserPlus className="w-4 h-4" />
              </button>
              <SharePopover
                isOpen={isSharePopoverOpen}
                onClose={() => setSharePopoverOpen(false)}
                fileName={editorFileName}
              />
            </div>
            <button
              onClick={saveDoc}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              Save & Close
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-transparent rounded-full hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <div className="h-6 w-px bg-gray-300 mx-1"></div>
            {/* CORRECTED SECTION */}
            <Search className="w-5 h-5 text-gray-600 cursor-pointer" />
            <ChatPreview />
            <NotificationBell />
            {/* END CORRECTED SECTION */}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="text-xl font-medium text-[#181B1A]">{getPageTitle}</div>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="green2"
            size="sm"
            onClick={() => {
              if (!canCreateRequest) {
                alert("You do not have permission to create requests.");
                return;
              }
              setShowModalRequest(true);
              setParentId(null);
            }}
          >
            <div className="flex items-center gap-2">
              <span>Create Request</span>
              <Plus className="w-4 h-4" />
            </div>
          </Button>
          <Button
            type="button"
            variant="gray"
            size="sm"
            onClick={() => console.log("clic on search")}
          >
            <div className="flex items-center gap-2">
              <span>Search</span>
              <Search className="w-4 h-4" />
            </div>
          </Button>
          <ChatPreview />
          <NotificationBell />
        </div>
      </>
    );
  };

  return (
    <header className="px-6 py-4 bg-transparent">
      <div className="flex items-center justify-between border border-[#CDEDB6] rounded-full px-6 py-2 bg-white">
        {renderHeaderContent()}
      </div>
      <CreateRequestModal
        isOpen={showModalRequest}
        onClose={() => setShowModalRequest(false)}
      />
    </header>
  );
});

Header.displayName = "Header";
export default Header;