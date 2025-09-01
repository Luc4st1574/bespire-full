"use client";

import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import Image from 'next/image';
import { Event } from '@/components/calendar/CalendarMain';
import {
    X, ChevronLeft, Link as LinkIcon, Edit, MoreHorizontal, Download, Share2, Trash2
} from 'lucide-react';
import EventActions, { EventActionItem } from '../ui/EventActions';
import EventArchiveModal from './EventArchiveModal';
import ShareEventModal from './ShareEventModal';
import EventDeleteModal from './EventDeleteModal';
import { getFileIcon } from '@/utils/getFileIcon';
import Calendar from '@/assets/icons/event_type.svg';
import User from '@/assets/icons/event_creator.svg';
import Eye from '@/assets/icons/visibility_event.svg';
import Bell from '@/assets/icons/notify_event.svg';
import Users from '@/assets/icons/invited_event.svg';
import Cloud from '@/assets/icons/cloud_check.svg';
import EventEditModal from './EventEditModal';
import { EventCategory } from '@/app/calendar/page';

// Helper Interfaces
interface LinkItemData {
    name: string;
    url: string;
}

interface FileItemData {
    name: string;
    date: string;
    url: string;
}
interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
    onArchiveEvent: (eventId: string) => void;
    onDeleteEvent: (eventId: string) => void;
    onUpdateEvent: (updatedEvent: Event) => void;
    eventCategories: EventCategory[];
}

// Mock Data
const invitedPeople = [
    { name: 'Michelle Cruz', avatar: 'https://i.pravatar.cc/150?img=1', bgColor: 'bg-green-100' },
    { name: 'Bernard Co', avatar: 'https://i.pravatar.cc/150?img=2', bgColor: 'bg-orange-100' },
    { name: 'Zeus Roman', avatar: 'https://i.pravatar.cc/150?img=3', bgColor: 'bg-red-100' },
];

const initialLinks: LinkItemData[] = [
    { name: 'Trello - Campaign Board', url: 'https://trello.com' },
    { name: 'Notion - Q2 Product Strategy', url: 'https://notion.so' },
    { name: 'Client Launch Checklist', url: 'https://docs.google.com' },
];

const initialFiles: FileItemData[] = [
    { name: 'Waymax Brand Guide 2024.pdf', date: 'Aug 13, 2025 by Gerard', url: '#' },
    { name: 'Waymax Marketing Plan 2024.docx', date: 'Aug 13, 2025 by Gerard', url: '#' },
    { name: 'Waymax_2024_Strategy_Overview.pdf', date: 'Aug 13, 2025 by Gerard', url: '#' },
    { name: 'Waymax_Marketing_Initiatives_2024.pptx', date: 'Aug 13, 2025 by Gerard', url: '#' },
];

// 👈 UPDATED Component signature to accept new props
export default function EventDetailModal({ 
    isOpen, 
    onClose, 
    event, 
    onDeleteEvent, 
    onArchiveEvent,
    onUpdateEvent,
    eventCategories
}: EventDetailModalProps) {
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [notificationTime, setNotificationTime] = useState('1 hour before');
    
    const [links, setLinks] = useState<LinkItemData[]>(initialLinks);
    const [files, setFiles] = useState<FileItemData[]>(initialFiles);

    useEffect(() => {
        if (isOpen) {
            setLinks(initialLinks);
            setFiles(initialFiles);
        }
    }, [isOpen]);

    if (!event) return null;
    
    // --- Handlers for various actions ---
    const handleShareFile = (file: FileItemData) => alert(`Sharing ${file.name}`);
    const handleDeleteFile = (fileToDelete: FileItemData) => setFiles(currentFiles => currentFiles.filter(file => file.name !== fileToDelete.name));
    const handleShareLink = (link: LinkItemData) => alert(`Sharing ${link.name}`);
    const handleDeleteLink = (linkToDelete: LinkItemData) => setLinks(currentLinks => currentLinks.filter(link => link.url !== linkToDelete.url));
    const handleNotificationChange = (time: string) => setNotificationTime(time);

    // 👈 Handlers for Edit Modal
    const handleOpenEditModal = () => setIsEditModalOpen(true);
    const handleCloseEditModal = () => setIsEditModalOpen(false);
    const handleConfirmUpdate = (updatedEvent: Event) => {
        onUpdateEvent(updatedEvent);
        handleCloseEditModal();
        onClose();
    };

    // Other modal handlers
    const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
    const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);
    const handleConfirmDelete = () => {
        if (event) onDeleteEvent(event.id);
        handleCloseDeleteModal();
        onClose();
    };

    const handleOpenArchiveModal = () => setIsArchiveModalOpen(true);
    const handleCloseArchiveModal = () => setIsArchiveModalOpen(false);
    const handleConfirmArchive = () => {
        if (event) onArchiveEvent(event.id);
        handleCloseArchiveModal();
        onClose();
    };
    
    const handleOpenShareModal = () => setIsShareModalOpen(true);
    const handleCloseShareModal = () => setIsShareModalOpen(false);

    const eventActionItems: EventActionItem[] = [
        { label: 'Archive', onClick: handleOpenArchiveModal },
        { label: 'Share to Chat', onClick: handleOpenShareModal },
        {
            label: 'Notify me',
            subMenu: [
                { label: '5 mins before', onClick: () => handleNotificationChange('5 mins before') },
                { label: '15 mins before', onClick: () => handleNotificationChange('15 mins before') },
                { label: '30 mins before', onClick: () => handleNotificationChange('30 mins before') },
                { label: '1 hour before', onClick: () => handleNotificationChange('1 hour before') },
                { label: '1 day before', onClick: () => handleNotificationChange('1 day before') },
            ]
        },
        { isSeparator: true },
        { label: 'Delete', isDestructive: true, onClick: handleOpenDeleteModal },
    ];

    const formatDate = (isoDate: string, startTime?: string, endTime?: string) => {
        const date = new Date(isoDate.replace(/-/g, '/'));
        const dateString = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return startTime && endTime ? `${dateString}, ${startTime} - ${endTime}` : dateString;
    };

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-end p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-x-full" enterTo="opacity-100 translate-x-0" leave="ease-in duration-200" leaveFrom="opacity-100 translate-x-0" leaveTo="opacity-0 translate-x-full">
                                <Dialog.Panel className="w-full max-w-lg max-h-[calc(100vh-2rem)] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-4 flex-shrink-0">
                                        <button onClick={onClose} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                                            <ChevronLeft size={20} />
                                            <span>Back</span>
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <button aria-label="Copy link" title="Copy link" className="text-gray-500 hover:text-gray-900"><LinkIcon size={20} /></button>
                                            
                                            <button onClick={handleOpenEditModal} aria-label="Edit event" title="Edit event" className="text-gray-500 hover:text-gray-900">
                                                <Edit size={20} />
                                            </button>
                                            
                                            <EventActions items={eventActionItems}>
                                                <button aria-label="More options" title="More options" className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </EventActions>

                                            <button onClick={onClose} aria-label="Close" title="Close" className="text-gray-500 hover:text-gray-900"><X size={24} /></button>
                                        </div>
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
                                        <div className={`flex items-stretch gap-x-4 p-4 rounded-lg mb-6 ${event.bgColor}`}>
                                            <div className={`w-1 rounded-full ${event.rectColor}`}></div>
                                            <div>
                                                <h2 className="text-2xl font-semibold text-gray-900">{event.title}</h2>
                                                <p className="text-sm text-gray-700">{formatDate(event.date, event.startTime, event.endTime)}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mb-8">
                                            <div className="grid grid-cols-[auto_max-content_auto] items-start gap-x-4 gap-y-8">
                                                <Calendar size={18} className="text-[#5e6b66] mt-0.5" /><span className="text-sm text-[#5e6b66]">Type of Event</span><span className="text-sm font-medium text-gray-800 ml-8">{event.type}</span>
                                                <User size={18} className="text-[#5e6b66] mt-0.5" /><span className="text-sm text-[#5e6b66]">Event Creator</span><span className="text-sm font-medium text-gray-800 ml-8">Gerard Santos</span>
                                                <Bell size={18} className="text-[#5e6b66] mt-0.5" /><span className="text-sm text-[#5e6b66]">Notify</span><span className="text-sm font-medium text-gray-800 ml-8">{notificationTime}</span>
                                                <Eye size={18} className="text-[#5e6b66] mt-0.5" /><span className="text-sm text-[#5e6b66]">Visibility</span><span className="text-sm font-medium text-gray-800 ml-8">Only Invited</span>
                                                <Users size={18} className="text-[#5e6b66] mt-0.5" /><span className="text-sm text-[#5e6b66]">Invited People</span>
                                                <div className="flex items-center flex-wrap gap-1.5 ml-8">
                                                    {invitedPeople.map(person => (
                                                        <div key={person.name} className={`inline-flex items-center gap-x-1.5 px-2 py-0.5 rounded-full ${person.bgColor}`}>
                                                            <Image src={person.avatar} alt={person.name} width={16} height={16} className="w-4 h-4 rounded-full" />
                                                            <span className="text-xs font-medium text-gray-800">{person.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg mb-6">
                                            <h3 className="font-light text-[#5e6b66] mb-2">Description</h3>
                                            <p className="text-sm text-gray-600">Discussion on growth metrics, next quarter&apos;s goals, and resource allocation. Please review reports before the meeting.</p>
                                        </div>

                                        {/* Links Section */}
                                        <div className="mb-4">
                                            <h3 className="font-semibold text-gray-800 mb-3">Links</h3>
                                            <div className="space-y-2">
                                                {links.map((item, index) => {
                                                    const hostname = new URL(item.url).hostname;
                                                    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
                                                    
                                                    return (
                                                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <Image src={faviconUrl} alt={`${hostname} favicon`} width={20} height={20} className="rounded-sm" />
                                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">{item.name}</a>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={() => navigator.clipboard.writeText(item.url)} aria-label={`Copy link for ${item.name}`} title={`Copy link for ${item.name}`} className="text-[#5e6b66] hover:text-gray-900"><LinkIcon size={18} /></button>
                                                                <Menu as="div" className="relative inline-block text-left">
                                                                    <Menu.Button className="p-1 text-[#5e6b66] hover:text-gray-900 rounded-full"><MoreHorizontal size={18} aria-hidden="true" /></Menu.Button>
                                                                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                                                        <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                                                                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => handleShareLink(item)} className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}><Share2 className="mr-2 h-4 w-4" aria-hidden="true" />Share</button>)}</Menu.Item></div>
                                                                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => handleDeleteLink(item)} className={`${active ? 'bg-red-500 text-white' : 'text-red-600'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}><Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />Delete</button>)}</Menu.Item></div>
                                                                        </Menu.Items>
                                                                    </Transition>
                                                                </Menu>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Files Section */}
                                        <div className="mb-4">
                                            <h3 className="font-semibold text-gray-800 mb-3">Files</h3>
                                            <div className="space-y-2">
                                                {files.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <Image src={getFileIcon(item.name)} alt={`${item.name} file icon`} width={20} height={20} className="w-5 h-5" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <Cloud size={14} className="text-[#5e6b66]" />
                                                                    <p className="text-xs text-gray-500">{item.date}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button aria-label={`Download ${item.name}`} title={`Download ${item.name}`} className="text-[#5e6b66] hover:text-green-800"><Download size={18} /></button>
                                                            <Menu as="div" className="relative inline-block text-left">
                                                                <Menu.Button className="p-1 text-[#5e6b66] hover:text-green-800 rounded-full"><MoreHorizontal size={18} aria-hidden="true" /></Menu.Button>
                                                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                                                    <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                                                                        <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => handleShareFile(item)} className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}><Share2 className="mr-2 h-4 w-4" aria-hidden="true" />Share</button>)}</Menu.Item></div>
                                                                        <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => handleDeleteFile(item)} className={`${active ? 'bg-red-500 text-white' : 'text-red-600'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}><Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />Delete</button>)}</Menu.Item></div>
                                                                    </Menu.Items>
                                                                </Transition>
                                                            </Menu>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            
            {/* 👈 Render the Edit Modal conditionally */}
            {event && (
                <EventEditModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    event={event}
                    onUpdateEvent={handleConfirmUpdate}
                    eventCategories={eventCategories}
                />
            )}
            
            <EventArchiveModal isOpen={isArchiveModalOpen} onClose={handleCloseArchiveModal} onConfirm={handleConfirmArchive} />
            <EventDeleteModal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />
            <ShareEventModal isOpen={isShareModalOpen} onClose={handleCloseShareModal} event={event} />
        </>
    );
}