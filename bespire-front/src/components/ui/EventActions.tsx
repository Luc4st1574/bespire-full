"use client";

import { Fragment, ReactNode } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronRight } from 'lucide-react';

export interface SubMenuItem {
    label: string;
    onClick: () => void;
}

export interface EventActionItem {
    label?: string; 
    onClick?: () => void;
    isDestructive?: boolean;
    isSeparator?: boolean;
    subMenu?: SubMenuItem[];
}

interface EventActionsProps {
    items: EventActionItem[];
    children: ReactNode;
}

export default function EventActions({ items, children }: EventActionsProps) {
    return (
        <Popover className="relative">
        <Popover.Button as="div" className="focus:outline-none">
            {children}
        </Popover.Button>
        <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <Popover.Panel className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-2 z-10">
                {({ close: closeMainMenu }) => (
                <div className="flex flex-col">
                    {items.map((item, index) => {
                    if (item.isSeparator) {
                        return <hr key={index} className="my-2 border-gray-200" />;
                    }
                    
                    if (item.subMenu) {
                        return (
                        <Popover key={item.label} className="relative">
                            <Popover.Button className="flex items-center justify-between w-full rounded-md px-3 py-2 text-sm text-left text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none">
                            <span>{item.label}</span>
                            <ChevronRight size={16} className="text-gray-400" />
                            </Popover.Button>
                            <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                            >
                            <Popover.Panel className="absolute right-full top-[-8px] mr-2 w-48 origin-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none p-2 z-20">
                                {item.subMenu.map(subItem => (
                                <button
                                    key={subItem.label}
                                    onClick={() => {
                                        subItem.onClick();
                                        closeMainMenu();
                                    }}
                                    className="block w-full text-left rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors"
                                >
                                    {subItem.label}
                                </button>
                                ))}
                            </Popover.Panel>
                            </Transition>
                        </Popover>
                        );
                    }

                    return (
                        <button
                        key={item.label}
                        onClick={() => {
                            if (item.onClick) {
                                item.onClick();
                            }
                            closeMainMenu();
                        }}
                        className={`block w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                            item.isDestructive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-800 hover:bg-gray-100'
                        }`}
                        >
                        {item.label}
                        </button>
                    );
                    })}
                </div>
                )}
            </Popover.Panel>
        </Transition>
        </Popover>
    );
}