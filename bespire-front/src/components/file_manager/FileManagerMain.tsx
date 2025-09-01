"use client";

import { useMemo } from "react";
import { MockFile } from "@/data/mock-files";
import AllFilesSection from "./AllFilesSection";
import FileActionButtons from "./FileActionButtons";

// Helper function can stay here
const mapFilesToMockFiles = (uploadedFiles: File[], parentId: string | null): MockFile[] => {
    // ... function implementation is unchanged
    return uploadedFiles.map(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        let fileType: MockFile['type'] = 'PDF File';
        switch (extension) {
            case 'pptx': fileType = 'MS Powerpoint File'; break;
            case 'docx': fileType = 'MS Word File'; break;
            case 'xlsx': fileType = 'MS Excel Sheet'; break;
        }
    return {
        id: `file_${Date.now()}_${Math.random()}`,
        parentId: parentId,
        name: file.name,
        type: fileType,
        lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        modifiedBy: "me",
        tags: [],
        access: "Private",
        icon: file.name,
        isDeleted: false,
        };
    });
};

interface FileManagerMainProps {
    files: MockFile[];
    onFilesChange: (files: MockFile[]) => void;
    onFolderCreated: (newFolder: MockFile) => void;
    onDeleteFolder: (folderId: string) => void;
    onRestore: (fileIds: string[]) => void;
    filterMessage: string | null;
    showFilterMessage: boolean;
    activeFilter: string;
    setViewMode: (mode: 'files' | 'trash') => void;
    viewMode: 'files' | 'trash';
    currentFolderId: string | null;
    setCurrentFolderId: (id: string | null) => void;
}

// THIS COMPONENT IS NOW MUCH SIMPLER
export default function FileManagerMain({
    files,
    onFilesChange,
    onFolderCreated,
    onDeleteFolder,
    onRestore,
    filterMessage,
    showFilterMessage,
    activeFilter,
    setViewMode,
    viewMode,
    currentFolderId,
    setCurrentFolderId,
}: FileManagerMainProps) {

    // ALL useAppContext and useEffect LOGIC HAS BEEN REMOVED FROM HERE

    const handleNavigate = (folderId: string | null) => {
        setCurrentFolderId(folderId);
    };

    const onRenameFile = (fileId: string, newName: string) => {
        const updatedFiles = files.map((file) =>
            file.id === fileId ? { ...file, name: newName } : file
        );
        onFilesChange(updatedFiles);
    };
    
    const onAddTagToFile = (fileId: string, tag: string) => {
        const updatedFiles = files.map((file) =>
            file.id === fileId ? { ...file, tags: [tag] } : file
        );
        onFilesChange(updatedFiles);
    };

    const onFilesUploaded = (uploadedFiles: File[]) => {
        const newMockFiles = mapFilesToMockFiles(uploadedFiles, currentFolderId);
        onFilesChange([...newMockFiles, ...files]);
    };
    
    const onDeleteFile = (fileIds: string[]) => {
        const updatedFiles = files.map(file =>
            fileIds.includes(file.id) ? { ...file, isDeleted: true, parentId: null } : file
        );
        onFilesChange(updatedFiles);
    };
    
    const onRestoreFile = (fileIds: string[]) => {
        onRestore(fileIds);
    };

    const onPermanentDeleteFile = (fileIds: string[]) => {
        const updatedFiles = files.filter(file => !fileIds.includes(file.id));
        onFilesChange(updatedFiles);
    };

    const handleGoToTrash = () => setViewMode('trash');
    const handleShowAllFiles = () => setViewMode('files');
    
    const filteredFiles = useMemo(() => {
        if (viewMode === 'trash') {
            return files.filter(file => file.isDeleted);
        }
        const filesInCurrentView = files.filter(
            (file) => !file.isDeleted && file.parentId === currentFolderId
        );
        if (activeFilter === "all" || !activeFilter) {
            return filesInCurrentView;
        }
        return filesInCurrentView.filter(file => {
            const fileType = file.type.toLowerCase();
            if (activeFilter === "folders") return fileType === "folder";
            if (activeFilter === "files") return ["ms powerpoint file", "pdf file", "ms word file", "ms excel sheet"].includes(fileType);
            if (activeFilter === "documents") return ["ms word file"].includes(fileType);
            return false;
        });
    }, [files, activeFilter, currentFolderId, viewMode]);

    return (
        <div className="flex flex-col gap-8">
            <FileActionButtons
                onFolderCreated={onFolderCreated}
                onDeleteFolder={onDeleteFolder}
                onFilesUploaded={onFilesUploaded}
                currentFolderId={currentFolderId}
            />
            <AllFilesSection
                files={filteredFiles}
                allFiles={files}
                filterMessage={filterMessage}
                showFilterMessage={showFilterMessage}
                currentFolderId={currentFolderId}
                onNavigate={handleNavigate}
                onDelete={onDeleteFile}
                onRename={onRenameFile}
                onAddTag={onAddTagToFile}
                onRestore={onRestoreFile}
                mode={viewMode}
                onGoToTrash={handleGoToTrash}
                onPermanentDelete={onPermanentDeleteFile}
                onShowAllFiles={handleShowAllFiles}
            />
        </div>
    );
}