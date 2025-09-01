"use client";

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { User, Users, CheckIcon, ChevronDown } from 'lucide-react';

interface AssignedToSelectorProps {
    assignedTo: string;
    setAssignedTo: (value: string) => void;
    assignee: string;
    setAssignee: (value: string) => void;
}

// Mock data for the assignee dropdown, as seen in your image
const assigneeOptions = [
    { id: 1, name: 'Mariel Garcia' },
    { id: 2, name: 'John Doe' },
    { id: 3, name: 'Jane Smith' },
];

export default function AssignedToSelector({ assignedTo, setAssignedTo, assignee, setAssignee }: AssignedToSelectorProps) {
    const assignmentButtons = [
        { id: 'Client', label: 'Client', icon: <User size={24} className="text-[#697d67]" /> },
        { id: 'Bespire Team', label: 'Bespire Team', icon: <Users size={24} className="text-[#697d67]" /> },
        { id: 'Admin', label: 'Admin', icon: <User size={24} className="text-[#697d67]" /> },
    ];

    return (
        <div className="space-y-4">
            {/* --- Assigned To Buttons --- */}
            <div>
                <label className="block mb-2 text-sm font-medium text-black">Assigned to</label>
                <div className="grid grid-cols-3 gap-2">
                    {assignmentButtons.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            title={`Select ${option.label}`}
                            onClick={() => setAssignedTo(option.id)}
                            className={`flex flex-col items-start justify-center gap-1 py-4 px-3 rounded-lg border text-sm font-medium transition-colors ${
                                assignedTo === option.id
                                    ? 'bg-[#e9f2e7] border-[#697d67] text-[#697d67]'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {option.icon}
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Assignee Dropdown --- */}
            <div>
                <label className="block mb-2 text-sm font-medium text-black">Assignee</label>
                <Listbox value={assignee} onChange={setAssignee}>
                    <div className="relative">
                        <Listbox.Button className="relative w-full h-[50px] py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:outline-none sm:text-sm">
                            <span className="block truncate">{assignee}</span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>
                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base bg-white border border-gray-300 rounded-md shadow-lg max-h-60 focus:outline-none sm:text-sm">
                                {assigneeOptions.map((person) => (
                                    <Listbox.Option key={person.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-100' : 'text-gray-900'}`} value={person.name}>
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{person.name}</span>
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
            <div className="mt-4 border-t border-gray-200" />
        </div>
    );
}