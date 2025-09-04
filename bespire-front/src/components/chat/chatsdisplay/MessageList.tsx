"use client";

import React from 'react';
import Image from 'next/image';
import { getFileIcon } from '@/utils/getFileIcon';
import { Chat, ConversationMessage, Attachment, currentUser } from './types';

interface MessageListProps {
    chat: Chat;
    messages: ConversationMessage[];
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    onImageClick: (attachments: Attachment[], attachmentId: string) => void;
}

const formatDateSeparator = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDateString = messageDate.toDateString();
    const todayDateString = today.toDateString();
    const yesterdayDateString = yesterday.toDateString();
    const time = messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (messageDateString === todayDateString) { return `Today ${time}`; }
    if (messageDateString === yesterdayDateString) { return `Yesterday ${time}`; }
    return messageDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};


export default function MessageList({ chat, messages, messagesEndRef, onImageClick }: MessageListProps) {
    return (
        <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 pt-0 bg-white no-scrollbar">
        {messages.length > 0 ? (
            <div className="space-y-6">
            {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const showDateSeparator = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();
                const isCurrentUser = msg.sender === 'You';
                const senderName = isCurrentUser ? currentUser.name : chat.name;
                const senderAvatar = isCurrentUser ? currentUser.avatar : chat.avatar;

                return (
                <React.Fragment key={index}>
                    {showDateSeparator && (
                    <div className="text-center my-4">
                        <span className="text-xs text-gray-500 px-3 py-1 rounded-full">
                        {formatDateSeparator(msg.timestamp)}
                        </span>
                    </div>
                    )}
                    <div className="flex items-start gap-4">
                    <Image src={senderAvatar} alt={senderName} width={40} height={40} className="rounded-full mt-1" />
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                        <h4 className="font-semibold text-gray-900">{senderName}</h4>
                        <p className="text-xs text-gray-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        </div>
                        {msg.text.trim() !== '<p><br></p>' && msg.text.trim() !== '' && (
                        <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: msg.text }} />
                        )}
                        {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {msg.attachments.map(att => (
                            att.preview ? (
                                <div key={att.id} className="relative w-36 h-36 cursor-pointer" onClick={() => onImageClick(msg.attachments!, att.id)}>
                                <Image src={att.preview} alt={att.file.name} layout="fill" objectFit="cover" className="rounded-lg" />
                                </div>
                            ) : (
                                <a key={att.id} href={URL.createObjectURL(att.file)} download={att.file.name} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg hover:bg-gray-200 max-w-[200px]">
                                <Image src={getFileIcon(att.file.name)} alt="file icon" width={24} height={24} className="w-6 h-6" />
                                <span className="text-sm truncate">{att.file.name}</span>
                                </a>
                            )
                            ))}
                        </div>
                        )}
                    </div>
                    </div>
                </React.Fragment>
                );
            })}
            <div ref={messagesEndRef} />
            </div>
        ) : (
            <div className="flex h-full flex-col items-center justify-start pt-4 gap-4 text-center pb-24">
            <div className="text-gray-500">
                <p>This is your first conversation</p>
                <p>with {chat.name}. Say hi!</p>
            </div>
            <span className="text-5xl">👋</span>
            </div>
        )}
        </div>
    );
}