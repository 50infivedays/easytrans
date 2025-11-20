'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = '选择...',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 获取当前选中项的标签
    const selectedOption = options.find(option => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    // 点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 min-w-[60px] justify-between"
            >
                <span className="text-sm">{displayValue}</span>
                <ChevronDown
                    className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </Button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 first:rounded-t-md last:rounded-b-md ${option.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}; 