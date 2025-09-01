"use client";

import React from "react";

export interface TabItem {
  value: string;
  label: string;
}

interface TabSelectorProps {
  items: TabItem[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
}

const TabSelector: React.FC<TabSelectorProps> = ({
  items,
  selectedValue,
  onChange,
  className = "",
  tabClassName = "",
  activeTabClassName = "",
}) => {
  const defaultClasses = {
    container: "flex items-center p-1 bg-white rounded-full border-2 border-[#CEFFA3]",
    tab: "px-6 py-2 text-sm font-medium  rounded-full transition-all duration-200",
    activeTab: "bg-[#CEFFA3] text-[#353B38] font-semibold",
  };

  // Merge provided classes with default classes
  const containerClass = `${defaultClasses.container} ${className}`;
  const inactiveTabClass = `${defaultClasses.tab} ${tabClassName}`;
  const activeTabClass = `${defaultClasses.tab} ${defaultClasses.activeTab} ${activeTabClassName}`;

  return (
    <div className={containerClass}>
      {items.map((item) => (
        <button
          key={item.value}
          className={selectedValue === item.value ? activeTabClass : inactiveTabClass}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default TabSelector;
