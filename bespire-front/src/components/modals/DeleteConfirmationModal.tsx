"use client";

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemCount: number;
    isPermanent?: boolean; 
}

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    itemCount,
    isPermanent 
}: DeleteConfirmationModalProps) {

    const title = isPermanent 
        ? `Permanently delete ${itemCount} ${itemCount === 1 ? 'File' : 'Files'}?`
        : `Delete ${itemCount} ${itemCount === 1 ? 'File' : 'Files'}?`;

    const description = isPermanent
        ? "This action cannot be undone. The selected files will be deleted forever."
        : `${itemCount} ${itemCount === 1 ? 'file' : 'files'} selected will be sent to trash. You can restore it anytime from the Trash section.`;
        
    const confirmButtonText = isPermanent ? "Delete Permanently" : "Delete";

    return (
        <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
            <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            >
            <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" aria-hidden="true" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                >
                <Dialog.Panel className="relative w-full max-w-lg transform rounded-xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                    <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-6 right-6 p-1 text-black transition-colors hover:bg-gray-200 rounded-full"
                    aria-label="Close modal"
                    >
                    <X className="h-7 w-7" />
                    </button>

                    <Dialog.Title
                    as="h2"
                    className="text-2xl font-normal text-gray-900"
                    >
                    {title}
                    </Dialog.Title>

                    <div className="mt-6">
                    <p className="text-base text-gray-600">
                        {description}
                    </p>
                    </div>

                    <div className="mt-8 flex w-full space-x-4">
                    <button
                        type="button"
                        className="w-1/2 rounded-full border border-[#697d67] bg-white px-4 py-3 text-sm font-normal text-[#697d67] shadow-sm transition-colors hover:bg-gray-50"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        // The button color is now always the same green.
                        className="w-1/2 rounded-full bg-[#697d67] px-4 py-3 text-sm font-normal text-white shadow-sm transition-opacity hover:opacity-90"
                        onClick={onConfirm}
                    >
                        {confirmButtonText}
                    </button>
                    </div>
                </Dialog.Panel>
                </Transition.Child>
            </div>
            </div>
        </Dialog>
        </Transition>
    );
}