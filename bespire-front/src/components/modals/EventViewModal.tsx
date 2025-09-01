"use client";

import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, ChevronLeft, ChevronRight, Plus, ListFilter } from 'lucide-react';
import { EventCategory } from '@/app/calendar/page';
import { Event } from '@/components/calendar/CalendarMain';
import FilterPopover from '../ui/FilterPopover';
import { toISODateString } from '@/utils/getDates';
import EventDetailModal from './EventDetailModal';
import AddEventModal from './AddEventModal'; 

interface EventViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: Date;
    events: Event[];
    eventCategories: EventCategory[];
    onEventAdded?: (newEvent: Omit<Event, 'id'>) => void;
    onArchiveEvent: (eventId: string) => void;
    onDeleteEvent: (eventId: string) => void;
}

const darkGreen = "#697d67";

export default function EventViewModal({ isOpen, onClose, initialDate, events, eventCategories, onEventAdded, onDeleteEvent, onArchiveEvent }: EventViewModalProps) {
    const [displayDate, setDisplayDate] = useState(initialDate);
    const [activeFilters, setActiveFilters] = useState<string[]>(() => eventCategories.map(cat => cat.type));
    const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
    const dateRefs = useRef(new Map<string, HTMLDivElement | null>());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setDisplayDate(new Date(initialDate));
        }
    }, [isOpen, initialDate]);

    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleCloseAddModal = () => setIsAddModalOpen(false);

    const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
        if (onEventAdded) {
            onEventAdded(newEvent);
        }
        handleCloseAddModal();
    };

    const handleFilterToggle = (eventType: string) => {
        // Updated logic to handle 'All' toggle correctly
        if (eventType === 'All') {
            const allTypes = eventCategories.map(cat => cat.type);
            if (activeFilters.length === allTypes.length) {
                setActiveFilters([]);
            } else {
                setActiveFilters(allTypes);
            }
        } else {
            setActiveFilters(prev =>
                prev.includes(eventType)
                    ? prev.filter(type => type !== eventType)
                    : [...prev, eventType]
            );
        }
    };

    const handlePrevMonth = () => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setDisplayDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    
    const handleGoToToday = () => {
        const today = new Date();
        const todayString = toISODateString(today);
        
        setDisplayDate(today);
        setHighlightedDate(todayString);
        
        setTimeout(() => {
            const todayElement = dateRefs.current.get(todayString);
            if (todayElement) {
                todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        setTimeout(() => setHighlightedDate(null), 2000);
    };

    const monthlyEvents = useMemo(() => {
        return events.filter(event => {
            const eventDate = new Date(event.date.replace(/-/g, '/'));
            return eventDate.getFullYear() === displayDate.getFullYear() &&
                    eventDate.getMonth() === displayDate.getMonth() &&
                    activeFilters.includes(event.type);
        });
    }, [events, displayDate, activeFilters]);

    const groupedEvents = useMemo(() => {
        const groups = monthlyEvents.reduce((acc, event) => {
            (acc[event.date] = acc[event.date] || []).push(event);
            return acc;
        }, {} as Record<string, Event[]>);
        return groups;
    }, [monthlyEvents]);

    const sortedDates = useMemo(() => Object.keys(groupedEvents).sort(), [groupedEvents]);

    const formatDateHeader = (isoDate: string) => {
        const date = new Date(isoDate.replace(/-/g, '/'));
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
    };

    return (
        <>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-end p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-x-full" enterTo="opacity-100 translate-x-0" leave="ease-in duration-200" leaveFrom="opacity-100 translate-x-0" leaveTo="opacity-0 translate-x-full">
                                <Dialog.Panel className="w-full max-w-lg max-h-[calc(100vh-2rem)] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col relative">
                                    <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors" aria-label="Close event view">
                                        <X size={36} />
                                    </button>

                                    <div className="p-6 space-y-5">
                                        <div className="flex items-center gap-3 pt-2">
                                            <Dialog.Title as="h2" className="text-2xl font-light text-gray-800">Event View</Dialog.Title>
                                            <button onClick={handleGoToToday} className={`px-2 py-0.5 text-xs font-medium text-[${darkGreen}] bg-transparent border border-[${darkGreen}/50] rounded-full hover:bg-[${darkGreen}/10]`}>Today</button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <FilterPopover eventCategories={eventCategories} activeFilters={activeFilters} onFilterToggle={handleFilterToggle}>
                                                <button className={`flex items-center gap-2 px-2.5 py-1 text-sm font-medium text-[${darkGreen}] bg-transparent border border-[${darkGreen}/50] rounded-full hover:bg-[${darkGreen}/10]`}>
                                                    <span>Filter</span>
                                                    <ListFilter size={16} style={{ color: darkGreen }} />
                                                </button>
                                            </FilterPopover>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handlePrevMonth} className={`flex items-center justify-center w-7 h-7 border-[1px] border-[${darkGreen}] rounded-xl hover:bg-[${darkGreen}/10]`} aria-label="Previous Month"><ChevronLeft size={18} style={{ color: darkGreen }} /></button>
                                                <h3 className={`text-base font-semibold text-[${darkGreen}] w-24 text-center`}>{displayDate.toLocaleString('default', { month: 'short', year: 'numeric' })}</h3>
                                                <button onClick={handleNextMonth} className={`flex items-center justify-center w-7 h-7 border-[1px] border-[${darkGreen}] rounded-xl hover:bg-[${darkGreen}/10]`} aria-label="Next Month"><ChevronRight size={18} style={{ color: darkGreen }} /></button>
                                            </div>
                                            <button onClick={handleOpenAddModal} className={`flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-white bg-[${darkGreen}] rounded-full hover:bg-[#556654]`}>
                                                <span>Add</span>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-6"><div className="border-t border-gray-200"></div></div>

                                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
                                        {sortedDates.length > 0 ? (
                                            sortedDates.map(date => {
                                                const firstEvent = groupedEvents[date][0];

                                                return (
                                                    <div key={date} ref={(el) => { dateRefs.current.set(date, el); }} className={`mb-6 p-2 rounded-lg transition-colors duration-500 ${highlightedDate === date ? firstEvent.bgColor.replace('bg-', 'bg-opacity-20 ') : ''}`}>
                                                        <h4 className="text-lg font-light text-gray-800 mb-3">{formatDateHeader(date)}</h4>
                                                        <div className="space-y-2">
                                                            {groupedEvents[date].map((event, index) => (
                                                                <button 
                                                                    key={index} 
                                                                    onClick={() => setSelectedEvent(event)}
                                                                    className={`group w-full p-3 rounded-lg flex items-center justify-between text-left gap-3 transition-all ${event.bgColor} hover:brightness-95`}
                                                                >
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <div className={`w-1 h-full min-h-[2rem] rounded-full flex-shrink-0 ${event.rectColor}`}></div>
                                                                        <div className="flex-1">
                                                                            <p className="font-medium text-black text-sm truncate">{event.title}</p>
                                                                            {event.startTime && event.endTime && (
                                                                                <p className="text-xs text-gray-600">{event.startTime} - {event.endTime}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight
                                                                        size={20}
                                                                        className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-gray-500 mt-10">
                                                <p>No events to display with current filters.</p>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            
            <EventDetailModal 
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                event={selectedEvent}
                onDeleteEvent={onDeleteEvent}
                onArchiveEvent={onArchiveEvent}
            />
            
            <AddEventModal 
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onAddEvent={handleAddEvent}
                eventCategories={eventCategories}
                initialDate={displayDate} 
            />
        </>
    );
}