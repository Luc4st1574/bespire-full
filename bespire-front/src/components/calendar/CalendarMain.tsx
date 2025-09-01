"use client";

import { useMemo } from 'react';
import { generateCalendarDays } from '@/utils/getDates';
import CalendarHeader from './CalendarHeader';
import SidebarCalendar from './CalendarSidebar';
import CalendarGrid from './CalendarGrid';
import { EventType, CalendarEvent as Event } from '@/types/calendar';

interface CalendarMainProps {
    events: Event[];
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onDateChange: (date: Date) => void;
    onGoToToday: () => void;
    eventCategories: EventType[];
    activeFilters: string[];
    onFilterToggle: (category: string) => void;
    onSeeAllEvents: () => void;
    onAddEvent: () => void;
}

export default function CalendarMain({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onDateChange,
    onGoToToday,
    eventCategories,
    activeFilters,
    onFilterToggle,
    onSeeAllEvents,
    onAddEvent,
}: CalendarMainProps) {

    const calendarDays = useMemo(() => generateCalendarDays(currentDate), [currentDate]);

    return (
        <div className="h-full flex flex-col">
            <div className="px-4">
                <CalendarHeader 
                    currentDate={currentDate}
                    onPrevMonth={onPrevMonth}
                    onNextMonth={onNextMonth}
                    onGoToToday={onGoToToday}
                    eventCategories={eventCategories}
                    activeFilters={activeFilters}
                    onFilterToggle={onFilterToggle}
                    onSeeAllEvents={onSeeAllEvents}
                    onAddEvent={onAddEvent}
                />
            </div>
            <div className="flex flex-1 mt-4 px-4 pb-4 gap-4">
                <SidebarCalendar 
                    selectedDate={currentDate}
                    onDateSelect={onDateChange} 
                />
                {/* The 'events' prop is no longer passed to CalendarGrid */}
                <CalendarGrid 
                    days={calendarDays} 
                    selectedDate={currentDate}
                    onDateSelect={onDateChange}
                    currentDate={currentDate}
                />
            </div>
            <div className="border-t border-t-[#fbfff7] pt-[500px]">
            </div>
        </div>
    );
}