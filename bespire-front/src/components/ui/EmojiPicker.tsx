import React, { useRef, useEffect, useState } from 'react';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    isOpen: boolean;
    onClose: () => void;
    buttonRef?: React.RefObject<HTMLButtonElement | null>; // <-- FIX: Type updated to allow null
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, isOpen, onClose, buttonRef }) => {
    const pickerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const emojiCategories = {
        faces: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
        gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️'],
        hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
        nature: ['🌟', '⭐', '🌙', '☀️', '⛅', '🌈', '🔥', '💧', '⚡', '❄️', '🌸', '🌺', '🌻', '🌷', '🌹', '🍀'],
        objects: ['💯', '💢', '💥', '💫', '💦', '💨', '🕐', '⏰', '⏱️', '📱', '💻', '📝', '📚', '🎉', '🎊', '🎈']
    };

    useEffect(() => {
        if (isOpen && buttonRef?.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: buttonRect.bottom - 220,
                left: buttonRect.left
            });
        }
    }, [isOpen, buttonRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            ref={pickerRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-3"
            style={{ 
                width: '280px', 
                maxHeight: '200px', 
                overflowY: 'auto',
                zIndex: 9999,
                top: `${position.top}px`,
                left: `${position.left}px`
            }}
        >
            {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-2">
                    <div className="text-xs font-medium text-gray-500 mb-1 capitalize">
                        {category}
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji, index) => (
                            <button
                                key={`${category}-${index}`}
                                onClick={() => {
                                    onEmojiSelect(emoji);
                                }}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-lg transition-colors"
                                title={emoji}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EmojiPicker;