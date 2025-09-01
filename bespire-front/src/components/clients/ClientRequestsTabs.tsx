import React from 'react';

import IconRequests from "@/assets/icons/requests.svg";
import IconInProgress from "@/assets/icons/in_progress.svg";
import IconPending from "@/assets/icons/pending.svg";
import IconCompleted from "@/assets/icons/completed.svg";

interface Tab {
  id: string;
  label: string;
  count: number;
}

interface ClientRequestsTabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  tabs: Tab[];
}

const iconMap: Record<string, React.ReactNode> = {
  all: <IconRequests className="w-4 h-4 text-[#697D67]" />,
  in_progress: <IconInProgress className="w-4 h-4 text-[#697D67]" />,
  pending: <IconPending className="w-4 h-4 text-[#697D67]" />,
  completed: <IconCompleted className="w-4 h-4 text-[#697D67]" />,
};

const ClientRequestsTabs: React.FC<ClientRequestsTabsProps> = ({
  activeTab,
  onChange,
  tabs
}) => {
  return (
    <div className="w-full grid grid-cols-4 bg-[#F6F7F7]">
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-start space-x-1 px-4 py-2 text-sm font-medium cursor-pointer
              ${isActive
                ? "bg-white border-t-4 border-[#004049]"
                : "text-black"
              }
            `}
            style={{ 
              borderRight: index !== tabs.length - 1 ? "1px solid #d1d5db" : "none" 
            }}
          >
            <div className="flex items-center gap-2">
              {iconMap[tab.id] || iconMap.all}
              <span className="text-[#5E6B66] text-base">{tab.label}</span>
            </div>
            <span className="text-xl font-semibold">
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ClientRequestsTabs;
