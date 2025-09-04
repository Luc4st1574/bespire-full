"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Attachment } from './types'; // Assuming types are in a shared file

interface ImageViewerProps {
    images: Attachment[];
    currentIndex: number;
    onClose: () => void;
}

export default function ImageViewer({ images, currentIndex, onClose }: ImageViewerProps) {
    const [index, setIndex] = useState(currentIndex);

    const goToPrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isFirst = index === 0;
        setIndex(isFirst ? images.length - 1 : index - 1);
    };

    const goToNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const isLast = index === images.length - 1;
        setIndex(isLast ? 0 : index + 1);
    };

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
            <button className="absolute top-5 right-5 text-white text-4xl hover:opacity-75 z-20" onClick={onClose}>&times;</button>
            
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                {images.length > 1 && (
                    <button onClick={goToPrevious} className="absolute left-5 text-white text-4xl p-2 bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 z-20">
                        &#10094;
                    </button>
                )}
                
                <div className="relative w-full h-full">
                    {images[index]?.preview && (
                            <Image 
                                src={images[index].preview!} 
                                alt="Full screen view" 
                                layout="fill" 
                                objectFit="contain" 
                            />
                    )}
                </div>

                {images.length > 1 && (
                    <button onClick={goToNext} className="absolute right-5 text-white text-4xl p-2 bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 z-20">
                        &#10095;
                    </button>
                )}
            </div>
        </div>
    );
};