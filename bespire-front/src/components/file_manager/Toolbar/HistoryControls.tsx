"use client";

import { FC } from "react";
import Undo2 from "@/assets/icons/undo.svg";
import Redo2 from "@/assets/icons/redo.svg";

export interface HistoryControlsProps {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export const HistoryControls: FC<HistoryControlsProps> = ({ undo, redo, canUndo, canRedo }) => (
    <>
        <button onClick={undo} disabled={!canUndo} className="p-2 rounded hover:bg-gray-100 text-[#697d67] disabled:opacity-50 disabled:cursor-not-allowed" title="Undo">
            <Undo2 size={18} />
        </button>
        <button onClick={redo} disabled={!canRedo} className="p-2 rounded hover:bg-gray-100 text-[#697d67] disabled:opacity-50 disabled:cursor-not-allowed" title="Redo">
            <Redo2 size={18} />
        </button>
    </>
);