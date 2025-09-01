"use client";

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CalendarClock, CheckIcon, ChevronDown } from 'lucide-react';
import CheckSquare from '@/assets/icons/add_task.svg';
import Users from '@/assets/icons/meeting_add.svg';
import { EventCategory } from '@/app/calendar/page';

interface EventTypeSelectorProps {
    activeType: string;
    setActiveType: (type: string) => void;
    eventCategories: EventCategory[];
}

export default function EventTypeSelector({ activeType, setActiveType, eventCategories }: EventTypeSelectorProps) {
    const otherCategories = eventCategories.filter(
        cat => cat.type !== 'Tasks' && cat.type !== 'Meetings' && cat.type !== 'Time Off'
    );

    const otherCategoryOptions = otherCategories.map(category => ({
        value: category.type,
        label: category.type,
    }));
    
    const selectedOptionForButton = otherCategoryOptions.find(opt => opt.value === activeType);
    const buttonText = selectedOptionForButton?.label ?? "Select Category";

    return (
        <div>
            <label className="block mb-2 mt-3 text-sm font-medium text-black">Frequently Requested</label>
            <div className="grid grid-cols-3 gap-2">
                <button type="button" title="Select Task" onClick={() => setActiveType('Tasks')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Tasks' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                    <CheckSquare title="Task Icon" size={24} className="text-[#697d67]" />
                    <span>Task</span>
                </button>
                <button type="button" title="Select Meeting" onClick={() => setActiveType('Meetings')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Meetings' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                    <Users title="Meeting Icon" size={24} className="text-[#697d67]" />
                    <span>Meeting</span>
                </button>
                <button type="button" title="Select Time Off" onClick={() => setActiveType('Time Off')} className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${activeType === 'Time Off' ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                    <CalendarClock size={24} className="text-[#697d67]" />
                    <span>Time Off</span>
                </button>
            </div>
            
            <label className="block mt-5 mb-2 text-sm font-medium text-black">Or choose from the list</label>
            {otherCategoryOptions.length > 0 && (
                <div className="mt-2">
                    <Listbox value={activeType} onChange={setActiveType}>
                        <div className="relative">
                            <Listbox.Button className="relative w-full h-[50px] py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:outline-none sm:text-sm">
                                <span className="block truncate">{buttonText}</span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"><ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200`} aria-hidden="true" /></span>
                            </Listbox.Button>
                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                    {otherCategoryOptions.map((option) => (
                                        <Listbox.Option key={option.value} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={option.value}>
                                            {({ selected }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.label}</span>{selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#697d67]"><CheckIcon className="w-5 h-5" aria-hidden="true" /></span> : null}</>)}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </Listbox>
                </div>
            )}
            <div className="mt-4 border-t border-gray-200" />
        </div>
    );
}