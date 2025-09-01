"use client";

import React, { Fragment, useRef } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Calendar, X, CheckIcon, ChevronDown } from 'lucide-react';

interface SchedulingOptionsProps {
    date: string;
    setDate: (date: string) => void;
    startTime: string;
    setStartTime: (time: string) => void;
    endTime: string;
    setEndTime: (time: string) => void;
    isRecurring: boolean;
    setIsRecurring: (isRecurring: boolean) => void;
    recurringOption: string;
    setRecurringOption: (option: string) => void;
    isAllDay: boolean;
    setIsAllDay: (isAllDay: boolean) => void;
    notifyOption: string;
    setNotifyOption: (option: string) => void;
    visibilityOption: string;
    setVisibilityOption: (option: string) => void;
}

export default function SchedulingOptions({
    date, setDate,
    startTime, setStartTime,
    endTime, setEndTime,
    isRecurring, setIsRecurring,
    recurringOption, setRecurringOption,
    isAllDay, setIsAllDay,
    notifyOption, setNotifyOption,
    visibilityOption, setVisibilityOption
}: SchedulingOptionsProps) {
    const dateInputRef = useRef<HTMLInputElement>(null);

    const recurringOptions = [
        { id: 1, name: 'Every day' },
        { id: 2, name: 'Every week' },
        { id: 3, name: 'Every 2 weeks' },
        { id: 4, name: 'Every month' },
        { id: 5, name: 'Every year' },
    ];

    const notifyOptions = [
        { value: '5 mins before', label: '5 mins before' },
        { value: '15 mins before', label: '15 mins before' },
        { value: '30 minutes before', label: '30 minutes before' },
        { value: '1 hour before', label: '1 hour before' },
        { value: '1 day before', label: '1 day before' },
    ];

    const visibilityOptions = [
        { value: 'Only Invited', label: 'Only Invited' },
        { value: 'Public', label: 'Public' },
    ];
    
    // UPDATED: This handler now also resets the recurring option when unchecked
    const handleRecurringChange = (checked: boolean) => {
        setIsRecurring(checked);
        if (!checked) {
            setRecurringOption(''); // Reset selection when disabled
        }
    };

    return (
        <div className="space-y-4">
            {/* --- Date and Time Section --- */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="date-button" className="block text-sm font-medium text-gray-700">Date</label>
                        <div className="flex items-center">
                            <input id="recurring" type="checkbox" checked={isRecurring} onChange={(e) => handleRecurringChange(e.target.checked)} className="w-4 h-4 text-[#697d67] border-gray-400 rounded accent-[#697d67] focus:ring-[#697d67]" />
                            <label htmlFor="recurring" className="block ml-2 text-sm text-gray-600">Recurring</label>
                        </div>
                    </div>
                    <div className="relative">
                        <div id="date-button" role="button" tabIndex={0} onClick={() => dateInputRef.current?.showPicker()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dateInputRef.current?.showPicker(); }} className="flex items-center justify-between w-full h-[50px] pl-4 pr-4 text-left border border-gray-200 rounded-lg shadow-sm cursor-pointer focus:outline-none">
                            <span className={date ? "text-gray-900" : "text-gray-500"}>{date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'UTC' }) : "Select Date"}</span>
                            <div className="flex items-center gap-2">
                                {date && (<span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setDate(''); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setDate(''); } }} aria-label="Clear date" className="p-1 text-gray-400 rounded-full cursor-pointer hover:bg-gray-200 hover:text-gray-600 focus:outline-none"><X size={16} /></span>)}
                                <Calendar className="h-5 w-5 text-[#697d67]" aria-hidden="true" />
                            </div>
                        </div>
                        <input ref={dateInputRef} type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute top-0 left-0 w-1 h-1 opacity-0" aria-hidden="true" tabIndex={-1} />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Time</label>
                        <div className="flex items-center">
                            <input id="all-day" type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="w-4 h-4 text-[#697d67] border-gray-400 rounded accent-[#697d67] focus:ring-[#697d67]" />
                            <label htmlFor="all-day" className="block ml-2 text-sm text-gray-600">All Day</label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="time" id="startTime" title="Start time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isAllDay} className="flex items-center justify-center w-full h-[50px] text-center border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-0 text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" />
                        <span className="text-gray-500">–</span>
                        <input type="time" id="endTime" title="End time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isAllDay} className="flex items-center justify-center w-full h-[50px] text-center border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-0 text-sm disabled:bg-gray-100 [&::-webkit-calendar-picker-indicator]:hidden" />
                    </div>
                </div>
            </div>

            {/* --- Recurring Dropdown --- */}
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">Recurring</label>
                <Listbox value={recurringOption} onChange={setRecurringOption} disabled={!isRecurring}>
                    <div className="relative">
                        <Listbox.Button className={`relative w-full h-[50px] py-2 pl-3 pr-10 text-left border border-gray-200 rounded-md shadow-sm focus:outline-none sm:text-sm ${!isRecurring ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-default'
                            }`}>
                            {/* UPDATED: Logic to display placeholder text when no option is selected */}
                            <span className={`block truncate ${!recurringOption ? 'text-gray-500' : 'text-gray-900'}`}>
                                {recurringOption || 'Select frequency...'}
                            </span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                {recurringOptions.map((option) => (
                                    <Listbox.Option key={option.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.name}>
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.name}</span>
                                                {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true" /></span> : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </Listbox>
            </div>


            {/* --- Notify and Visibility Section --- */}
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
                                    {notifyOptions.map((option) => (
                                        <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                            {({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true" /></span>) : null}</>)}
                                        </Listbox.Option>
                                    ))}
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
                                    {visibilityOptions.map((option) => (
                                        <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                            {({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true" /></span>) : null}</>)}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                </div>
            </div>
        </div>
    );
}