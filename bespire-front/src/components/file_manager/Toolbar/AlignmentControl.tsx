"use client";

import { FC, useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import AlignLeft from "@/assets/icons/align.svg";

// --- Self-Contained Dropdown Logic ---
const Dropdown: FC<{ trigger: ReactNode; children: ReactNode; menuWidth?: string }> = ({ trigger, children, menuWidth = "w-48" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(p => !p)}>{trigger}</div>
            {isOpen && (
                <div className={`absolute top-full mt-2 bg-white rounded-md shadow-lg z-10 p-1 ${menuWidth}`}>
                    <div onClick={() => setIsOpen(false)} className="w-full">{children}</div>
                </div>
            )}
        </div>
    );
};

const DropdownMenuItem: FC<{ children: ReactNode, onClick: () => void }> = ({ children, onClick }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-gray-100 flex items-center gap-2">
        {children}
    </button>
);

// --- Component ---
export interface AlignmentControlProps {
    onFormat: (command: string, value?: string | boolean) => void;
}

export const AlignmentControl: FC<AlignmentControlProps> = ({ onFormat }) => (
    <Dropdown trigger={
        <button className="p-2 rounded hover:bg-gray-100 flex items-center text-[#697d67]" title="Alignment">
            <AlignLeft size={18} /><ChevronDown size={16} className="ml-1" />
        </button>
    } menuWidth="w-36">
        <DropdownMenuItem onClick={() => onFormat('align', false)}><AlignLeft size={18} />Left Align</DropdownMenuItem>

        <DropdownMenuItem onClick={() => onFormat('align', 'center')}><AlignCenter size={18} />Center</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('align', 'right')}><AlignRight size={18} />Right Align</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFormat('align', 'justify')}><AlignJustify size={18} />Justify</DropdownMenuItem>
    </Dropdown>
);