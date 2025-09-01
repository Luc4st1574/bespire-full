"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import CreateFolderModal from "../modals/CreateFolderModal";
import { MockFile } from "@/data/mock-files";
import { UploadingFilesModal, UploadingFile } from "../modals/UploadingFilesModal";
import { UploadFilesModal } from "../modals/UploadFilesModal";
import { showUploadSuccessToast } from "@/components/ui/toast";
import ProgressLink from "@/components/ui/ProgressLink";

interface FileActionButtonsProps {
  onFolderCreated: (newFolder: MockFile) => void;
  onDeleteFolder: (folderId: string) => void;
  onFilesUploaded: (uploadedFiles: File[]) => void;
  currentFolderId: string | null;
}

export default function FileActionButtons({ onFolderCreated, onDeleteFolder, onFilesUploaded, currentFolderId }: FileActionButtonsProps) {
  const [isCreateFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [isUploadFilesModalOpen, setUploadFilesModalOpen] = useState(false);
  const [isUploadingModalOpen, setIsUploadingModalOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadHasStarted, setUploadHasStarted] = useState(false);
  const intervalIdsRef = useRef<NodeJS.Timeout[]>([]);

  const createFolderAction = () => setCreateFolderModalOpen(true);
  const uploadFilesAction = () => {
    setUploadingFiles([]);
    setUploadHasStarted(false);
    setUploadFilesModalOpen(true);
  };
  
  const handleStartUpload = (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    const newFiles: UploadingFile[] = filesToUpload.map(file => ({ file, progress: 0, done: false, error: false }));
    setUploadingFiles(prev => [...prev, ...newFiles]);
    setUploadHasStarted(true);
    const uploadFile = (index: number) => {
      if (index >= newFiles.length) return;
      const interval = setInterval(() => {
        setUploadingFiles(prevFiles => {
          const fileToUpdateIndex = prevFiles.findIndex(f => f.file.name === newFiles[index].file.name && !f.done);
          if (fileToUpdateIndex === -1) {
            clearInterval(interval);
            uploadFile(index + 1);
            return prevFiles;
          }
          return prevFiles.map((file, i) => {
            if (i === fileToUpdateIndex && (file.progress || 0) < 100) {
              return { ...file, progress: (file.progress || 0) + 10 };
            } else if (i === fileToUpdateIndex && !file.done) {
              clearInterval(interval);
              uploadFile(index + 1);
              return { ...file, done: true };
            }
            return file;
          });
        });
      }, 300);
      intervalIdsRef.current.push(interval);
    };
    uploadFile(0);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleMinimizeToToast = () => {
    setUploadFilesModalOpen(false);
    setIsUploadingModalOpen(true);
  };

  const handleUploadModalClose = () => {
    const allFinished = uploadingFiles.length > 0 && uploadingFiles.every(f => f.done || f.error);
    if (allFinished) {
      if (uploadHasStarted) {
        const doneFiles = uploadingFiles.filter(f => f.done);
        if (doneFiles.length > 0) {
          showUploadSuccessToast(doneFiles.length);
          onFilesUploaded(doneFiles.map(f => f.file));
        }
      }
    } else {
      intervalIdsRef.current.forEach(clearInterval);
    }
    intervalIdsRef.current = [];
    setUploadFilesModalOpen(false);
    setUploadingFiles([]);
    setUploadHasStarted(false);
  };

  const handleProgressModalClose = () => {
    const doneFiles = uploadingFiles.filter(f => f.done);
    if (doneFiles.length > 0) {
      showUploadSuccessToast(doneFiles.length);
      onFilesUploaded(doneFiles.map(f => f.file));
    }
    intervalIdsRef.current.forEach(clearInterval);
    intervalIdsRef.current = [];
    setIsUploadingModalOpen(false);
    setUploadingFiles([]);
    setUploadHasStarted(false);
  };

  return (
    <>
      <section>
        <h2 className="text-xl font-medium mb-4">Get Started</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <button type="button" onClick={createFolderAction} className="w-56 bg-white px-3 py-5 border border-gray-200 rounded-md flex flex-col items-start gap-2 text-left hover:bg-gray-50 transition-colors">
            <Image src="/assets/icons/folders.svg" alt="Create Folder" width={24} height={24} className="w-6 h-6" />
            <span className="font-medium text-gray-800 text-sm">Create Folder</span>
          </button>
          <button type="button" onClick={uploadFilesAction} className="w-56 bg-white px-3 py-5 border border-gray-200 rounded-md flex flex-col items-start gap-2 text-left hover:bg-gray-50 transition-colors">
            <Image src="/assets/icons/files.svg" alt="Upload Files" width={24} height={24} className="w-6 h-6" />
            <span className="font-medium text-gray-800 text-sm">Upload Files</span>
          </button>
          <ProgressLink 
            href="/files/editor" 
            className="w-56 bg-white px-3 py-5 border border-gray-200 rounded-md flex flex-col items-start gap-2 text-left hover:bg-gray-50 transition-colors"
          >
            <Image src="/assets/icons/docs.svg" alt="Create a Doc" width={24} height={24} className="w-6 h-6" />
            <span className="font-medium text-gray-800 text-sm">Create a Doc</span>
          </ProgressLink>
        </div>
      </section>

      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        onCreateFolder={onFolderCreated}
        onDeleteFolder={onDeleteFolder}
        currentFolderId={currentFolderId} 
      />
      <UploadFilesModal
        open={isUploadFilesModalOpen}
        onClose={handleUploadModalClose}
        onUpload={handleStartUpload}
        onMinimize={handleMinimizeToToast}
        uploadingFiles={uploadingFiles}
        uploadHasStarted={uploadHasStarted}
        onRemoveFile={handleRemoveFile}
      />
      <UploadingFilesModal
        files={uploadingFiles}
        open={isUploadingModalOpen}
        onRemove={handleRemoveFile}
        onClose={handleProgressModalClose}
        onUploadMore={() => {
          setIsUploadingModalOpen(false);
          setUploadFilesModalOpen(true);
        }}
      />
    </>
  );
}