"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Check, Minus } from 'lucide-react';
import { generateCalendarDays, toISODateString } from '@/utils/getDates';
import { useCalendar } from '@/hooks/useCalendar';
import { useAuth } from '@/hooks/useAuth';
import { TeamMember, Company } from '@/types/calendar';

type SidebarCalendarProps = {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
};

export default function SidebarCalendar({ selectedDate, onDateSelect }: SidebarCalendarProps) {
    const { user } = useAuth();
    const { teamMembers, companies } = useCalendar();
    const [displayDate, setDisplayDate] = useState(selectedDate);

    // --- State for Team Listbox ---
    const [isTeamOpen, setIsTeamOpen] = useState(false);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({ [user?._id || '']: true });
    const [visibleTeamCount, setVisibleTeamCount] = useState(4);
    const [teamSearchQuery, setTeamSearchQuery] = useState('');

    // --- State for Client Listbox ---
    const [isClientOpen, setIsClientOpen] = useState(false);
    const [checkedClients, setCheckedClients] = useState<{ [key: string]: boolean }>({});
    const [visibleClientCount, setVisibleClientCount] = useState(5);
    const [clientSearchQuery, setClientSearchQuery] = useState('');

    // --- Logic for Team Checkboxes ---
    const checkedTeamCount = Object.values(checkedItems).filter(Boolean).length;
    const isAllTeamsChecked = teamMembers.length > 0 && checkedTeamCount === teamMembers.length;
    const isTeamIndeterminate = checkedTeamCount > 0 && !isAllTeamsChecked;
    // FIX: Add checks for member and its properties before calling toLowerCase
    const filteredTeamMembers = teamMembers.filter((member: TeamMember) =>
        member && member.firstName && member.lastName &&
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(teamSearchQuery.toLowerCase())
    );

    // --- Logic for Client Checkboxes ---
    const checkedClientCount = Object.values(checkedClients).filter(Boolean).length;
    const isAllClientsChecked = companies.length > 0 && checkedClientCount === companies.length;
    const isClientsIndeterminate = checkedClientCount > 0 && !isAllClientsChecked;
    // FIX: Add checks for client and client.name before calling toLowerCase
    const filteredClients = companies.filter((client: Company) =>
        client && client.name && client.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
    );

    // --- Handlers for Client Listbox ---
    const handleAllClientsChange = () => {
        const newCheckedState: { [key: string]: boolean } = {};
        if (!isAllClientsChecked) {
            companies.forEach((client: Company) => { newCheckedState[client._id] = true; });
        }
        setCheckedClients(newCheckedState);
    };
    const handleClientCheckboxChange = (clientId: string) => {
        setCheckedClients(prev => ({ ...prev, [clientId]: !prev[clientId] }));
    };
    const handleSeeMoreClients = () => setVisibleClientCount(filteredClients.length);
    const handleSeeLessClients = () => setVisibleClientCount(5);
    
    // --- Handlers for Team Listbox ---
    const handleAllTeamsChangeImpl = () => {
        const newCheckedState: { [key: string]: boolean } = {};
        if (!isAllTeamsChecked) {
            teamMembers.forEach((member: TeamMember) => { newCheckedState[member._id] = true; });
        }
        setCheckedItems(newCheckedState);
    };
    const handleTeamCheckboxChangeImpl = (memberId: string) => {
        setCheckedItems(prev => ({ ...prev, [memberId]: !prev[memberId] }));
    };
    const handleSeeMoreTeams = () => setVisibleTeamCount(filteredTeamMembers.length);
    const handleSeeLessTeams = () => setVisibleTeamCount(4);

    // --- useEffect Hooks ---
    useEffect(() => {
        setDisplayDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }, [selectedDate]);
    
    useEffect(() => {
        if (!isTeamOpen) {
            const timer = setTimeout(() => {
                setVisibleTeamCount(4);
                setTeamSearchQuery('');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isTeamOpen]);
    
    useEffect(() => {
        if (!isClientOpen) {
            const timer = setTimeout(() => {
                setVisibleClientCount(5);
                setClientSearchQuery('');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isClientOpen]);

    // --- Render Logic ---
    const selectedDateString = toISODateString(selectedDate);
    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const calendarDays = generateCalendarDays(displayDate).slice(0, 35); 
    const customGreen = "#697d67";
    const handlePrevMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));

    return (
        <div className="w-64 p-2">
            {/* Calendar Header and Grid */}
            <div className="flex items-center justify-between mb-4 bg-[#f3fee7] rounded-lg p-2">
                <button title="Previous month" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-[#e1f0cc]"><ChevronLeft size={20} style={{ color: customGreen }} /></button>
                <h3 className="font-semibold" style={{ color: customGreen }}>{displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button title="Next month" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-[#e1f0cc]"><ChevronRight size={20} style={{ color: customGreen }} /></button>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-gray-500 font-medium">{daysOfWeek.map(day => <div key={day}>{day}</div>)}{calendarDays.map((day, index) => { const isSelected = day.date === selectedDateString; return (<button key={index} onClick={() => onDateSelect(new Date(day.date.replace(/-/g, '/')))} style={{ backgroundColor: isSelected ? customGreen : undefined }} className={`w-7 h-7 flex items-center justify-center rounded-full relative mx-auto ${day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'} ${isSelected ? 'text-white' : ''} ${!isSelected && day.isCurrentMonth ? 'hover:bg-gray-100' : ''}`}>{day.dayOfMonth}</button>);})}</div>

            {/* List Boxes Section */}
            <div className="mt-6 space-y-3">
                {/* --- Bespire Team Listbox --- */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm transition-all duration-300">
                    <button onClick={() => setIsTeamOpen(!isTeamOpen)} className="w-full flex items-center justify-between p-3">
                        <span className="font-medium text-sm text-gray-700 pl-2">Bespire Team</span>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isTeamOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isTeamOpen && (
                        <div className="px-3 pb-3">
                            <div className="relative mb-3">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Search size={20} className="text-gray-400" /></div>
                                <input type="text" placeholder="Search a team" value={teamSearchQuery} onChange={(e) => setTeamSearchQuery(e.target.value)} className="w-full pl-4 pr-10 py-2 text-sm text-gray-700 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-gray-300 focus:outline-none placeholder-gray-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" checked={isAllTeamsChecked} onChange={handleAllTeamsChangeImpl} className="hidden" />
                                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${(isAllTeamsChecked || isTeamIndeterminate) ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                        {isAllTeamsChecked && <Check size={14} className="text-white" />}
                                        {isTeamIndeterminate && <Minus size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-gray-800 font-light">All</span>
                                </label>
                                {filteredTeamMembers.slice(0, visibleTeamCount).map((member: TeamMember) => (
                                    <label key={member._id} className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" checked={!!checkedItems[member._id]} onChange={() => handleTeamCheckboxChangeImpl(member._id)} className="hidden" />
                                        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${checkedItems[member._id] ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                            {checkedItems[member._id] && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-800">{member.firstName} {member.lastName}</span>
                                        {member._id === user?._id && (<span className="text-sm text-gray-500">(You)</span>)}
                                    </label>
                                ))}
                            </div>
                            {filteredTeamMembers.length > 4 && ( visibleTeamCount < filteredTeamMembers.length ? (<button onClick={handleSeeMoreTeams} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">+</span> See more</button>) : (<button onClick={handleSeeLessTeams} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">−</span> See less</button>))}
                        </div>
                    )}
                </div>

                {/* --- Bespire Client Listbox --- */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm transition-all duration-300">
                    <button onClick={() => setIsClientOpen(!isClientOpen)} className="w-full flex items-center justify-between p-3">
                        <span className="font-medium text-sm text-gray-700 pl-2">Bespire Client</span>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isClientOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isClientOpen && (
                        <div className="px-3 pb-3">
                            <div className="relative mb-3">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Search size={20} className="text-gray-400" /></div>
                                <input type="text" placeholder="Search a client" value={clientSearchQuery} onChange={(e) => setClientSearchQuery(e.target.value)} className="w-full pl-4 pr-10 py-2 text-sm text-gray-700 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-gray-300 focus:outline-none placeholder-gray-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" checked={isAllClientsChecked} onChange={handleAllClientsChange} className="hidden" />
                                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${(isAllClientsChecked || isClientsIndeterminate) ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                        {isAllClientsChecked && <Check size={14} className="text-white" />}
                                        {isClientsIndeterminate && <Minus size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm text-gray-800 font-light">All</span>
                                </label>
                                {filteredClients.slice(0, visibleClientCount).map((client: Company) => (
                                    <label key={client._id} className="flex items-center space-x-3 cursor-pointer">
                                        <input type="checkbox" checked={!!checkedClients[client._id]} onChange={() => handleClientCheckboxChange(client._id)} className="hidden" />
                                        <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${checkedClients[client._id] ? 'bg-[#697d67] border-[#697d67]' : 'border-gray-300'}`}>
                                            {checkedClients[client._id] && <Check size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-800">{client.name}</span>
                                    </label>
                                ))}
                            </div>
                            {filteredClients.length > 5 && (visibleClientCount < filteredClients.length ? (<button onClick={handleSeeMoreClients} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">+</span> See more</button>) : (<button onClick={handleSeeLessClients} className="mt-3 text-sm font-semibold flex items-center text-black"><span className="text-2xl mr-1 font-light">−</span> See less</button>))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};