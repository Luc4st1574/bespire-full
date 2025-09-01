"use client";

import { FC, useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Baseline } from "lucide-react";
import Bold from "@/assets/icons/icon_bold.svg";
import Italic from "@/assets/icons/italic.svg";
import Underline from "@/assets/icons/underline.svg";
import Strikethrough from "@/assets/icons/strikethrough.svg";
import ColorPickerGrid from "../../ui/ColorPickerGrid";

// --- Self-Contained Dropdown Logic (No changes here) ---
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

// --- Component ---
export interface FormattingControlsProps {
    onFormat: (command: string, value?: string | boolean) => void; // Allow boolean for value
    activeStyles: {
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strike?: boolean;
    };
}

export const FormattingControls: FC<FormattingControlsProps> = ({ onFormat, activeStyles }) => (
    <>
        <button onClick={() => onFormat('bold', !activeStyles.bold)} className={`p-2 rounded hover:bg-gray-100 text-[#697d67] ${activeStyles.bold ? 'bg-gray-200' : ''}`} title="Bold">
            <Bold size={18} className="pointer-events-none" />
        </button>
        
        <button onClick={() => onFormat('italic', !activeStyles.italic)} className={`p-2 rounded hover:bg-gray-100 text-[#697d67] ${activeStyles.italic ? 'bg-gray-200' : ''}`} title="Italic">
            <Italic size={18} className="pointer-events-none" />
        </button>

        <button onClick={() => onFormat('underline', !activeStyles.underline)} className={`p-2 rounded hover:bg-gray-100 text-[#697d67] ${activeStyles.underline ? 'bg-gray-200' : ''}`} title="Underline">
            <Underline size={18} className="pointer-events-none" />
        </button>

        <button onClick={() => onFormat('strike', !activeStyles.strike)} className={`p-2 rounded hover:bg-gray-100 text-[#697d67] ${activeStyles.strike ? 'bg-gray-200' : ''}`} title="Strikethrough">
            <Strikethrough size={18} className="pointer-events-none" />
        </button>

        <Dropdown trigger={
            <button className="p-2 rounded hover:bg-gray-100 flex items-center text-[#697d67]" title="Text color">
                <Baseline size={18} /> <ChevronDown size={16} className="ml-1" />
            </button>
        } menuWidth="w-36">
            <ColorPickerGrid onSelectColor={(color) => onFormat('color', color)} />
        </Dropdown>
    </>
);