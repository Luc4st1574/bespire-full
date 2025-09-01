"use client";

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { X, Check } from 'lucide-react';

interface EventArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function EventArchiveModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
}: EventArchiveModalProps) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

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
                                Archive Calendar Event
                            </Dialog.Title>

                            <div className="mt-4">
                                <p className="text-sm text-gray-600">
                                    Are you sure you want to archive this event? Archived events remain accessible in <strong className="font-medium text-gray-700">Settings → Workspace Tab → Archived Events.</strong>
                                </p>
                            </div>
                            
                            <div className="mt-6">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={dontShowAgain}
                                        onChange={() => setDontShowAgain(!dontShowAgain)}
                                    />
                                    <div 
                                        data-state={dontShowAgain ? 'checked' : 'unchecked'}
                                        className="flex items-center justify-center w-5 h-5 rounded border border-gray-400 data-[state=checked]:bg-[#697d67] data-[state=checked]:border-[#697d67] transition-colors"
                                    >
                                        <Check 
                                            data-state={dontShowAgain ? 'checked' : 'unchecked'}
                                            className="w-3.5 h-3.5 text-white hidden data-[state=checked]:block" 
                                            strokeWidth={3}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600">Don&#39;t show again</span>
                                </label>
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
                                    Archive
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