/* eslint-disable @next/next/no-img-element */
import { MockFile } from "@/data/mock-files";
import { getFileIcon } from "@/utils/getFileIcon";
import { useState, useEffect } from "react";
import ActionsMenu from "../ui/ActionsMenu";
import { MoreHorizontal } from "lucide-react";

interface FileGridProps {
    files: MockFile[];
    onOpenFolder: (folderId: string) => void;
    onDelete: (fileIds: string[]) => void;
    onRename: (fileId: string, newName: string) => void;
    selectedFiles: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    mode: 'files' | 'trash';
    onRestore: (fileIds: string[]) => void;
    onPermanentDelete: (fileIds: string[]) => void;
}

export default function FileGrid({ 
    files, onOpenFolder, onDelete, onRename, selectedFiles, 
    onSelectionChange, mode, onRestore, onPermanentDelete
}: FileGridProps) {
    const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
    const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
    const [tempName, setTempName] = useState<string>("");
    const [openMenuFileId, setOpenMenuFileId] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuFileId(null);
        if (openMenuFileId) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuFileId]);

    const handleToggleMenu = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        setOpenMenuFileId(p => p === fileId ? null : fileId);
    };

    const handleSelectFile = (fileId: string) => {
        const newSelection = selectedFiles.includes(fileId) ? selectedFiles.filter(id => id !== fileId) : [...selectedFiles, fileId];
        onSelectionChange(newSelection);
    };

    const handleOpen = (file: MockFile) => {
        if (mode === 'trash') {
            return;
        }
        if (file.type === 'Folder') {
            onOpenFolder(file.id);
        } else {
            alert(`Opening file: ${file.name}`);
        }
    };

    const handleStartRename = (file: MockFile) => {
        setRenamingFileId(file.id);
        setTempName(file.name);
    };

    const handleCancelRename = () => {
        setRenamingFileId(null);
        setTempName("");
    };

    const handleConfirmRename = () => {
        if (renamingFileId && tempName.trim()) {
            onRename(renamingFileId, tempName.trim());
        }
        handleCancelRename();
    };

    type FileActions = {
        onOpen?: () => void;
        onRename?: () => void;
        onDelete?: () => void;
        onDownload?: () => void;
        onRestore?: () => void;
        onPermanentDelete?: () => void;
    };

    const getMenuActions = (file: MockFile): FileActions => {
        if (mode === 'trash') {
            return {
                onRestore: () => { onRestore([file.id]); setOpenMenuFileId(null); },
                onPermanentDelete: () => { onPermanentDelete([file.id]); setOpenMenuFileId(null); }
            };
        }
        // mode === 'files'
        const actions: FileActions = {
            onOpen: () => { handleOpen(file); setOpenMenuFileId(null); },
            onRename: () => { handleStartRename(file); setOpenMenuFileId(null); },
            onDelete: () => { onDelete([file.id]); setOpenMenuFileId(null); }
        };
        if (file.type !== 'Folder') {
            actions.onDownload = () => { alert(`Downloading ${file.name}`); setOpenMenuFileId(null); };
        }
        return actions;
    };

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {files.map((file) => {
                const isSelected = selectedFiles.includes(file.id);
                const isHovered = hoveredFileId === file.id;
                return (
                    <div
                        key={file.id}
                        onMouseEnter={() => setHoveredFileId(file.id)}
                        onMouseLeave={() => setHoveredFileId(null)}
                        onDoubleClick={() => handleOpen(file)}
                        className={`relative rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                            isSelected ? "bg-blue-50" : "bg-transparent hover:bg-gray-50"
                        }`}
                    >
                        <div className="absolute left-2 top-2 z-10">
                            {(isHovered || isSelected) && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSelectFile(file.id); }}
                                    aria-label={`Select ${file.name}`}
                                    className="flex h-4 w-4 items-center justify-center"
                                >
                                    {isSelected ? (
                                        <img src="/assets/icons/check_green.svg" alt="Selected" className="h-full w-full" />
                                    ) : (
                                        <div className="h-4 w-4 rounded-md border border-gray-300 bg-white"></div>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="pt-4">
                            <div className="mb-4 flex justify-center">
                                <img src={getFileIcon(file.icon)} alt="" className="h-16 w-16" />
                            </div>
                            <div className="text-center">
                                {renamingFileId === file.id ? (
                                    <>
                                        <label htmlFor={`rename-grid-${file.id}`} className="sr-only">Rename File</label>
                                        <input
                                            id={`rename-grid-${file.id}`} type="text" value={tempName} onChange={(e) => setTempName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleConfirmRename();
                                                if (e.key === "Escape") handleCancelRename();
                                            }}
                                            onBlur={handleConfirmRename} onClick={(e) => e.stopPropagation()} autoFocus
                                            className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm shadow-sm"
                                        />
                                    </>
                                ) : (
                                    <p className="truncate font-medium text-gray-900">{file.name}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">{file.lastModified}</p>
                            </div>
                        </div>

                        <div className="absolute right-1 top-1 z-20">
                            {(isHovered || isSelected || openMenuFileId === file.id) && (
                                <button
                                    type="button"
                                    aria-label="Open actions menu"
                                    onClick={(e) => handleToggleMenu(e, file.id)}
                                    className="rounded-md p-1 text-gray-500 hover:bg-gray-200"
                                >
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            )}

                            {openMenuFileId === file.id && (
                                <div className="absolute right-0 mt-1" onClick={(e) => e.stopPropagation()}>
                                    <ActionsMenu mode={mode} {...getMenuActions(file)} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}