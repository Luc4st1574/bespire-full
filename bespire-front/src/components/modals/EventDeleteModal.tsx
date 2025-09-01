"use client";

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface EventDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function EventDeleteModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
}: EventDeleteModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[70]" onClose={onClose}>
            <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
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
                        {/* --- CHANGE: Increased modal width from max-w-md to max-w-lg --- */}
                        <Dialog.Panel className="relative w-full max-w-lg transform rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 text-gray-500 transition-colors hover:bg-gray-100 rounded-full"
                                aria-label="Close modal"
                            >
                                <X className="h-10 w-10" />
                            </button>

                            <Dialog.Title
                                as="h2"
                                className="text-2xl font-semibold text-gray-900"
                            >
                                Delete Request
                            </Dialog.Title>

                            <div className="mt-4">
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to permanently delete this event? This action cannot be undone.
                                </p>
                            </div>

                            <div className="mt-8 flex w-full space-x-4">
                                <button
                                    type="button"
                                    className="w-full rounded-full border border-[#697d67] bg-white px-4 py-3 text-sm font-medium text-[#697d67] shadow-sm transition-colors hover:bg-gray-50 focus:outline-none"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="w-full rounded-full bg-[#697d67] px-4 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus:outline-none"
                                    onClick={onConfirm}
                                >
                                    Delete
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