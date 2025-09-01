/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import ProgressLink from "@/components/ui/ProgressLink";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number;
  children?: MenuItem[];
};

export default function SidebarMenuSection({
  title,
  items,
}: {
  title?: string;
  items: MenuItem[];
}) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  // Helper function to check if a menu item is active
  const isActive = (path: string) => {
    // Make sure path is not null or undefined before calling startsWith
    if (!path) return false; 
    return pathname === path || pathname.startsWith(path + '/');
  };

  useEffect(() => {
    const openDefaults: Record<string, boolean> = {};
    items.forEach((item) => {
      // Special case for File Manager - expand if we're in any /files route
      if (item.label === "File Manager" && pathname.startsWith("/files")) {
        openDefaults[item.label] = true;
      }
      // General case - expand if any child is active
      else if (item.children?.some((sub) => isActive(sub.href))) {
        openDefaults[item.label] = true;
      }
    });

    // **THE FIX**: Only update state if the default open menus have actually changed.
    setOpenMenus((prevOpenMenus) => {
      const hasChanged = Object.keys(openDefaults).some(
        (key) => prevOpenMenus[key] !== openDefaults[key]
      );
      if (hasChanged) {
        return { ...prevOpenMenus, ...openDefaults };
      }
      return prevOpenMenus;
    });
  }, [pathname, items]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div>
      {title && (
        <p className="text-xs text-gray-400 uppercase px-3 mb-2 mt-10">
          {title}
        </p>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isSubOpen = openMenus[item.label] || false;
          const hasSubActive =
            item.children?.some((sub) => isActive(sub.href)) ?? false;

          return (
            <div key={item.label}>
              <div className={clsx(
                "w-full flex items-center justify-between text-[#5E6B66] group rounded-md hover:bg-[#CEFFA3] hover:text-[#181B1A] transition",
                (isActive(item.href) || hasSubActive) &&
                  "bg-[#CEFFA3] text-[#181B1A]"
              )}>
                <ProgressLink
                  href={item.href}
                  className="flex-1 flex items-center gap-2 px-3 py-2"
                >
                  <Icon
                    className={clsx(
                      "w-6 h-6 text-[#9FAAA5] group-hover:text-[#181B1A] transition",
                      (isActive(item.href) || hasSubActive) && "text-[#181B1A]"
                    )}
                  />
                  {item.label}
                </ProgressLink>

                {item.children ? (
                  <button
                    title={`Toggle submenu for ${item.label}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMenu(item.label);
                    }}
                    className="flex items-center justify-center w-8 h-full hover:bg-[#B8E89A] rounded-r-md transition"
                  >
                    <ChevronDown
                      className={clsx(
                        "w-4 h-4 transition-transform text-[#9FAAA5] group-hover:text-[#181B1A]",
                        isSubOpen && "rotate-180"
                      )}
                    />
                  </button>
                ) : item.badge ? (
                  <span className="text-xs bg-[#758C5D] text-white rounded-full px-2 py-0.5 mr-3">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              {item.children && isSubOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <ProgressLink
                        key={sub.label}
                        href={sub.href}
                        className={clsx(
                          "flex items-center gap-2 text-[#5E6B66] group rounded-md px-3 py-2 hover:bg-[#CEFFA3] hover:text-[#181B1A] transition",
                          isActive(sub.href) && "bg-[#CEFFA3] text-[#181B1A]"
                        )}
                      >
                        <SubIcon
                          className={clsx(
                            "w-5 h-5 text-[#9FAAA5] group-hover:text-[#181B1A]",
                            isActive(sub.href) && "text-[#181B1A]"
                          )}
                        />
                        {sub.label}
                      </ProgressLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}