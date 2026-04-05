import React from 'react';
import { Chapter } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import CustomDropdown from './CustomDropdown';

interface ChapterNavigationProps {
    chapters: Chapter[];
    currentIndex: number;
    onChapterChange: (index: number) => void;
    dropdownDirection?: 'up' | 'down';
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({ 
    chapters, 
    currentIndex, 
    onChapterChange,
    dropdownDirection = 'down'
}) => {
    if (chapters.length <= 1) return null;
    
    const chapterOptions = chapters.map((chap, index) => ({
        value: index.toString(),
        label: chap.title
    }));

    return (
        <div className="flex items-center w-full mx-auto gap-2 sm:gap-6 p-2 rounded-xl">
            <button 
                onClick={() => onChapterChange(currentIndex - 1)} 
                disabled={currentIndex <= 0} 
                className="flex shrink-0 items-center justify-center w-10 sm:w-auto gap-2 text-white/70 hover:text-white font-sans text-xs sm:text-sm font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all no-glow"
                aria-label="Chương trước"
            >
                <ChevronLeftIcon />
                <span className="hidden sm:inline">Trước Đó</span>
            </button>

            <div className="relative flex-grow min-w-0 h-12 sm:h-11">
                <CustomDropdown
                    options={chapterOptions}
                    value={currentIndex.toString()}
                    onChange={(val) => onChapterChange(Number(val))}
                    placeholder="Chọn chương"
                    className="w-full h-full"
                    buttonClassName="bg-[#222426] h-full px-4 sm:px-5 text-base"
                    menuClassName="bg-[#222426]"
                    direction={dropdownDirection}
                />
            </div>

            <button 
                onClick={() => onChapterChange(currentIndex + 1)} 
                disabled={currentIndex >= chapters.length - 1} 
                className="flex shrink-0 items-center justify-center w-10 sm:w-auto gap-2 text-app-accent hover:brightness-125 font-sans text-xs sm:text-sm font-bold uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all no-glow"
                aria-label="Chương tiếp"
            >
                <span className="hidden sm:inline">Tiếp Theo</span>
                <ChevronRightIcon />
            </button>
        </div>
    );
};

export default ChapterNavigation;
