import React from 'react';
import { X, Check } from 'lucide-react';

interface FilesDeletedToastProps {
    count: number;
    onUndo: () => void;
    onGoToTrash: () => void;
    onClose: () => void; // ADDED: A prop for the close action
}

const FilesDeletedToast: React.FC<FilesDeletedToastProps> = ({
    count,
    onUndo,
    onGoToTrash,
    onClose, // CHANGED
    }) => {
    const message = `${count} File${count !== 1 ? 's' : ''} Deleted`;

    return (
        <div className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#E2E6E4] bg-[#F1F3EE] px-4 py-3 text-base" style={{ minWidth: '420px' }}>
        <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#697d67] p-1.5">
            <Check className="h-4 w-4 text-white" />
            </div>
            <p className="font-medium text-[#181A1A]">{message}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
            <button
            type="button"
            onClick={onUndo} // CHANGED
            className="transform whitespace-nowrap rounded-full bg-[#697d67] px-4 py-1.5 text-sm font-light text-white transition-all hover:bg-opacity-90"
            title="Undo"
            >
            Undo
            </button>
            <button
            type="button"
            onClick={onGoToTrash} // CHANGED
            className="transform whitespace-nowrap rounded-full border border-[#697d67] bg-transparent px-5 py-1.5 text-sm font-light text-[#697d67] transition-all hover:bg-[#697d67]/10"
            title="Go to Trash"
            >
            Go to Trash
            </button>
            <div className="h-4 w-px bg-gray-300" />
            
            <button
            type="button"
            onClick={onClose} // CHANGED
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-black"
            title="Close notification"
            >
            <X className="h-5 w-5" />
            </button>
        </div>
        </div>
    );
};

export default FilesDeletedToast;