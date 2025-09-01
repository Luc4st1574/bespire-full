import React from "react";

type Priority = "low" | "medium" | "high" | "none";

const priorityStyles: Record<
  Priority,
  { bg: string; border: string; text: string }
> = {
  low: {
    bg: "bg-[#DEFCBD]",
    border: "bg-[#B8DF91]",
    text: "text-black font-medium",
  },
  medium: {
    bg: "bg-[#FEDAA0]",
    border: "bg-[#CA820E]",
    text: "text-black font-medium",
  },
  high: {
    bg: "bg-[#FF6A6A]",
    border: "bg-[#C70000]",
    text: "text-white font-medium",
  },
  none: {
    bg: "bg-[#F6F7F7]",
    border: "bg-[#F6F7F7]",
    text: "text-black font-medium",
  },
};

interface PriorityUIProps {
  priority: Priority;
  className?: string;
  children?: React.ReactNode; // Para agregar iconos como ChevronDown
}

export default function PriorityUI({ 
  priority, 
  className = "", 
  children 
}: PriorityUIProps) {
  const styles = priorityStyles[priority] || priorityStyles.none;
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-sm text-xs ${styles.bg} ${styles.text} min-w-[80px] ${className}`}
    >
      <span className={`w-1 h-5 rounded-sm mr-2 ${styles.border}`}></span>
      <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
      {children}
    </span>
  );
}

export { priorityStyles };
export type { Priority };
