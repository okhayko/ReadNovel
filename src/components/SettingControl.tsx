import React from 'react';
import { MinusIcon, PlusIcon } from './Icons';

interface SettingControlProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    onDecrement: () => void;
    onIncrement: () => void;
}

const SettingControl: React.FC<SettingControlProps> = ({ icon, label, value, onDecrement, onIncrement }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
            {icon}
            <span className="text-app-text text-base sm:text-sm">{label}</span>
        </div>
        <div className="flex items-center bg-[#212121] rounded-full p-1 border border-white/5 shadow-inner">
            <button 
                onClick={onDecrement} 
                className="flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#2A2D2F] hover:bg-[#3A3F42] text-app-accent shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
                <MinusIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
            <span className="text-center w-20 sm:w-16 text-base sm:text-sm font-semibold text-app-text select-none">
                {value}
            </span>
            <button 
                onClick={onIncrement} 
                className="flex items-center justify-center w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-[#2A2D2F] hover:bg-[#3A3F42] text-app-accent shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
                <PlusIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
        </div>
    </div>
);

export default SettingControl;
