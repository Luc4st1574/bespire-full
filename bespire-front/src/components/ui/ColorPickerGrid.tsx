"use client";

import { FC } from "react";

const nineColors = [
    { name: 'Black', hex: '#000000' }, { name: 'Dark Grey', hex: '#6c757d' }, { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#dc3545' }, { name: "Orange", hex: "#fd7e14" }, { name: 'Yellow', hex: '#ffc107' },
    { name: 'Green', hex: '#28a745' }, { name: 'Blue', hex: '#007bff' }, { name: 'Purple', hex: '#6f42c1' },
];

interface ColorPickerGridProps {
    onSelectColor: (color: string) => void;
}

const ColorPickerGrid: FC<ColorPickerGridProps> = ({ onSelectColor }) => (
    <div className="grid grid-cols-3 gap-3 p-2">
        {nineColors.map((color) => (
            <button
                key={color.hex}
                title={color.name}
                onClick={() => onSelectColor(color.hex)}
                className="w-8 h-8 rounded border border-gray-300 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                style={{ backgroundColor: color.hex }}
            />
        ))}
    </div>
);

export default ColorPickerGrid;