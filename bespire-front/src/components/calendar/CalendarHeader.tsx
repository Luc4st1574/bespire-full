"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, Plus, ListFilter } from 'lucide-react';
import FilterPopover from '../ui/FilterPopover';
import { EventType } from '@/types/calendar';
import { usePermission } from '@/hooks/usePermission';
import { PERMISSIONS } from '@/constants/permissions';

interface CalendarHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onGoToToday: () => void;
    eventCategories: EventType[];
    activeFilters: string[];
    onFilterToggle: (category: string) => void;
    onSeeAllEvents: () => void;
    onAddEvent: () => void;
}

const darkGreen = "#697d67";

export default function CalendarHeader({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onGoToToday,
    eventCategories,
    activeFilters,
    onFilterToggle,
    onSeeAllEvents,
    onAddEvent,
}: CalendarHeaderProps) {
    const canCreateEvents = usePermission(PERMISSIONS.CREATE_CALENDAR_EVENTS);

    return (
        <div className="flex items-center justify-between -mt-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={onGoToToday}
                    className={`px-4 py-2 text-sm font-medium text-[${darkGreen}] bg-transparent border border-[${darkGreen}/40] rounded-full hover:bg-[${darkGreen}/10]`}
                >
                    Today
                </button>

                <FilterPopover
                    eventCategories={eventCategories}
                    activeFilters={activeFilters}
                    onFilterToggle={onFilterToggle}
                >
                    <button className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-[${darkGreen}] bg-transparent border border-[${darkGreen}/40] rounded-full hover:bg-[${darkGreen}/10]`}>
                        <span>Filter</span>
                        <ListFilter size={16} style={{ color: darkGreen }} />
                    </button>
                </FilterPopover>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={onPrevMonth} 
                    className={`flex items-center justify-center w-8 h-8 border border-[${darkGreen}/40] rounded-full hover:bg-[${darkGreen}/10]`} 
                    aria-label="Previous Month"
                >
                    <ChevronLeft size={20} style={{ color: darkGreen }} />
                </button>
                <h2 className={`text-lg font-semibold text-[${darkGreen}] w-28 text-center`}>
                    {currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                </h2>
                <button 
                    onClick={onNextMonth} 
                    className={`flex items-center justify-center w-8 h-8 border border-[${darkGreen}/40] rounded-full hover:bg-[${darkGreen}/10]`} 
                    aria-label="Next Month"
                >
                    <ChevronRight size={20} style={{ color: darkGreen }} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={onSeeAllEvents}
                    className={`px-4 py-2 text-sm font-medium text-[${darkGreen}] bg-transparent border border-[${darkGreen}/40] rounded-full hover:bg-[${darkGreen}/10]`}
                >
                    See all events
                </button>
                {canCreateEvents && (
                    <button 
                        onClick={onAddEvent} 
                        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[${darkGreen}] rounded-full hover:bg-[#556654]`}
                    >
                        <span>Add</span>
                        <Plus size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}