"use client";

import React, { Fragment, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Plus, Download, MoreHorizontal, Share2, Trash2, X } from 'lucide-react';
import { getFileIcon } from "@/utils/getFileIcon";
import Cloud from '@/assets/icons/cloud_check.svg';
import InvitePeoplePopover, { Person } from '@/components/ui/InvitePeoplePopover';
import { LinkInputList } from './LinksAttached';

// Types are defined here for simplicity
export interface UploadingFile {
    file: File;
    progress?: number;
    done?: boolean;
    error?: boolean;
    uploadDate?: string;
}

interface AttachmentsAndInvitesProps {
    invitedPeople: Person[];
    handleDoneInviting: (people: Person[]) => void;
    handleRemovePerson: (person: Person) => void;
    uploadingFiles: UploadingFile[];
    setUploadingFiles: React.Dispatch<React.SetStateAction<UploadingFile[]>>;
}

export default function AttachmentsAndInvites({ 
    invitedPeople, 
    handleDoneInviting,
    handleRemovePerson, 
    uploadingFiles, 
    setUploadingFiles 
}: AttachmentsAndInvitesProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // All file handling logic is now inside this component
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newUploadingFiles: UploadingFile[] = files.map(file => ({
            file,
            progress: 0,
            done: false,
            error: false,
        }));

        const currentFileCount = uploadingFiles.length;
        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

        newUploadingFiles.forEach((_, index) => {
            const overallIndex = currentFileCount + index;
            const interval = setInterval(() => {
                setUploadingFiles(prev =>
                    prev.map((f, i) => {
                        if (i === overallIndex && f && !f.done) {
                            const newProgress = (f.progress || 0) + 10;
                            if (newProgress >= 100) {
                                clearInterval(interval);
                                return { 
                                    ...f, 
                                    progress: 100, 
                                    done: true, 
                                    uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                };
                            }
                            return { ...f, progress: newProgress };
                        }
                        return f;
                    })
                );
            }, 200);
        });
        
        if(event.target) {
            event.target.value = '';
        }
    };
    
    const handleRemoveUploadingFile = (indexToRemove: number) => {
        setUploadingFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    const handleDeleteCompletedFile = (fileToDelete: UploadingFile) => {
        setUploadingFiles(prev => prev.filter(f => f.file.name !== fileToDelete.file.name));
    };

    const handleShareFile = (fileToShare: UploadingFile) => {
        alert(`Sharing ${fileToShare.file.name}`);
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    
    const inProgressFiles = uploadingFiles.filter(f => !f.done);
    const completedFiles = uploadingFiles.filter(f => f.done);

    return (
        <div className="space-y-6">
            {/* --- Invite People Section --- */}
            <div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Invite People</span>
                    <InvitePeoplePopover onDone={handleDoneInviting} invitedPeople={invitedPeople}>
                        <button type="button" title="Add People" className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50">
                            <span>Add</span>
                            <Plus size={16} />
                        </button>
                    </InvitePeoplePopover>
                </div>
                {invitedPeople.length > 0 && (
                    <div className="pt-2 mt-2 overflow-y-auto max-h-40">
                        <ul className="space-y-2">
                            {invitedPeople.map(person => (
                                <li key={person.id} className="flex items-center justify-between py-1 pr-1">
                                    <div className="flex items-center gap-3">
                                        <Image src={person.avatar} alt={person.name} width={32} height={32} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900">{person.name}</span>
                                            <p className="text-xs text-gray-500">{person.role}</p>
                                        </div>
                                    </div>
                                    <button type="button" title={`Remove ${person.name}`} onClick={() => handleRemovePerson(person)} className="p-1 text-gray-400 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-0">
                                        <X size={24} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* --- Links Section --- */}
            <LinkInputList />

            {/* --- Files Upload Section --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Files</span>
                    <button type="button" onClick={triggerFileSelect} title="Add Files" className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#697d67] text-[#697d67] bg-transparent rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                        <span>Add</span>
                        <Plus size={16} />
                    </button>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" aria-hidden="true" />
                </div>

                {/* COMPLETED LIST */}
                {completedFiles.length > 0 && (
                    <div className="pt-2">
                        <div className="space-y-2">
                            {completedFiles.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Image src={getFileIcon(item.file.name)} alt={`${item.file.name} file icon`} width={20} height={20} className="w-5 h-5 flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-gray-800 truncate">{item.file.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Cloud size={14} className="text-[#5e6b66]" />
                                                <p className="text-xs text-gray-500">{item.uploadDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pl-2">
                                        <button type="button" aria-label={`Download ${item.file.name}`} title={`Download ${item.file.name}`} className="text-[#5e6b66] hover:text-green-800">
                                            <Download size={18} />
                                        </button>
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="p-1 text-[#5e6b66] hover:text-green-800 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
                                                <MoreHorizontal size={18} aria-hidden="true" />
                                            </Menu.Button>
                                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                                <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                                                    <div className="px-1 py-1">
                                                        <Menu.Item>{({ active }) => (<button onClick={() => handleShareFile(item)} className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}><Share2 className="mr-2 h-4 w-4" aria-hidden="true" />Share</button>)}</Menu.Item>
                                                    </div>
                                                    <div className="px-1 py-1">
                                                        <Menu.Item>{({ active }) => (<button onClick={() => handleDeleteCompletedFile(item)} className={`${active ? 'bg-red-500 text-white' : 'text-red-600'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}><Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />Delete</button>)}</Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* IN-PROGRESS LIST */}
                {inProgressFiles.length > 0 && (
                    <ul className="space-y-4 max-h-[160px] overflow-auto pr-2">
                        {inProgressFiles.map((f, idx) => (
                            <li key={`${f.file.name}-${idx}`} className="flex items-center gap-3">
                                <Image src={getFileIcon(f.file.name)} width={40} height={40} className="w-10 h-10 flex-shrink-0" alt="file icon" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-800 truncate block pr-2" title={f.file.name}>{f.file.name}</span>
                                        <span className="text-xs text-gray-500">{f.progress || 0}%</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                                            <FontAwesomeIcon icon={faSpinner} className="fa-spin w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="h-2 flex-1 rounded bg-gray-200 overflow-hidden">
                                            <div className="h-2 rounded bg-[#869d84] transition-all" style={{ width: `${f.progress || 0}%` }} />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveUploadingFile(uploadingFiles.indexOf(f))} className="text-gray-400 hover:text-red-600 flex-shrink-0 ml-1" title="Cancel upload">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}