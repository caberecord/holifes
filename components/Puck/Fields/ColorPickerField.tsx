'use client';

import React from 'react';

interface ColorPickerFieldProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export const ColorPickerField = ({ value, onChange, label }: ColorPickerFieldProps) => {
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-300 shadow-sm flex-shrink-0">
                    <input
                        type="color"
                        value={value || '#ffffff'}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                    />
                </div>
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
        </div>
    );
};
