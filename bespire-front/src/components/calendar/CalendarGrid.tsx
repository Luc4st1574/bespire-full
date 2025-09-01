"use client";

import React, { useMemo, useEffect } from 'react';
import { CalendarEvent as Event } from '@/types/calendar';
import { toISODateString, Day } from '@/utils/getDates';
import CalendarPopover from '../ui/EventsPopover';
import { useCalendar } from '@/hooks/useCalendar';

interface CalendarGridProps {
    days: Day[];
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    currentDate: Date;
}

export default function CalendarGrid({ days, selectedDate, onDateSelect, currentDate }: CalendarGridProps) {
    const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
    const selectedDateString = toISODateString(selectedDate);
    const { events, loading, error, setDateRange } = useCalendar();

    useEffect(() => {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        setDateRange({ start, end });
    }, [currentDate, setDateRange]);

    const eventsByDate = useMemo(() => {
        const eventMap: Record<string, Event[]> = {};
        if (!events) return eventMap;

        for (const event of events) {
            // FIX: Changed event.start to event.startDate and event.end to event.endDate
            const start = new Date(event.startDate);
            const end = event.endDate ? new Date(event.endDate) : start;

            // This logic is safer when dealing with UTC dates to avoid timezone issues.
            const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
            const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

            while (current <= last) {
                const dateStr = toISODateString(new Date(current.toISOString().slice(0, 10).replace(/-/g, '/'))); // Ensure correct parsing
                if (!eventMap[dateStr]) {
                    eventMap[dateStr] = [];
                }
                eventMap[dateStr].push(event);
                current.setUTCDate(current.getUTCDate() + 1); // Iterate by UTC day
            }
        }
        return eventMap;
    }, [events]);

    if (loading) {
        return <div className="flex-1 flex items-center justify-center">Loading events...</div>;
    }

    if (error) {
        return <div className="flex-1 flex items-center justify-center text-red-500">Error: {error.message}</div>;
    }

    return (
        <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-200">
                {dayHeaders.map(header => (
                    <div key={header} className="p-2 text-xs font-bold text-center text-gray-500 uppercase">
                        {header}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {days.map((day, index) => {
                    const dailyEvents = eventsByDate[day.date] || [];
                    const eventsToShow = dailyEvents.slice(0, 2);
                    const remainingEvents = dailyEvents.length - eventsToShow.length;
                    const isSelected = selectedDateString === day.date;
                    const columnIndex = index % 7;

                    return (
                        <CalendarPopover
                            key={index}
                            events={dailyEvents}
                            date={day.date}
                            columnIndex={columnIndex}
                        >
                            <div
                                onClick={() => {
                                    onDateSelect(new Date(day.date.replace(/-/g, '/')));
                                }}
                                className={`h-32 border-b border-r border-gray-200 p-2 flex flex-col justify-between hover:bg-gray-50 transition-colors duration-200 ${!day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'}`}
                            >
                                <span className={`self-start text-sm ${day.isCurrentMonth ? 'text-gray-800' : 'text-gray-300'} ${
                                    isSelected ? 'bg-[#697d67] text-white rounded-full w-6 h-6 flex items-center justify-center' : ''
                                }`}>
                                    {day.dayOfMonth}
                                </span>
                                <div className="flex flex-col gap-1 overflow-hidden">
                                    {eventsToShow.map((event, eventIndex) => (
                                        <div key={eventIndex} style={{ backgroundColor: event.eventType.backgroundColor }} className={`flex items-center w-full p-1 rounded-md text-xs`}>
                                            <div style={{ backgroundColor: event.eventType.borderColor }} className={`w-1 h-3 rounded-full mr-2`}></div>
                                            <span className={`text-black flex-1 truncate`}>{event.title}</span>
                                        </div>
                                    ))}
                                    {remainingEvents > 0 && (
                                        <div className="flex items-center w-full p-1 rounded-md text-xs bg-gray-100">
                                            <div className="w-1 h-3 rounded-full mr-2 bg-gray-400"></div>
                                            <span className="text-black flex-1 truncate">+ {remainingEvents} more</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CalendarPopover>
                    );
                })}
            </div>
        </div>
    );
};