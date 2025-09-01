"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import chatsData from "@/data/chats.json";
import { parseTimeAgo } from "@/utils/parseTimeAgo";
import ProgressLink from "@/components/ui/ProgressLink";
import SidebarMenuSection from "./SidebarMenuSection";
import AccountDropdown from "@/components/ui/AccountDropdown";
import { useSidebarMenu } from "@/hooks/useSidebarMenu";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAppContext } from "@/context/AppContext";
import MessageSquare from "@/assets/icons/icon_send_feedback.svg";
import HelpCircle from "@/assets/icons/icon_helpcenter.svg";
import LogOut from "@/assets/icons/icon_logout.svg";
import FeedbackModal from "@/components/modals/FeedbackModal";

export default function Sidebar() {
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";

  const { mainMenu, exploreMenu, settingsMenu } = useSidebarMenu();
  const [showFeedback, setShowFeedback] = useState(false);
  const { user, workspace } = useAppContext();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const sortedChats = [...chatsData].sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const ChatList = () => (
    <div>
        <div className="px-3 mb-4">
            <h2 className="text-xl font-medium text-gray-800">Chats</h2>
            <div className="relative mt-2">
                <input type="text" placeholder="Search messages..." className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-300" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1 pr-2 max-h-[calc(100vh-350px)]">
          {sortedChats.map((chat) => (
            <ProgressLink key={chat.id} href={`/chat?id=${chat.id}`} className="block">
              <div className={`flex items-start gap-4 p-3 rounded-md cursor-pointer`}>
                <div className="relative flex-shrink-0">
                  <Image src={chat.avatar} alt={chat.name} width={40} height={40} className="rounded-full" />
                  {chat.isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#c2ef9b] ring-2 ring-white"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900 truncate">{chat.name}</p>
                    <p className="text-xs text-gray-500 flex-shrink-0">{parseTimeAgo(chat.timestamp)}</p>
                  </div>
                  <p className={`text-sm truncate mt-0.5 ${chat.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </ProgressLink>
          ))}
        </nav>
    </div>
  );

  return (
    <aside className="w-64 bg-[#FDFEFD] px-4 py-6 flex flex-col justify-between text-sm text-brand-dark">
      <div>
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
          <ChatList />
        ) : (
          <>
            <SidebarMenuSection items={mainMenu} />
            <SidebarMenuSection title="Explore" items={exploreMenu} />
          </>
        )}
      </div>

      <div className="space-y-3 mt-6">
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
      {showFeedback && <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} />}
    </aside>
  );
}