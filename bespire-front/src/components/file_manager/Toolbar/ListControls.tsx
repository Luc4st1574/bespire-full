"use client";

import { FC } from "react";
import { List, ListOrdered } from "lucide-react";

// --- Component ---
export interface ListControlsProps {
    onFormat: (command: string, value?: string | boolean) => void;
    // Add a prop to receive the active list style
    activeList: 'ordered' | 'bullet' | null;
}

export const ListControls: FC<ListControlsProps> = ({ onFormat, activeList }) => {
    
    // This function now handles toggling the list format
    const handleList = (listType: 'ordered' | 'bullet') => {
        // If the clicked list type is already active, turn it off.
        // Otherwise, apply the new list type.
        const value = activeList === listType ? false : listType;
        onFormat('list', value);
    };

    return (
        <>
            {/* Numbered list button */}
            <button
                onClick={() => handleList('ordered')}
                // Apply a background color if this list type is active
                className={`p-2 rounded hover:bg-gray-200 ${activeList === 'ordered' ? 'bg-gray-200 text-blue-600' : 'text-[#697d67]'}`}
                title="Numbered List"
            >
                <ListOrdered size={18} />
            </button>

            {/* Bulleted list button */}
            <button
                onClick={() => handleList('bullet')}
                // Apply a background color if this list type is active
                className={`p-2 rounded hover:bg-gray-200 ${activeList === 'bullet' ? 'bg-gray-200 text-blue-600' : 'text-[#697d67]'}`}
                title="Bulleted List"
            >
                <List size={18} />
            </button>
        </>
    );
};