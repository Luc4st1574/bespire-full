"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { mockFiles, MockFile } from "@/data/mock-files";
import { showSuccessToast } from "@/components/ui/toast";
import DashboardLayout from "../../dashboard/layout/DashboardLayout";
import FileManagerMain from "@/components/file_manager/FileManagerMain";
import PermissionGuard from "@/guards/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";

export default function TrashPage() {
    const [isClient, setIsClient] = useState(false);
    const { setIsEditorMode, setEditorFileName } = useAppContext();
    const [files, setFiles] = useState<MockFile[]>(mockFiles);
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
        // Asegurar que no estamos en modo editor
        setIsEditorMode(false);
        setEditorFileName("Trash");
    }, [setIsEditorMode, setEditorFileName]);

    const handleFolderCreated = (newFolder: MockFile) => {
        setFiles((prevFiles) => [newFolder, ...prevFiles]);
    };

    const handleDeleteFolder = (folderId: string) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== folderId));
        showSuccessToast("Folder creation undone");
    };

    const handleFilesChange = (updatedFiles: MockFile[]) => {
        setFiles(updatedFiles);
    };

    const handleRestore = (fileIdsToRestore: string[]) => {
        const updatedFiles = files.map(file =>
            fileIdsToRestore.includes(file.id) ? { ...file, isDeleted: false } : file
        );
        setFiles(updatedFiles);
        showSuccessToast(`${fileIdsToRestore.length} ${fileIdsToRestore.length === 1 ? 'file has' : 'files have'} been restored.`);
    };

    if (!isClient) {
        return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading Trash...</div></DashboardLayout>;
    }

    return (
        <PermissionGuard required={PERMISSIONS.VIEW_FILES}>
            <DashboardLayout>
                <FileManagerMain
                    files={files}
                    onFilesChange={handleFilesChange}
                    viewMode="trash"
                    setViewMode={() => {}} // No switching needed in dedicated routes
                    currentFolderId={currentFolderId}
                    setCurrentFolderId={setCurrentFolderId}
                    onFolderCreated={handleFolderCreated}
                    onDeleteFolder={handleDeleteFolder}
                    onRestore={handleRestore}
                    activeFilter="all"
                    filterMessage="Showing deleted files"
                    showFilterMessage={true}
                />
            </DashboardLayout>
        </PermissionGuard>
    );
}
