/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AttachmentsBlock.tsx
import AttachmentList from "../for_mocks/AttachmentList";
import { useFiles } from "@/hooks/useFiles";
import FileUploaderStateless from "./FileUploaderStateless";

export default function AttachmentsBlock({
  linkedToId,
  linkedToType = "request",
  onChange,
  disabled = false,
}: {
  linkedToId: string;
  linkedToType?: string;
  onChange?: (files: any[]) => void;
  disabled?: boolean;
}) {
  const { files, loading, addFile, removeFile } = useFiles({
    linkedToId,
    linkedToType,
  });

  // Cuando subes, lo registras en la colección usando addFile
  const handleUpload = async (uploadedFiles: any) => {
    // Solo los que tengan URL lista
    for (const f of uploadedFiles) {
      if (!f.done || !f.url) continue;
      await addFile({
        name: f.file.name,
        type: "file",
        url: f.url,
        ext: f.file.name.split(".").pop() || "",
        size: f.file.size,
        linkedToId,
        linkedToType,
      });
    }
  };

  // Elimina usando removeFile
  const handleRemove = async (idx: number) => {
    console.log("Removing file at index:", idx);
    const file = files[idx];
    if (!file) return;
    await removeFile(file.id);
  };

  // Llama onChange al padre si necesitas notificar
  // (puedes hacer un useEffect sobre files)

  return (
    <section className="flex flex-col gap-2">
      <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
        <FileUploaderStateless
          key={`uploader-attachments-${linkedToId}`}
          inline 
          showLabel 
          label="Files" 
          buttonLabel="Add +" 
          onChange={handleUpload} 
        />
      </div>
      <AttachmentList files={files} onRemove={handleRemove} />
      {loading && (
        <div className="text-xs text-gray-400 mt-2">Cargando archivos...</div>
      )}
    </section>
  );
}
