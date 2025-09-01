"use client";

import React from "react";
import Image from "next/image";
import { Popover, Transition } from "@headlessui/react";
import { useAppContext, Chat } from "@/context/AppContext";
import IconMessage from "@/assets/icons/icon_message.svg";
import ProgressLink from "../ui/ProgressLink";
import { parseTimeAgo } from "@/utils/parseTimeAgo";

export default function ChatPreview() {
  // Use chats and functions from the global context
  const { chats, markAllChatsAsRead } = useAppContext();

  const getPreviewChats = () => {
    const unreadChats = chats
      .filter((c) => c.unreadCount > 0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const readChats = chats
      .filter((c) => c.unreadCount === 0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const previewChats = unreadChats.slice(0, 4);

    if (previewChats.length < 4) {
      const needed = 4 - previewChats.length;
      previewChats.push(...readChats.slice(0, needed));
    }
    return previewChats;
  };

  const sortedChats = getPreviewChats();
  const unreadConversationsCount = chats.filter((c) => c.unreadCount > 0).length;

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`relative p-2 rounded-full transition ${
              open ? "bg-gray-100" : "hover:bg-gray-100"
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
            aria-label="Open messages"
            title="Messages"
          >
            <IconMessage className="w-5 h-5" />
            {unreadConversationsCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-xs font-bold text-gray-800 bg-[#c2ef9b] rounded-full"
                aria-label={`${unreadConversationsCount} unread messages`}
              >
                {unreadConversationsCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              static
              className="absolute top-full right-0 z-50 mt-4 w-96 -mr-16"
            >
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 bg-white border border-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <h3 className="font-normal text-lg text-gray-800">Messages</h3>
                  <button
                    onClick={markAllChatsAsRead}
                    className="text-sm text-black underline"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {sortedChats.map((chat: Chat) => (
                    <ProgressLink
                      key={chat.id}
                      href={`/chat?id=${chat.id}`}
                      onClick={() => close()}
                      className="block"
                    >
                      <div className="flex items-start gap-4 p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={chat.avatar}
                            alt={chat.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          {chat.isOnline && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#c2ef9b] ring-2 ring-white"></span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {chat.name}
                            </p>
                            {chat.unreadCount > 0 && (
                              <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-[#697d67]"></span>
                            )}
                          </div>

                          <div className="flex justify-between items-start mt-1">
                            <p className="text-sm text-gray-600 truncate pr-2">
                              {chat.lastMessage}
                            </p>
                            <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {parseTimeAgo(chat.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </ProgressLink>
                  ))}
                </div>

                <div className="p-3 flex justify-between items-center bg-white">
                  <ProgressLink href="/chat" onClick={() => close()} className="text-sm font-semibold text-black underline">
                    View all
                  </ProgressLink>
                  <ProgressLink
                    className="hover:underline text-sm text-[#353B38] flex items-center gap-1.5 cursor-pointer"
                    href={"/settings/preferences"}
                    onClick={() => close()}
                  >
                    <Image src="/assets/icons/mini_settings.svg" alt="settings icon" width={16} height={16} className="w-4 h-4" />
                    <span>Manage Notifications</span>
                  </ProgressLink>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}