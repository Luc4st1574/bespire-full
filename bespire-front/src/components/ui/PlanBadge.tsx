/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface PlanBadgeProps {
  name: string;
  icon: string;
  className?: string;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ name, icon, className = '' }) => {
  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "growth":
        return "bg-[#F6F8F5] text-[#566644]";
      case "pro":
        return "bg-[#F3FEE7] text-[#566644]";
      case "starter":
        return "bg-[#EBF1FF] text-[#1F5ADF]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const badgeColor = getPlanBadgeColor(name);
  const bgClass = badgeColor.split(' ')[0]; // bg-*

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${bgClass}`}>
        <img src={icon} alt={name} />
      </div>
      <div className="text-sm font-medium text-[#353B38]">
        {name}
      </div>
    </div>
  );
};

export default PlanBadge;
