"use client";

import React from "react";
import chatsData from "@/data/chats.json";
import ChatsDisplay from "@/components/chat/ChatsDisplay";
import ContactInfoPanel from "@/components/chat/ContactInfoPanel";
import IconMessage from "@/assets/icons/icon_message.svg";

// A component to show when no chat is selected.
const NoChatSelected = () => (
    <div className="flex flex-col items-center w-full text-center text-gray-500 pt-42">
        <IconMessage className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Welcome to your Messages</h2>
        <p>Select a conversation from the left to start chatting</p>
    </div>
);

export default function ChatPageMain({ chatId }: { chatId: string | null }) {
    const selectedChat = chatId
        ? chatsData.find((c) => c.id === parseInt(chatId))
        : null;

    return (
        <div className="flex flex-1">
        {selectedChat ? (
            <>
            <ChatsDisplay chat={selectedChat} />
            <ContactInfoPanel user={selectedChat} />
            </>
        ) : (
            <NoChatSelected />
        )}
        </div>
    );
}