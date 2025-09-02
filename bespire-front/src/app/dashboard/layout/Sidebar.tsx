"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { parseTimeAgo } from "@/utils/parseTimeAgo";
import ProgressLink from "@/components/ui/ProgressLink";
import SidebarMenuSection from "./SidebarMenuSection";
import AccountDropdown from "@/components/ui/AccountDropdown";
import { useSidebarMenu } from "@/hooks/useSidebarMenu";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAppContext, Chat } from "@/context/AppContext";
import MessageSquare from "@/assets/icons/icon_send_feedback.svg";
import HelpCircle from "@/assets/icons/icon_helpcenter.svg";
import LogOut from "@/assets/icons/icon_logout.svg";
import FeedbackModal from "@/components/modals/FeedbackModal";

interface ChatListProps {
  chats: Chat[];
  selectedId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedId, searchTerm, onSearchChange }) => {
    const filteredChats = chats.filter((chat: Chat) =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="px-3 mb-4">
                <h2 className="text-lg font-medium text-black">Chats</h2>
                <div className="relative mt-2">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Chat"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-0"
                    />
                </div>
            </div>
            <nav className="flex-1 overflow-y-auto pr-2 border-t border-gray-200 no-scrollbar">
                {filteredChats.map((chat: Chat) => {
                    const isSelected = selectedId === String(chat.id);
                    return (
                        <ProgressLink key={chat.id} href={`/chat?id=${chat.id}`} className="block">
                            <div className={`flex items-start gap-4 p-3 cursor-pointer border-b border-gray-200 ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                                <div className="relative flex-shrink-0">
                                    <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="rounded-full" />
                                    {chat.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#c2ef9b] ring-2 ring-white"></span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{chat.name}</p>
                                        <p className="text-xs text-gray-500 flex-shrink-0">{parseTimeAgo(chat.timestamp)}</p>
                                    </div>
                                    <div className="flex justify-between items-start mt-1">
                                        {chat.lastMessage ? (
                                            <p className={`text-xs line-clamp-2 ${chat.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                                {chat.lastMessage}
                                            </p>
                                        ) : (
                                            <div>
                                                <p className="text-xs text-gray-500">{chat.name} joined the team</p>
                                                <p className="text-xs text-gray-500">Say hi!</p>
                                            </div>
                                        )}
                                        {chat.unreadCount > 0 && (
                                            <span className="flex-shrink-0 ml-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ProgressLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default function Sidebar() {
    const pathname: string = usePathname();
    const searchParams = useSearchParams();
    const isChatPage: boolean = pathname === "/chat";
    const selectedChatId: string | null = searchParams.get("id");

    const { mainMenu, exploreMenu, settingsMenu } = useSidebarMenu();
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const { user, workspace, chats, markChatAsRead } = useAppContext();
    const { logout } = useAuthActions();
    
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        if (selectedChatId) {
            markChatAsRead(parseInt(selectedChatId));
        }
    }, [selectedChatId, markChatAsRead]);

    const handleLogout = async (): Promise<void> => {
        try {
            await logout();
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };

    return (
        <aside className="w-64 bg-[#FDFEFD] px-4 py-6 flex flex-col h-screen text-sm text-brand-dark">
            <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-8">
                    <a href="/dashboard" title="Go to Dashboard">
                        <Image
                            src="/assets/logos/logo_bespire.svg"
                            alt="Bespire"
                            width={120}
                            height={32}
                            className="h-8"
                            priority
                        />
                    </a>
                </div>
                {isChatPage ? (
                    <ChatList 
                        chats={chats}
                        selectedId={selectedChatId} 
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <SidebarMenuSection items={mainMenu} />
                        <SidebarMenuSection title="Explore" items={exploreMenu} />
                    </div>
                )}
            </div>
            <div>
                <hr className="my-4 border-gray-200" />
                <div className="space-y-3">
                    <SidebarMenuSection items={settingsMenu} />
                    <AccountDropdown
                        workspace={workspace?.companyName}
                        role={user?.role || ""}
                        plan={'Pro'}
                        avatar={workspace?.companyImg}
                        items={[
                            { label: "Send Feedback", icon: MessageSquare, onClick: () => setShowFeedback(true) },
                            { label: "Help Center", icon: HelpCircle, onClick: () => console.log("Help Center") },
                            { label: "Log Out", icon: LogOut, onClick: handleLogout },
                        ]}
                    />
                </div>
            </div>
            {showFeedback && <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />}
        </aside>
    );
}