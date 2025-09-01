"use client";

import { Popover } from '@headlessui/react';
import { Check, Minus } from 'lucide-react';
import { EventType } from '@/types/calendar';
import { ReactNode } from 'react';

interface FilterPopoverProps {
    children: ReactNode;
    eventCategories: EventType[];
    activeFilters: string[];
    onFilterToggle: (category: string) => void;
}

export default function FilterPopover({
    children,
    eventCategories,
    activeFilters,
    onFilterToggle,
}: FilterPopoverProps) {
    const allCategory = { id: 'all-filter', name: 'All' };

    const areAllSelected = eventCategories.length > 0 && activeFilters.length === eventCategories.length;
    const areSomeSelected = activeFilters.length > 0 && !areAllSelected;

    return (
        <Popover className="relative">
            <Popover.Button as="div" className="focus:outline-none">
                {children}
            </Popover.Button>

            <Popover.Panel className="absolute z-10 mt-2 w-64 transform px-4 sm:px-0">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                    <div className="relative bg-white p-4 grid gap-3">
                        {eventCategories.length > 0 ? (
                            <>
                                <label key={allCategory.id} htmlFor={allCategory.name} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id={allCategory.name}
                                        checked={areAllSelected}
                                        onChange={() => onFilterToggle(allCategory.name)}
                                        className="sr-only"
                                    />
                                    <div
                                        style={{
                                            backgroundColor: areAllSelected || areSomeSelected ? '#697d67' : undefined,
                                            borderColor: areAllSelected || areSomeSelected ? '#697d67' : undefined
                                        }}
                                        className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 transition-colors"
                                    >
                                        {areAllSelected && (
                                            <Check
                                                data-state="checked"
                                                className="w-3.5 h-3.5 text-white"
                                                strokeWidth={3}
                                            />
                                        )}
                                        {areSomeSelected && (
                                            <Minus
                                                data-state="indeterminate"
                                                className="w-3.5 h-3.5 text-white"
                                                strokeWidth={3}
                                            />
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1 flex items-center text-sm font-medium text-gray-800">
                                        <span>All</span>
                                    </div>
                                </label>

                                {eventCategories.map((category: EventType) => {
                                    const isChecked = activeFilters.includes(category.name);
                                    const checkboxStyle = isChecked ? {
                                        backgroundColor: category.borderColor,
                                        borderColor: category.borderColor,
                                    } : {};

                                    return (
                                        <label key={category.id} htmlFor={category.name} className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                id={category.name}
                                                checked={isChecked}
                                                onChange={() => onFilterToggle(category.name)}
                                                className="sr-only"
                                            />
                                            <div
                                                style={checkboxStyle}
                                                className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 transition-colors"
                                            >
                                                <Check
                                                    data-state={isChecked ? 'checked' : 'unchecked'}
                                                    className="w-3.5 h-3.5 text-white hidden data-[state=checked]:block"
                                                    strokeWidth={3}
                                                />
                                            </div>
                                            <div className="ml-3 flex-1 flex items-center text-sm font-medium text-gray-800">
                                                <div
                                                    className="flex flex-1 items-center px-2 py-0.5 rounded"
                                                    style={{ backgroundColor: category.backgroundColor }}
                                                >
                                                    <span
                                                        className="w-1 h-3 mr-2"
                                                        style={{ backgroundColor: category.borderColor }}
                                                    ></span>
                                                    {category.name}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="text-sm text-gray-500 text-center">No event types to display.</div>
                        )}
                    </div>
                </div>
            </Popover.Panel>
        </Popover>
    );
}