"use client";

import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { X, ChevronRight } from 'lucide-react';
import { CalendarEvent as Event } from '@/types/calendar';

interface CalendarPopoverProps {
    events: Event[];
    date: string;
    children: React.ReactNode;
    columnIndex: number;
}

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    };
    return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', options);
};

export default function CalendarPopover({ events, date, children, columnIndex }: CalendarPopoverProps) {

    const getPanelPositionClass = () => {
        if (columnIndex > 4) {
            return 'right-0';
        }
        if (columnIndex < 2) {
            return 'left-0';
        }
        return 'left-1/2 -translate-x-1/2';
    };

    return (
        <>
            <Popover className="relative">
                <Popover.Button
                    as="div"
                    className={`focus:outline-none ${events.length > 0 ? 'cursor-pointer' : ''}`}
                    disabled={events.length === 0}
                >
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
                    <Popover.Panel className={`absolute z-20 w-64 rounded-lg bg-white p-4 shadow-lg mt-2 ${getPanelPositionClass()}`}>
                        {({ close }) => (
                            <>
                                <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900">{formatDate(date)}</h3>
                                    <button
                                        onClick={() => close()}
                                        className="p-1 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100"
                                        aria-label="Close"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {events.map((event, eventIndex) => (
                                        <button
                                            key={eventIndex}
                                            onClick={() => {
                                                // TODO: This will open the EventDetailModal
                                                close();
                                            }}
                                            className={`group flex w-full items-center justify-between p-2 rounded-lg text-sm text-left transition-all`}
                                            style={{ backgroundColor: event.eventType.backgroundColor }}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div style={{ backgroundColor: event.eventType.borderColor }} className={`w-1.5 h-auto self-stretch rounded-full`}></div>
                                                <div className="flex-1">
                                                    <p className="text-black font-medium truncate">{event.title}</p>
                                                    {event.start && event.end && (
                                                        <p className="text-xs text-gray-600 mt-0.5">
                                                            {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight
                                                size={16}
                                                className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </Popover.Panel>
                </Transition>
            </Popover>
        </>
    );
}