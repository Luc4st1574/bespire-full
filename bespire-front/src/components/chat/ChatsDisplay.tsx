"use client";

import React, { useEffect, useRef, useState } from 'react';

import ChatHeader from './chatsdisplay/ChatHeader';
import ChatInput from './chatsdisplay/ChatInput';
import ImageViewer from './chatsdisplay/ImageViewer';
import MessageList from './chatsdisplay/MessageList'; // Corrected import
import { Chat, ConversationMessage, Attachment } from './chatsdisplay/types';

interface ChatsDisplayProps {
    chat: Chat | null;
}

export default function ChatsDisplay({ chat }: ChatsDisplayProps) {
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [imageViewer, setImageViewer] = useState({ isOpen: false, images: [] as Attachment[], currentIndex: 0 });

    useEffect(() => {
        if (chat) {
        setMessages(chat.conversation);
        }
    }, [chat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    const handleSendMessage = (text: string, attachments: Attachment[]) => {
        if (!chat) return;
        const newMessage: ConversationMessage = {
        sender: 'You',
        text: text,
        timestamp: new Date().toISOString(),
        attachments: attachments,
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const openImageViewer = (msgAttachments: Attachment[], currentId: string) => {
        const images = msgAttachments.filter(att => att.preview);
        const currentIndex = images.findIndex(img => img.id === currentId);
        if (currentIndex !== -1) {
        setImageViewer({
            isOpen: true,
            images: images,
            currentIndex: currentIndex,
        });
        }
    };

    const closeImageViewer = () => {
        setImageViewer({ isOpen: false, images: [], currentIndex: 0 });
    };

    if (!chat) return null;

    return (
        <div className="flex flex-col h-full w-full border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white">
        <ChatHeader chat={chat} />

        <MessageList // Correctly named component
            chat={chat}
            messages={messages}
            messagesEndRef={messagesEndRef}
            onImageClick={openImageViewer}
        />

        <ChatInput onSendMessage={handleSendMessage} />

        {imageViewer.isOpen && (
            <ImageViewer
            images={imageViewer.images}
            currentIndex={imageViewer.currentIndex}
            onClose={closeImageViewer}
            />
        )}
        </div>
    );
}