/* eslint-disable @next/next/no-img-element */
import { MockFile } from "@/data/mock-files";
import { getFileIcon } from "@/utils/getFileIcon";
import { useState, useEffect } from "react";
import TagsData from '@/data/tags.json';
import TagSelectPopover from "../ui/TagSelectPopover";
import ActionsMenu from "../ui/ActionsMenu";
import { MoreHorizontal } from "lucide-react";

interface FileListTableProps {
    files: MockFile[];
    onOpenFolder: (folderId: string) => void;
    onDelete: (fileIds: string[]) => void;
    onRename: (fileId: string, newName: string) => void;
    onAddTag: (fileId: string, tag: string) => void;
    selectedFiles: string[];
    onSelectionChange: (selectedIds: string[]) => void;
    mode: 'files' | 'trash';
    onRestore: (fileIds: string[]) => void;
    onPermanentDelete: (fileIds: string[]) => void;
}

interface MenuState {
    isOpen: boolean;
    x: number;
    y: number;
    file: MockFile | null;
}

const availableTags = TagsData.map((tag) => ({ value: tag, label: tag }));
const tableHeaders = ["Name", "Type", "Tags", "Access", "Last Modified"];

export default function FileListTable({ 
    files, onOpenFolder, onDelete, onRename, onAddTag, 
    selectedFiles, onSelectionChange, mode, onRestore, onPermanentDelete
}: FileListTableProps) {
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
    const [tempName, setTempName] = useState<string>("");
    const [menuState, setMenuState] = useState<MenuState>({ isOpen: false, x: 0, y: 0, file: null });

    const handleMenuClose = () => setMenuState({ isOpen: false, x: 0, y: 0, file: null });

    const handleMenuOpen = (event: React.MouseEvent, file: MockFile) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const menuHeight = 180;
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuY = (spaceBelow < menuHeight && rect.top > spaceBelow)
            ? rect.top - menuHeight + window.scrollY
            : rect.bottom + window.scrollY;
        setMenuState({ isOpen: true, x: rect.left - 192, y: menuY, file });
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && handleMenuClose();
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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

    const handleSelectFile = (fileId: string) => onSelectionChange(selectedFiles.includes(fileId) ? selectedFiles.filter(id => id !== fileId) : [...selectedFiles, fileId]);
    const handleSelectAll = () => onSelectionChange(selectedFiles.length > 0 ? [] : files.map(file => file.id));
    const handleStartRename = (file: MockFile) => { handleMenuClose(); setRenamingFileId(file.id); setTempName(file.name); };
    const handleCancelRename = () => setRenamingFileId(null);
    const handleConfirmRename = () => { if (renamingFileId && tempName.trim()) onRename(renamingFileId, tempName.trim()); handleCancelRename(); };

    const getMenuActions = (file: MockFile) => {
        if (mode === 'trash') {
            return {
                onRestore: () => { onRestore([file.id]); handleMenuClose(); },
                onPermanentDelete: () => { onPermanentDelete([file.id]); handleMenuClose(); }
            };
        }
        // mode === 'files'
        type FileActions = {
            onOpen: () => void; 
            onRename: () => void;
            onDelete: () => void;
            onDownload?: () => void;
        };
        const actions: FileActions = {
            onOpen: () => { handleOpen(file); handleMenuClose(); },
            onRename: () => { handleStartRename(file); },
            onDelete: () => { onDelete([file.id]); handleMenuClose(); }
        };
        if (file.type !== 'Folder') {
            actions.onDownload = () => { alert(`Downloading: ${file.name}`); handleMenuClose(); };
        }
        return actions;
    };

    return (
        <>
            {menuState.isOpen && menuState.file && (
                <>
                    <div className="fixed inset-0 z-10" onClick={handleMenuClose} />
                    <div className="fixed z-20" style={{ top: `${menuState.y}px`, left: `${menuState.x}px` }}>
                        <ActionsMenu mode={mode} {...getMenuActions(menuState.file)} />
                    </div>
                </>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-3"><div className="flex h-6 w-4 items-center justify-center"><button type="button" onClick={handleSelectAll} aria-label="Select all files" className="flex h-4 w-4 items-center justify-center">{selectedFiles.length === files.length && files.length > 0 ? <img src="/assets/icons/check_green.svg" alt="All selected" /> : selectedFiles.length > 0 && selectedFiles.length < files.length ? <img src="/assets/icons/minus_green.svg" alt="Some selected" /> : <div className="h-4 w-4 rounded-md border border-gray-300 bg-white"></div>}</button></div></th>
                            {tableHeaders.map((header) => (<th key={header} className="px-6 py-3 text-left font-medium text-gray-600"><div className="flex items-center gap-1">{header}<img src="/assets/icons/icon_filter.svg" alt="Sort" className="h-3 w-3" /></div></th>))}
                            <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {files.map((file) => {
                            const isSelected = selectedFiles.includes(file.id);
                            const isHovered = hoveredRow === file.id;
                            return (
                                <tr key={file.id} onMouseEnter={() => setHoveredRow(file.id)} onMouseLeave={() => setHoveredRow(null)} onDoubleClick={() => handleOpen(file)} className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}>
                                    <td className="px-4 py-4"><div className="flex h-6 w-4 items-center justify-center">{(isHovered || isSelected) && (<button onClick={() => handleSelectFile(file.id)} aria-label={`Select ${file.name}`} className="flex h-4 w-4 items-center justify-center">{isSelected ? <img src="/assets/icons/check_green.svg" alt="Selected" /> : <div className="h-4 w-4 rounded-md border border-gray-300 bg-white"></div>}</button>)}</div></td>
                                    <td className="whitespace-nowrap px-6 py-4"><div className="flex items-center gap-3"><img src={getFileIcon(file.icon)} alt="" className="h-6 w-6" />{renamingFileId === file.id ? (<><label htmlFor={`rename-${file.id}`} className="sr-only">Rename File</label><input id={`rename-${file.id}`} type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") handleConfirmRename();if (e.key === "Escape") handleCancelRename();}} onBlur={handleConfirmRename} onClick={(e) => e.stopPropagation()} autoFocus className="w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm" /></>) : (<span className="font-medium text-gray-900">{file.name}</span>)}</div></td>
                                    <td className="px-6 py-4 text-gray-600">{file.type}</td>
                                    <td className="px-6 py-4">{file.tags.length > 0 ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-black">{file.tags[0]}</span> : <TagSelectPopover availableTags={availableTags} onSelectTag={(tag) => onAddTag(file.id, tag)} onClose={() => {}} />}</td>
                                    <td className="px-6 py-4 text-gray-600">{file.access}</td>
                                    <td className="px-6 py-4 text-gray-600">{file.lastModified} ({file.modifiedBy})</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={(e) => handleMenuOpen(e, file)}
                                            className="inline-flex w-full justify-center rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                            aria-label={`Open actions menu for ${file.name}`}
                                            title={`Open actions menu for ${file.name}`}
                                        >
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}