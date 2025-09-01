"use client";

import { FC } from "react";
import Indent from "@/assets/icons/Indent.svg";
import Outdent from "@/assets/icons/Outdent.svg";
import Updown from "@/assets/icons/updown.svg";

export interface IndentationControlsProps {
    onFormat: (command: string, value: string | boolean) => void;
    isChecklist: boolean;
}

export const IndentationControls: FC<IndentationControlsProps> = ({ onFormat, isChecklist }) => (
    <>
        {/* Checklist Button using your Updown icon */}
        <button
            onClick={() => onFormat('list', isChecklist ? false : 'unchecked')}
            className={`p-2 rounded hover:bg-gray-200 ${isChecklist ? 'bg-gray-200 text-blue-600' : 'text-[#697d67]'}`}
            title="Checklist"
        >
            <Updown size={18} />
        </button>

        {/* Decrease Indent Button using your Outdent icon */}
        <button 
            onClick={() => onFormat('indent', '-1')} 
            className="p-2 rounded hover:bg-gray-100 text-[#697d67]" 
            title="Decrease Indent"
        >
            <Outdent size={18} />
        </button>

        {/* Increase Indent Button using your Indent icon */}
        <button 
            onClick={() => onFormat('indent', '+1')} 
            className="p-2 rounded hover:bg-gray-100 text-[#697d67]" 
            title="Increase Indent"
        >
            <Indent size={18} />
        </button>
    </>
);