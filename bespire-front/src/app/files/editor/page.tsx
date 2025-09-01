"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { useAppContext } from "@/context/AppContext";
import { mockFiles, MockFile } from "@/data/mock-files";
import { showSuccessToast } from "@/components/ui/toast";
import DashboardLayout from "../../dashboard/layout/DashboardLayout";
import PermissionGuard from "@/guards/PermissionGuard";
import { PERMISSIONS } from "@/constants/permissions";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const DocumentEditor = dynamic(
    () => import('@/components/file_manager/DocumentEditor'),
    {
        ssr: false, 
        loading: () => <div className="p-8 text-center text-gray-500">Loading Editor...</div>,
    }
);

export default function EditorPage() {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const { 
        setIsEditorMode, 
        editorFileName, 
        setEditorFileName, 
        setSaveDoc, 
        setCancelEdit, 
        editorTags, 
        setEditorTags 
    } = useAppContext();
    const [files, setFiles] = useLocalStorage<MockFile[]>('mockFiles', mockFiles);
    const [currentFolderId] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSaveDoc = useCallback(() => {
        if (!editorFileName.trim()) {
            alert("Document name cannot be empty.");
            return;
        }
        const finalName = editorFileName.endsWith('.docx') ? editorFileName : `${editorFileName}.docx`;
        const newDoc: MockFile = {
            id: `file_${Date.now()}_${Math.random()}`,
            parentId: currentFolderId,
            name: finalName,
            type: 'MS Word File',
            icon: finalName,
            lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', 'year': 'numeric' }),
            modifiedBy: "me",
            tags: editorTags,
            access: "All",
            isDeleted: false,
        };
        
        // Actualizar el estado local del editor
        setFiles(prevFiles => [newDoc, ...prevFiles]);
        
        // Ya no necesitamos localStorage manual - useLocalStorage lo maneja automáticamente
        
        showSuccessToast(`Document "${newDoc.name}" was created.`);
        router.push('/files'); // Navegar de vuelta a files
    }, [editorFileName, currentFolderId, setFiles, editorTags, router]);
    
    const handleCancelCreateDoc = useCallback(() => {
        router.push('/files'); // Navegar de vuelta a files
    }, [router]);

    const saveDocRef = useRef(handleSaveDoc);
    const cancelEditRef = useRef(handleCancelCreateDoc);

    useEffect(() => {
        saveDocRef.current = handleSaveDoc;
        cancelEditRef.current = handleCancelCreateDoc;
    }, [handleSaveDoc, handleCancelCreateDoc]);

    useEffect(() => {
        setIsEditorMode(true);
        setEditorFileName("Untitled Document");
        setEditorTags([]);
        setSaveDoc(() => () => saveDocRef.current());
        setCancelEdit(() => () => cancelEditRef.current());
    }, [setIsEditorMode, setEditorFileName, setSaveDoc, setCancelEdit, setEditorTags]);

    if (!isClient) {
        return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading Editor...</div></DashboardLayout>;
    }

    return (
        <PermissionGuard required={PERMISSIONS.VIEW_FILES}>
            <DashboardLayout>
                <DocumentEditor allFiles={files} currentFolderId={currentFolderId} />
            </DashboardLayout>
        </PermissionGuard>
    );
}
