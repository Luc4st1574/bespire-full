"use client";

import React from 'react';
import { toast } from 'sonner';
import { X, Check } from 'lucide-react';

interface EventCreatedToastProps {
    toastId: string | number;
    onReview: () => void;
}

export default function EventCreatedToast({ toastId, onReview }: EventCreatedToastProps) {
    const handleReviewClick = () => {
        onReview();
        toast.dismiss(toastId);
    };
    
    return (
        <div className="flex w-full max-w-sm items-center justify-between gap-4 rounded-xl border border-[#E2E6E4] bg-[#F1F3EE] px-4 py-3 text-base">
            <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#697d67] p-1.5">
                    <Check className="h-4 w-4 text-white" />
                </div>
                <p className="font-medium text-[#181B1A]">Event created</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleReviewClick} className="transform rounded-full bg-[#697d67] px-3 py-1.5 text-sm font-light text-white transition-all hover:bg-opacity-90" title="Review Event">
                    Review
                </button>
                <div className="h-4 w-px bg-gray-300" />
                <button onClick={() => toast.dismiss(toastId)} className="transform rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-200 hover:text-black" title="Close notification">
                    <X className="h-10 w-10" />
                </button>
            </div>
        </div>
    );
};