"use client";

import { FC, useState, useRef, useEffect, ReactNode } from "react";
import { Image as ImageIcon, Check } from "lucide-react";
import Link from "@/assets/icons/link.svg";
import Code2 from "@/assets/icons/html.svg";

// --- No changes to the Dropdown component ---
interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode | (({ close }: { close: () => void }) => ReactNode);
    menuWidth?: string;
}

const Dropdown: FC<DropdownProps> = ({ trigger, children, menuWidth = "w-auto" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(p => !p)}>{trigger}</div>
            {isOpen && (
                <div className={`absolute z-10 top-full mt-2 -translate-x-1/2 left-1/2 transform ${menuWidth}`}>
                    {typeof children === 'function' 
                        ? children({ close: () => setIsOpen(false) }) 
                        : children
                    }
                </div>
            )}
        </div>
    );
};

// --- 1. Create a dedicated component for the popover ---
// This component can now correctly use Hooks at its top level.
interface LinkInputPopoverProps {
    onInsertLink: (url: string) => void;
    close: () => void;
}

const LinkInputPopover: FC<LinkInputPopoverProps> = ({ onInsertLink, close }) => {
    const [linkUrl, setLinkUrl] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // This hook now correctly lives at the top level of a function component.
    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, []);

    const handleConfirm = () => {
        if (linkUrl.trim()) {
            onInsertLink(linkUrl);
            setLinkUrl('');
            close();
        }
    };

    return (
        <div 
            data-no-prevent-default
            className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 border border-gray-200"
        >
            <input
                ref={inputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-0 focus:outline-none sm:text-sm"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirm();
                    }
                }}
            />
            <button
                type="button"
                onClick={handleConfirm}
                className="p-2 rounded bg-[#697d67] text-white hover:opacity-90 disabled:opacity-50"
                disabled={!linkUrl.trim()}
                title="Insert Link"
            >
                <Check size={18} />
            </button>
        </div>
    );
};


// --- 2. Update InsertControls to use the new component ---
export interface InsertControlsProps {
    onInsertLink: (url:string) => void;
    onImageClick: () => void;
    onCodeBlockClick: () => void;
}

export const InsertControls: FC<InsertControlsProps> = ({ 
    onInsertLink,
    onImageClick, 
    onCodeBlockClick 
}) => {
    return (
        <>
            <Dropdown trigger={
                <button className="p-2 rounded hover:bg-gray-100 text-[#697d67]" title="Insert Link">
                    <Link size={18} />
                </button>
            } menuWidth="w-72">
                {({ close }) => (
                    // 3. Render the new component here, passing the required props.
                    <LinkInputPopover onInsertLink={onInsertLink} close={close} />
                )}
            </Dropdown>

            <button onClick={onImageClick} className="p-2 rounded hover:bg-gray-100 text-[#697d67]" title="Insert Image">
                <ImageIcon size={18} />
            </button>
            <button onClick={onCodeBlockClick} className="p-2 rounded hover:bg-gray-100 text-[#697d67]" title="Code Block">
                <Code2 size={18} />
            </button>
        </>
    );
};