"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import CalendarMain from '@/components/calendar/CalendarMain';
import EventViewModal from '@/components/modals/EventViewModal';
import AddEventModal from '@/components/modals/AddEventModal';
import EventCreatedToast from '@/components/ui/EventCreatedToast';
import EventDetailModal from '@/components/modals/EventDetailModal';
import { showSuccessToast } from "@/components/ui/toast";
import { useCalendar } from '@/hooks/useCalendar';
import PermissionGuard from '@/guards/PermissionGuard';
import { PERMISSIONS } from '@/constants/permissions';
import { CalendarEvent as Event, EventType } from '@/types/calendar';

function CalendarView() {
    const {
        events,
        eventTypes,
        loading,
        setDateRange,
    } = useCalendar();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [isEventViewModalOpen, setIsEventViewModalOpen] = useState(false);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    
    // This state is kept for the untouched modal logic for now
    const [mockEvents, setMockEvents] = useState<Event[]>([]); 

    useEffect(() => {
        if (eventTypes.length > 0 && activeFilters.length === 0) {
            setActiveFilters(eventTypes.map((cat: EventType) => cat.name));
        }
    }, [eventTypes, activeFilters]);

    const handleDateChange = (newDate: Date) => {
        const date = new Date(newDate);
        date.setHours(12, 0, 0, 0);
        setCurrentDate(date);
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        setDateRange({ start, end });
    };

    const handleFilterToggle = (eventTypeName: string) => {
        if (eventTypeName === 'All') {
            const allTypes = eventTypes.map((cat: EventType) => cat.name);
            setActiveFilters(prev => prev.length === allTypes.length ? [] : allTypes);
        } else {
            setActiveFilters(prev =>
                prev.includes(eventTypeName)
                    ? prev.filter(type => type !== eventTypeName)
                    : [...prev, eventTypeName]
            );
        }
    };
    
    const filteredEvents = useMemo(() => {
        if (activeFilters.length === 0) return [];
        return events.filter((event: Event) => activeFilters.includes(event.eventType.name));
    }, [activeFilters, events]);

    // TODO: Connect the following handlers to the backend using the useCalendar hook
    const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
        const newEvent: Event = {
            ...eventData,
            id: crypto.randomUUID(),
        };
        setMockEvents(prev => [...prev, newEvent]);
        setIsAddEventModalOpen(false);

        const handleReview = () => {
            setSelectedEvent(newEvent);
            setIsDetailModalOpen(true);
        };

        toast.custom((t) => (
            <EventCreatedToast toastId={t} onReview={handleReview} />
        ), { duration: 6000 });
    };

    const handleUpdateEvent = (updatedEvent: Event) => {
        setMockEvents(prevEvents => 
            prevEvents.map(event => 
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
        showSuccessToast("Event updated successfully!");
    };

    const handleDeleteEvent = (eventId: string) => {
        setMockEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        showSuccessToast("Event deleted!");
    };

    const handleArchiveEvent = (eventId: string) => {
        setMockEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        showSuccessToast("Event archived!");
    };
    
    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Calendar...</div>;
    }

    return (
        <>
            <CalendarMain
                events={filteredEvents}
                currentDate={currentDate}
                onPrevMonth={() => handleDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                onNextMonth={() => handleDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                onDateChange={handleDateChange}
                onGoToToday={() => handleDateChange(new Date())}
                eventCategories={eventTypes}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
                onSeeAllEvents={() => setIsEventViewModalOpen(true)}
                onAddEvent={() => setIsAddEventModalOpen(true)}
            />
            
            <EventViewModal
                isOpen={isEventViewModalOpen}
                onClose={() => setIsEventViewModalOpen(false)}
                initialDate={currentDate}
                events={mockEvents}
                eventCategories={eventTypes}
                onEventAdded={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onArchiveEvent={handleArchiveEvent}
            />

            <AddEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
                onAddEvent={handleAddEvent}
                eventCategories={eventTypes}
                initialDate={currentDate}
            />

            <EventDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                event={selectedEvent}
                onArchiveEvent={handleArchiveEvent}
                onDeleteEvent={handleDeleteEvent}
                onUpdateEvent={handleUpdateEvent}
                eventCategories={eventTypes}
            />
        </>
    );
}

export default function CalendarPage() {
    return (
        <PermissionGuard required={PERMISSIONS.VIEW_CALENDAR_EVENTS}>
            <DashboardLayout>
                <CalendarView />
            </DashboardLayout>
        </PermissionGuard>
    );
}