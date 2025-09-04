"use client";

import React from 'react';
import Image from 'next/image';
import { MoreHorizontal, Phone, Video } from 'lucide-react';
import { Chat } from './types';

interface ChatHeaderProps {
    chat: Chat;
}

export default function ChatHeader({ chat }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
            <div className="relative">
            <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="rounded-full" />
            <span className={`absolute bottom-0 right-0 block w-3 h-3 ${chat.isOnline ? 'bg-green-400' : 'bg-gray-400'} rounded-full border-2 border-white`}></span>
            </div>
            <div>
            <h2 className="font-semibold text-gray-800">{chat.name}</h2>
            <p className="text-sm text-gray-500">
                {chat.isOnline ? 'Active now' : 'Not active'}
            </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 text-[#496d74] rounded-full hover:bg-gray-100" title="Start video call">
            <Video className="w-6 h-6" fill="#496d74" />
            </button>
            <button className="p-2 text-[#496d74] rounded-full hover:bg-gray-100" title="Start voice call">
            <Phone className="w-5 h-5" fill="#496d74" />
            </button>
            <button className="p-2 text-[#496d74] rounded-full hover:bg-gray-100" title="More options">
            <MoreHorizontal className="w-5 h-5" fill="#496d74"/>
            </button>
        </div>
        </div>
    );
}