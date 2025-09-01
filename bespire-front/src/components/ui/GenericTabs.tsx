import React from 'react';

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface GenericTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function GenericTabs({ tabs, activeTab, onTabChange }: GenericTabsProps) {
  return (
    <div className="flex mt-2 border-b border-[#E2E6E4] overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-2 cursor-pointer md:px-5 py-2 text-xs md:text-sm font-medium border-b-2 flex items-center gap-1 md:gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === tab.id
              ? "border-[#181B1A] text-[#181B1A]"
              : "border-transparent text-gray-500"
          }`}
        >
          <span className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
