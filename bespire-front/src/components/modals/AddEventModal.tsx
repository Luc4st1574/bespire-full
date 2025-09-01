"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, FormProvider } from "react-hook-form";
import { X } from 'lucide-react';
import { EventCategory } from '@/app/calendar/page';
import { Event } from '@/components/calendar/CalendarMain';
import { Person } from '@/components/ui/InvitePeoplePopover';
import { toISODateString } from '@/utils/getDates';

// Modularized Components
import EventTypeSelector from './eventcomp/EventTypeSelector';
import AssignedToSelector from './eventcomp/AssignedToSelector';
import SchedulingOptions from './eventcomp/SchedulingOptions';
import AttachmentsAndInvites, { UploadingFile } from './eventcomp/AttachmentsAndInvites';

// Types remain in this file for simplicity
interface EventWithFiles extends Omit<Event, 'id'> {
    files: File[];
    links?: string[];
}

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddEvent: (newEvent: EventWithFiles) => void;
    eventCategories: EventCategory[];
    initialDate: Date;
}

interface AddEventFormData {
    links?: string[];
}

export default function AddEventModal({ isOpen, onClose, onAddEvent, eventCategories, initialDate }: AddEventModalProps) {
    // All state is managed here in the main component
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('11:00');
    const [isAllDay, setIsAllDay] = useState(false);
    const [description, setDescription] = useState('');
    const [activeType, setActiveType] = useState('');
    const [assignedTo, setAssignedTo] = useState('Bespire Team');
    const [assignee, setAssignee] = useState('Mariel Garcia');
    const [error, setError] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [notifyOption, setNotifyOption] = useState('1 hour before');
    const [visibilityOption, setVisibilityOption] = useState('Only Invited');
    const [invitedPeople, setInvitedPeople] = useState<Person[]>([]);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    
    // ADDED: State for the recurring option dropdown
    const [recurringOption, setRecurringOption] = useState('');

    const methods = useForm<AddEventFormData>();

    useEffect(() => {
        if (isOpen) {
            setDate(''); 
            setTitle(''); 
            setStartTime('10:00'); 
            setEndTime('11:00');
            setActiveType(''); 
            setDescription(''); 
            setIsAllDay(false); 
            setIsRecurring(false);
            setError(''); 
            setNotifyOption('1 hour before'); 
            setVisibilityOption('Only Invited');
            setInvitedPeople([]); 
            setUploadingFiles([]);
            setAssignedTo('Bespire Team');
            setAssignee('Mariel Garcia');
            methods.reset();
            
            // ADDED: Reset the recurring option when the modal opens
            setRecurringOption('');
        }
    }, [isOpen, initialDate, methods]);
    
    useEffect(() => {
        if (isAllDay) { 
            setStartTime('09:00'); 
            setEndTime('17:00'); 
        }
    }, [isAllDay]);

    const handleDoneInviting = (people: Person[]) => setInvitedPeople(people);
    const handleRemovePerson = (personToRemove: Person) => {
        setInvitedPeople(prev => prev.filter(p => p.id !== personToRemove.id));
    };

    const onSubmit = (data: AddEventFormData) => {
        // Validation
        if (!title.trim()) { setError('Title is required.'); return; }
        if (!date) { setError('Please select a date.'); return; }
        if (!activeType) { setError('Please select an event type.'); return; }
        const selectedCategory = eventCategories.find(cat => cat.type === activeType);
        if (!selectedCategory) { setError(`Category "${activeType}" is not configured.`); return; }

        // Filter for successfully uploaded files
        const completedFiles = uploadingFiles.filter(f => f.done).map(f => f.file);

        // Create the base event object
        const baseEvent: EventWithFiles = {
            title,
            startTime: isAllDay ? undefined : startTime,
            endTime: isAllDay ? undefined : endTime,
            type: activeType,
            bgColor: selectedCategory.bgColor,
            rectColor: selectedCategory.rectColor,
            links: data.links || [],
            files: completedFiles,
            date: '', // date will be set below
        };

        if (isRecurring) {
            const selectedDate = new Date(date + 'T00:00:00');
            const dayOfWeek = selectedDate.getDay();
            const monday = new Date(selectedDate);
            const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            monday.setDate(selectedDate.getDate() + offset);

            for (let i = 0; i < 5; i++) {
                const eventDate = new Date(monday);
                eventDate.setDate(monday.getDate() + i);
                onAddEvent({ 
                    ...baseEvent, 
                    date: toISODateString(eventDate)
                });
            }
        } else {
            onAddEvent({ 
                ...baseEvent, 
                date: date 
            });
        }
        
        onClose();
    };
    
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-end min-h-full p-2 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-x-full" enterTo="opacity-100 translate-x-0" leave="ease-in duration-200" leaveFrom="opacity-100 translate-x-0" leaveTo="opacity-0 translate-x-full">
                            <Dialog.Panel className="relative flex flex-col w-full max-w-lg max-h-[calc(100vh-1rem)] p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 transition-colors rounded-full hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#697d67]" title="Close modal" aria-label="Close add event modal"><X size={32} /></button>
                                <Dialog.Title as="h3" className="text-xl font-light leading-6 text-gray-900 mt-4">Add Event</Dialog.Title>

                                <FormProvider {...methods}>
                                    <form onSubmit={methods.handleSubmit(onSubmit)} className="flex-1 mt-4 pr-2 overflow-y-auto space-y-9">
                                        
                                        <EventTypeSelector activeType={activeType} setActiveType={setActiveType} eventCategories={eventCategories} />
                                        
                                        <AssignedToSelector
                                            assignedTo={assignedTo}
                                            setAssignedTo={setAssignedTo}
                                            assignee={assignee}
                                            setAssignee={setAssignee}
                                        />
                                        
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                                            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full mt-1 h-[50px] px-3 py-2 placeholder-gray-400 border-gray-400 rounded-md shadow-sm sm:text-sm focus:ring-0 focus:outline-none focus:border-[#697d67]" placeholder="Enter Event Title" />
                                        </div>

                                        {error && <p className="text-sm text-red-600 -my-2">{error}</p>}
                                        
                                        {/* ADDED: Pass the new props down to the child component */}
                                        <SchedulingOptions
                                            date={date} setDate={setDate}
                                            startTime={startTime} setStartTime={setStartTime}
                                            endTime={endTime} setEndTime={setEndTime}
                                            isRecurring={isRecurring} setIsRecurring={setIsRecurring}
                                            recurringOption={recurringOption} setRecurringOption={setRecurringOption}
                                            isAllDay={isAllDay} setIsAllDay={setIsAllDay}
                                            notifyOption={notifyOption} setNotifyOption={setNotifyOption}
                                            visibilityOption={visibilityOption} setVisibilityOption={setVisibilityOption}
                                        />

                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-2 border-gray-200 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-none" placeholder="Enter Description"></textarea>
                                        </div>
                                        
                                        <AttachmentsAndInvites 
                                            invitedPeople={invitedPeople}
                                            handleDoneInviting={handleDoneInviting}
                                            handleRemovePerson={handleRemovePerson}
                                            uploadingFiles={uploadingFiles}
                                            setUploadingFiles={setUploadingFiles}
                                        />

                                        <div className="flex w-full gap-4 pt-4 flex-shrink-0">
                                            <button type="button" onClick={onClose} className="flex justify-center w-full px-10 py-3 text-sm font-medium text-[#697D67] bg-white border border-[#697D67] rounded-full hover:bg-gray-50 focus:outline-none transition-colors">Cancel</button>
                                            <button type="submit" className="flex justify-center w-full px-12 py-3 text-sm font-medium text-white bg-[#697d67] rounded-full hover:bg-[#556654] focus:outline-none transition-colors">Save</button>
                                        </div>
                                    </form>
                                </FormProvider>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}