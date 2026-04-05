import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

export interface Option {
    value: string;
    label: string;
    group?: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
    renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
    direction?: 'up' | 'down';
    centered?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
    options, 
    value, 
    onChange, 
    placeholder = "Chọn",
    className = "",
    buttonClassName = "bg-[#2A2D2F] px-3 py-2 text-base",
    menuClassName = "bg-[#1A1C1E]",
    renderOption,
    direction = 'down',
    centered = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const selectedOptionRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isOpen && selectedOptionRef.current && menuRef.current) {
            const scrollIntoView = () => {
                if (selectedOptionRef.current && menuRef.current) {
                    const parent = menuRef.current;
                    const child = selectedOptionRef.current;
                    
                    // Calculate the scroll position to put the selected item at the top
                    // child.offsetTop is relative to the offsetParent (which is the menu div)
                    // We subtract a small amount (e.g. 8px) to show a bit of context or just the item
                    const scrollPos = child.offsetTop - 8; 
                    parent.scrollTop = scrollPos;
                }
            };
            
            // Use a small timeout to ensure layout is complete before scrolling
            setTimeout(scrollIntoView, 50);
        }
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);

    // Extract background color from buttonClassName if possible, or use a default
    const bgMatch = buttonClassName.match(/bg-\[#([a-fA-F0-9]{6})\]/);
    const bgColor = bgMatch ? `#${bgMatch[1]}` : '#2A2D2F';

    // Xử lý click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Group options
    const groupedOptions = options.reduce((acc, option) => {
        const group = option.group || 'default';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(option);
        return acc;
    }, {} as Record<string, Option[]>);

    const hasGroups = Object.keys(groupedOptions).some(key => key !== 'default');

    const TriggerButton = (
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`group no-underline cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-xl p-px text-xs font-semibold leading-6 text-white inline-block w-full focus:outline-none transition-all active:scale-[0.98] ${className}`}
        >
            {/* Hover Glow Effect Layer */}
            <span className="absolute inset-0 overflow-hidden rounded-xl">
                <span className="absolute inset-0 rounded-xl bg-[image:radial-gradient(50%_50%_at_50%_0%,rgba(var(--app-accent-rgb),0.3)_0%,rgba(var(--app-accent-rgb),0)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
            </span>
            
            {/* Inner Content Container */}
            <div className={`relative flex items-center ${centered ? 'justify-center' : 'justify-between'} z-10 rounded-xl bg-[#1B1D1E] ring-1 ring-white/10 transition-all duration-200 ${isOpen ? 'ring-app-accent/50' : ''} ${buttonClassName.replace(/bg-\[#[a-fA-F0-9]{6}\]/, 'bg-transparent')}`}>
                <span className={`block truncate ${centered ? 'text-center' : ''} ${!selectedOption ? 'text-app-textMuted' : 'text-white'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                {!centered && (
                    <svg 
                        className={`w-5 h-5 text-app-textMuted transition-transform duration-200 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <motion.path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M19 9l-7 7-7-7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />
                    </svg>
                )}
            </div>
            
            {/* Top Gradient Line */}
            <span className="absolute -top-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-app-accent/0 via-app-accent/90 to-app-accent/0 opacity-0 transition-opacity duration-500 group-hover:opacity-40"></span>

            {/* Bottom Gradient Line */}
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-app-accent/0 via-app-accent/90 to-app-accent/0 opacity-40 transition-opacity duration-500"></span>
        </button>
    );

    return (
        <div className={`relative font-sans ${className}`} ref={dropdownRef}>
            {/* Nút bấm (Select Trigger) */}
            {TriggerButton}

            {/* Bảng chọn (Dropdown Menu) */}
            {isOpen && (
                <div 
                    ref={menuRef} 
                    className={`absolute z-50 w-full ${direction === 'up' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'} border border-white/10 rounded-xl shadow-2xl py-2 max-h-[75vh] overflow-y-auto overflow-x-hidden ${menuClassName}`}
                >
                    <div className="px-3 pb-2 mb-2 border-b border-white/5 text-xs font-bold text-app-textMuted uppercase tracking-wider">
                        {placeholder}
                    </div>
                    <ul className="flex flex-col gap-1 px-1">
                        {hasGroups ? (
                            Object.entries(groupedOptions).map(([group, groupOptions]: [string, Option[]]) => (
                                <React.Fragment key={group}>
                                    {group !== 'default' && (
                                        <li className="px-3 py-1.5 text-xs font-semibold text-app-textMuted/70 uppercase tracking-wider mt-1">
                                            {group}
                                        </li>
                                    )}
                                    {groupOptions.map((option) => (
                                        <li key={option.value}>
                                            <button
                                                type="button"
                                                ref={value === option.value ? selectedOptionRef : null}
                                                onClick={() => {
                                                    onChange(option.value);
                                                    setIsOpen(false);
                                                }}
                                                className={`w-full ${centered ? 'text-center' : 'text-left'} px-3 py-2.5 rounded-lg transition-colors duration-150 flex items-center ${centered ? 'justify-center' : 'justify-between'} ${
                                                    value === option.value 
                                                    ? 'bg-app-accent/10 text-app-accent font-medium' 
                                                    : 'text-app-text hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                {renderOption ? (
                                                    renderOption(option, value === option.value)
                                                ) : (
                                                    <span className="truncate">{option.label}</span>
                                                )}
                                                
                                                {/* Dấu checkmark cho mục được chọn */}
                                                {!centered && value === option.value && (
                                                    <svg className="w-4 h-4 text-app-accent flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </React.Fragment>
                            ))
                        ) : (
                            options.map((option) => (
                                <li key={option.value}>
                                    <button
                                        type="button"
                                        ref={value === option.value ? selectedOptionRef : null}
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full ${centered ? 'text-center' : 'text-left'} px-3 py-2.5 rounded-lg transition-colors duration-150 flex items-center ${centered ? 'justify-center' : 'justify-between'} ${
                                            value === option.value 
                                            ? 'bg-app-accent/10 text-app-accent font-medium' 
                                            : 'text-app-text hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {renderOption ? (
                                            renderOption(option, value === option.value)
                                        ) : (
                                            <span className="truncate">{option.label}</span>
                                        )}
                                        
                                        {/* Dấu checkmark cho mục được chọn */}
                                        {!centered && value === option.value && (
                                            <svg className="w-4 h-4 text-app-accent flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
