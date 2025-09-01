"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Send, Paperclip, MoreVertical } from 'lucide-react';

// Define interfaces for the chat data structure
interface ConversationMessage {
  sender: string;
  text: string;
  timestamp: string;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  conversation: ConversationMessage[];
}

interface ChatsDisplayProps {
  chat: Chat | null;
}

export default function ChatsDisplay({ chat }: ChatsDisplayProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.conversation]);

    if (!chat) return null;

    return (
        <div className="flex flex-col h-full w-full border-r border-gray-200">
            <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="rounded-full" />
                    <div>
                        <h2 className="font-semibold text-gray-800">{chat.name}</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${chat.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                            {chat.isOnline ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <button
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    title="More options"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {chat.conversation.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender !== 'You' && <Image src={chat.avatar} alt={chat.name} width={32} height={32} className="rounded-full"/>}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'You' ? 'bg-[#CEFFA3] text-gray-800 rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                            <p className="text-xs text-gray-400 mt-1 text-right">{msg.timestamp}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <button className="p-2 text-gray-500 hover:text-gray-700" title="Attach file">
                            <Paperclip className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <button className="p-2 text-white bg-gray-800 rounded-full hover:bg-black" title="Send message">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};