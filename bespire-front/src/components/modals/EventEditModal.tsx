"use client";

import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { X, Calendar, CalendarClock, CheckIcon, ChevronDown } from 'lucide-react';
import { Event } from '@/components/calendar/CalendarMain';
import { EventCategory } from '@/app/calendar/page';
import CheckSquare from '@/assets/icons/add_task.svg';
import Users from '@/assets/icons/meeting_add.svg';

interface EventEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateEvent: (updatedEvent: Event) => void;
    event: Event | null;
    eventCategories: EventCategory[];
}

export default function EventEditModal({ isOpen, onClose, onUpdateEvent, event, eventCategories }: EventEditModalProps) {
    // State for all fields, both editable and for mockup purposes
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('10:00');
    const [endTime, setEndTime] = useState('11:00');
    const [isAllDay, setIsAllDay] = useState(false);
    const [activeType, setActiveType] = useState('');
    const [error, setError] = useState('');
    
    // State for mockup fields that are visible but not saved
    const [description, setDescription] = useState('');
    const [notifyOption, setNotifyOption] = useState('1 hour before');
    const [visibilityOption, setVisibilityOption] = useState('Only Invited');
    
    const dateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && event) {
            setTitle(event.title);
            setDate(event.date);
            setStartTime(event.startTime || '09:00');
            setEndTime(event.endTime || '17:00');
            setIsAllDay(!event.startTime);
            setActiveType(event.type);
            setDescription('This is a sample description.');
        } else if (!isOpen) {
            setError('');
        }
    }, [isOpen, event]);

    useEffect(() => {
        if (isAllDay) {
            setStartTime('09:00');
            setEndTime('17:00');
        }
    }, [isAllDay]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;
        if (!title.trim() || !date || !activeType) {
            setError('Title, Date, and Event Type are required.');
            return;
        }

        const selectedCategory = eventCategories.find(cat => cat.type === activeType);
        if (!selectedCategory) {
            setError(`Category "${activeType}" is not configured.`);
            return;
        }

        const updatedEvent: Event = {
            ...event, 
            title,
            date,
            type: activeType,
            startTime: isAllDay ? undefined : startTime,
            endTime: isAllDay ? undefined : endTime,
            bgColor: selectedCategory.bgColor,
            rectColor: selectedCategory.rectColor,
        };
        
        onUpdateEvent(updatedEvent);
    };

    const notifyOptions = [
        { value: '5 mins before', label: '5 mins before' },
        { value: '15 mins before', label: '15 mins before' },
        { value: '1 hour before', label: '1 hour before' },
    ];
    const visibilityOptions = [
        { value: 'Only Invited', label: 'Only Invited' },
        { value: 'Public', label: 'Public' },
    ];

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[70]" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-end min-h-full p-2 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-x-full" enterTo="opacity-100 translate-x-0" leave="ease-in duration-200" leaveFrom="opacity-100 translate-x-0" leaveTo="opacity-0 translate-x-full">
                            <Dialog.Panel className="relative flex flex-col w-full max-w-lg max-h-[calc(100vh-1rem)] p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-500 transition-colors rounded-full hover:text-gray-900 hover:bg-gray-100 focus:outline-none" aria-label="Close edit event modal">
                                    <X size={32} />
                                </button>
                                
                                <Dialog.Title as="h3" className="mt-4 text-xl font-light leading-6 text-gray-900">Edit Event</Dialog.Title>

                                <form onSubmit={handleSubmit} className="flex-1 mt-4 pr-2 overflow-y-auto space-y-9">
                                    <div>
                                        <label className="block mb-2 mt-3 text-sm font-medium text-black">Event Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button type="button" title="Select Task" onClick={() => setActiveType('Tasks')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Tasks' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}><CheckSquare title="Task Icon" size={24} className="text-[#697d67]" /><span>Task</span></button>
                                            <button type="button" title="Select Meeting" onClick={() => setActiveType('Meetings')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Meetings' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}><Users title="Meeting Icon" size={24} className="text-[#697d67]" /><span>Meeting</span></button>
                                            <button type="button" title="Select Time Off" onClick={() => setActiveType('Time Off')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Time Off' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}><CalendarClock size={24} className="text-[#697d67]" /><span>Time Off</span></button>
                                        </div>
                                        <div className="mt-4 border-t border-gray-200" />
                                    </div>

                                    <div>
                                        <label htmlFor="title-edit" className="block text-sm font-medium text-gray-700">Event Title</label>
                                        <input type="text" id="title-edit" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full mt-1 h-[50px] px-3 py-2 placeholder-gray-400 border-gray-400 rounded-md shadow-sm sm:text-sm focus:ring-0 focus:outline-none focus:border-[#697d67]" placeholder="Enter Event Title" />
                                    </div>

                                    {error && <p className="text-sm text-red-600 -my-2">{error}</p>}
                                    
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1"><label htmlFor="date-button-edit" className="block text-sm font-medium text-gray-700">Date</label></div>
                                            <div className="relative">
                                                <div id="date-button-edit" role="button" tabIndex={0} onClick={() => dateInputRef.current?.showPicker()} className="flex items-center justify-between w-full h-[50px] pl-4 pr-4 text-left border border-gray-200 rounded-lg shadow-sm cursor-pointer focus:outline-none">
                                                    <span className={date ? "text-gray-900" : "text-gray-500"}>{date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'UTC' }) : "Select Date"}</span>
                                                    <Calendar className="h-5 w-5 text-[#697d67]" aria-hidden="true" />
                                                </div>
                                                <input ref={dateInputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute top-0 left-0 w-1 h-1 opacity-0" aria-hidden="true" tabIndex={-1} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <label htmlFor="startTime-edit" className="block text-sm font-medium text-gray-700">Time</label>
                                                <div className="flex items-center">
                                                    <input id="all-day-edit" type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="w-4 h-4 text-[#697d67] border-gray-400 rounded accent-[#697d67] focus:ring-[#697d67]" />
                                                    <label htmlFor="all-day-edit" className="block ml-2 text-sm text-gray-600">All Day</label>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input type="time" id="startTime-edit" title="Start time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isAllDay} className="flex items-center justify-center w-full h-[50px] text-center border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-0 text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" />
                                                <span className="text-gray-500">–</span>
                                                <input type="time" id="endTime-edit" title="End time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isAllDay} className="flex items-center justify-center w-full h-[50px] text-center border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-0 text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">Notify</label>
                                            <Listbox value={notifyOption} onChange={setNotifyOption}>
                                                <div className="relative">
                                                    <Listbox.Button className="relative w-full h-[50px] py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:outline-none sm:text-sm">
                                                        <span className="block truncate">{notifyOption}</span>
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" /></span>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                                            {notifyOptions.map((option) => (<Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>{({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true"/></span>) : null}</>)}</Listbox.Option>))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block mb-1 text-sm font-medium text-gray-700">Visibility</label>
                                            <Listbox value={visibilityOption} onChange={setVisibilityOption}>
                                                <div className="relative">
                                                    <Listbox.Button className="relative w-full h-[50px] py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:outline-none sm:text-sm">
                                                        <span className="block truncate">{visibilityOption}</span>
                                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" /></span>
                                                    </Listbox.Button>
                                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                        <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                                            {visibilityOptions.map((option) => (<Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>{({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true"/></span>) : null}</>)}</Listbox.Option>))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            </Listbox>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="description-edit" className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea id="description-edit" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 mt-2 border-gray-200 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-none" placeholder="Enter Description"></textarea>
                                    </div>
                                    
                                    <div className="flex w-full gap-4 pt-4 flex-shrink-0">
                                        <button type="button" onClick={onClose} className="flex justify-center w-full px-10 py-3 text-sm font-medium text-[#697D67] bg-white border border-[#697D67] rounded-full hover:bg-gray-50 focus:outline-none transition-colors">Cancel</button>
                                        <button type="submit" className="flex justify-center w-full px-12 py-3 text-sm font-medium text-white bg-[#697d67] rounded-full hover:bg-[#556654] focus:outline-none transition-colors">Save Changes</button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}