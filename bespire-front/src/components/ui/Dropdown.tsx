"use client";

import React, { useState, useRef, useEffect } from "react";

interface DropdownItem {
    value: string;
    label: string;
}

interface DropdownProps {
    items: DropdownItem[];
    selectedValue?: string;
    placeholder?: string;
    variant?: "primary" | "outline" | "outlineG" | "ghost" | "white" | "green" | "green2" |
        "secondary" | "gray" | "transparent" | "greenBP";
    size?: "xs" | "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
    onChange?: (value: string) => void;
    onSelect?: (item: DropdownItem) => void;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    showChevron?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
    items = [],
    selectedValue = "",
    placeholder = "Select option",
    variant = "primary",
    size = "sm",
    className = "",
    disabled = false,
    onChange,
    onSelect,
    icon: Icon,
    showChevron = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<DropdownItem | null>(
        items.find(item => item.value === selectedValue) || null
    );
    const dropdownRef = useRef<HTMLDivElement>(null);

    const classes = {
        base: "relative inline-flex items-center justify-between font-medium cursor-pointer transition-all duration-200",
        variants: {
            primary: "bg-[#7B7E78] text-white hover:bg-[#697D67] rounded-full",
            outline: "border-2 border-black text-black rounded-full",
            outlineG: "border border-page-green-750 text-page-green-750 rounded-full",
            ghost: "text-black hover:underline rounded-full",
            white: "bg-white text-black rounded-full",
            green: "bg-lime-200 text-[#004049] rounded-full",
            green2: "bg-[#697D67] text-white hover:bg-[#697D67] rounded-full",
            secondary: "bg-[#7B7E78] text-white hover:bg-[#5A5C58] rounded-full",
            gray: "bg-[#E2E6E4] text-[#3F4744] hover:bg-[#C4CCC8] rounded-full",
            transparent: "rounded-full",
            greenBP: "border border-[#5B6F59] bg-[#F3FEE7] text-[#5B6F59] hover:bg-[#E2F3D9] rounded-full",
        },
        sizes: {
            xs: "px-2 py-1 text-xs min-w-[80px]",
            sm: "px-3 py-1 text-sm min-w-[100px]",
            md: "px-4 py-2 text-sm min-w-[100px]",
            lg: "px-6 py-3 text-base min-w-[140px]",
        },
        dropdown: {
            base: "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden",
            item: "px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150",
        }
    };

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (item: DropdownItem) => {
        setSelected(item);
        setIsOpen(false);
        onChange?.(item.value);
        onSelect?.(item);
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    // Resolve variant and size classes with proper typing
    const variantClass = classes.variants[variant as keyof typeof classes.variants];
    const sizeClass = classes.sizes[size as keyof typeof classes.sizes];
    const btnClass = `${classes.base} ${variantClass} ${sizeClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                className={btnClass}
                onClick={toggleDropdown}
                disabled={disabled}
            >
                {/* Label */}
                <span className="truncate">
                    {selected ? selected.label : placeholder}
                </span>
                {/* Icon or Chevron on the right */}
                {Icon ? (
                    <Icon className={`ml-2 h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-current`} />
                ) : (
                    showChevron && (
                        <svg
                            className={`ml-2 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={classes.dropdown.base}>
                    {items.map((item) => (
                        <div
                            key={item.value}
                            className={`${classes.dropdown.item} ${selected?.value === item.value ? 'bg-gray-100 font-medium' : ''}`}
                            onClick={() => handleSelect(item)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
