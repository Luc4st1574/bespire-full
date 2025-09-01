"use client";

import { FC, useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

// --- Self-Contained Dropdown Logic (Unchanged) ---
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

// --- Component (Updated) ---
export interface StyleAndFontControlsProps {
    onFormat: (command: string, value?: string | number | boolean) => void;
    currentStyle: string;
    currentFont: string;
    currentSize: string;
}

export const StyleAndFontControls: FC<StyleAndFontControlsProps> = ({ 
    onFormat,
    currentStyle,
    currentFont,
    currentSize 
}) => {
    const styleOptions = [
        { label: 'Paragraph', value: false, style: { fontSize: '1rem', fontWeight: 'normal' } },
        { label: 'Heading 1', value: 1, style: { fontSize: '2rem', fontWeight: 'bold' } },
        { label: 'Heading 2', value: 2, style: { fontSize: '1.5rem', fontWeight: 'bold' } },
        { label: 'Heading 3', value: 3, style: { fontSize: '1.25rem', fontWeight: 'bold' } },
    ];
    
    // FIX: Convert fontOptions to an array of objects.
    // 'label' is for display, 'value' is the CSS-safe name for Quill.
    const fontOptions = [
        { label: 'Arial', value: 'arial' },
        { label: 'Verdana', value: 'verdana' },
        { label: 'Times New Roman', value: 'times-new-roman' },
        { label: 'Georgia', value: 'georgia' },
        { label: 'Courier New', value: 'courier-new' },
    ];

    const sizeOptions = ['8px', '10px', '12px', '14px', '18px', '24px', '36px', '48px'];
    
    // FIX: Find the display label for the current font value. Defaults to 'Arial'.
    const currentFontLabel = fontOptions.find(f => f.value === currentFont)?.label || 'Arial';

    return (
        <>
            {/* Style Dropdown (Unchanged) */}
            <Dropdown trigger={
                <div className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-gray-100 cursor-pointer text-sm text-[#697d67]">
                    <span className="truncate">{currentStyle}</span> <ChevronDown size={16} />
                </div>
            } menuWidth="w-48">
                {styleOptions.map(option => (
                    <DropdownMenuItem key={option.label} onClick={() => onFormat('header', option.value)}>
                        <span style={option.style}>{option.label}</span>
                    </DropdownMenuItem>
                ))}
            </Dropdown>

            {/* Font Dropdown (UPDATED) */}
            <Dropdown trigger={
                <div className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-gray-100 cursor-pointer text-sm text-[#697d67]">
                    {/* Use the label for display and its real font-family for styling */}
                    <span className="truncate" style={{ fontFamily: currentFontLabel }}>{currentFontLabel}</span> <ChevronDown size={16} />
                </div>
            }>
                {fontOptions.map(o => 
                    <DropdownMenuItem key={o.value} onClick={() => onFormat('font', o.value)}>
                        {/* Use the label for the text style, as it's a valid CSS font-family name */}
                        <span style={{ fontFamily: o.label }}>{o.label}</span>
                    </DropdownMenuItem>
                )}
            </Dropdown>

            {/* Size Dropdown (Unchanged) */}
            <Dropdown trigger={
                <div className="flex items-center p-1.5 px-3 rounded-full bg-gray-100 cursor-pointer text-sm text-[#697d67]">
                    <span>{currentSize.replace('px', '')}</span><ChevronDown size={16} className="ml-1" />
                </div>
            } menuWidth="w-20">
                {sizeOptions.map(o => 
                    <DropdownMenuItem key={o} onClick={() => onFormat('size', o)}>
                        {o.replace('px', '')}
                    </DropdownMenuItem>
                )}
            </Dropdown>
        </>
    );
};