"use client";

import { Fragment, useState, useEffect } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { X, Search, UserSquare, UserPlus } from 'lucide-react';
import Image from 'next/image';

// 1. Updated the Person interface to include 'role'
export interface Person {
    id: string;
    name: string;
    avatar: string;
    role: string;
}

interface InvitePeoplePopoverProps {
    children: React.ReactNode;
    onDone: (people: Person[]) => void;
    invitedPeople: Person[];
}

// 2. Added the 'role' to each person in the data array
const peopleToInvite: Person[] = [
    { id: '1', name: 'Michelle Cruz', avatar: 'https://i.pravatar.cc/150?img=1', role: 'Designer' },
    { id: '2', name: 'Bernard Co', avatar: 'https://i.pravatar.cc/150?img=2', role: 'Creative Director' },
    { id: '3', name: 'Zeus Roman', avatar: 'https://i.pravatar.cc/150?img=3', role: 'Project Manager' },
    { id: '4', name: 'Glinda Gomez', avatar: 'https://i.pravatar.cc/150?img=4', role: 'Developer' },
    { id: '5', name: 'Nathaniel V.', avatar: 'https://i.pravatar.cc/150?img=5', role: 'UX Researcher' },
    { id: '6', name: 'Iya Santos', avatar: 'https://i.pravatar.cc/150?img=6', role: 'QA Tester' },
];

export default function InvitePeoplePopover({ children, onDone, invitedPeople }: InvitePeoplePopoverProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localInvites, setLocalInvites] = useState<Person[]>([]);

    useEffect(() => {
        setLocalInvites(invitedPeople);
    }, [invitedPeople]);

    const handleToggleSelection = (person: Person) => {
        setLocalInvites(prev => {
            const isSelected = prev.some(p => p.id === person.id);
            if (isSelected) {
                return prev.filter(p => p.id !== person.id);
            }
            return [...prev, person];
        });
    };
    
    const handleDone = (close: () => void) => {
        onDone(localInvites);
        close();
    };

    const localInvitedIds = new Set(localInvites.map(p => p.id));
    const filteredUninvited = peopleToInvite.filter(person =>
        !localInvitedIds.has(person.id) &&
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Popover className="relative">
            <Popover.Button as="div" className="focus:outline-none focus:ring-0">
                {children}
            </Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 transform rounded-xl bg-white shadow-lg ring-1 ring-black/5 flex flex-col focus:outline-none">
                    {({ close }) => (
                        <>
                            <div className="relative flex items-center border-b border-gray-100">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search People"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full border-0 bg-transparent py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                                />
                            </div>
                            
                            <div className="flex-1 overflow-y-auto">
                                {localInvites.length > 0 && (
                                    <div className="pt-3">
                                        <div className="flex items-center gap-2 px-4 mb-1">
                                            <UserSquare size={20} className="text-gray-500" />
                                            <h3 className="text-sm font-medium text-gray-800">Invited People</h3>
                                        </div>
                                        <ul className="max-h-32 overflow-y-auto">
                                            {localInvites.map(person => (
                                                <li key={`invited-${person.id}`} className="flex items-center justify-between py-2 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <Image src={person.avatar} alt={person.name} width={32} height={32} className="h-8 w-8 rounded-full" />
                                                        {/* 3. Display the name and role */}
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-900">{person.name}</span>
                                                            <p className="text-xs text-gray-500">{person.role}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        title={`Remove ${person.name}`}
                                                        onClick={() => handleToggleSelection(person)}
                                                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-0"
                                                    >
                                                        <X size={30} />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="border-t border-gray-100 my-2"></div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900">
                                    <UserPlus size={16} className="text-gray-500" />
                                    Select People
                                </div>

                                <ul className="max-h-40 overflow-y-auto">
                                    {filteredUninvited.map((person) => (
                                        <li 
                                            key={person.id} 
                                            onClick={() => handleToggleSelection(person)} 
                                            className="flex items-center justify-between py-2 px-4 cursor-pointer hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Image src={person.avatar} alt={person.name} width={32} height={32} className="h-8 w-8 rounded-full" />
                                                {/* 3. Display the name and role */}
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">{person.name}</span>
                                                    <p className="text-xs text-gray-500">{person.role}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 border-t border-gray-100 mt-auto rounded-full">
                                <button type="button" onClick={() => handleDone(close)} className="w-full justify-center rounded-full bg-[#697d67] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#556654] focus-visible:outline-none">
                                    Done
                                </button>
                            </div>
                        </>
                    )}
                </Popover.Panel>
            </Transition>
        </Popover>
    );
}