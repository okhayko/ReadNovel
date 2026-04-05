import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ReadState, CustomFont } from '../types';
import DialogueLine from './DialogueLine';
import GooeyNav from './GooeyNav';
import CustomDropdown from './CustomDropdown';
import { 
    SettingsIcon, 
    LineHeightIcon, 
    ParagraphSpacingIcon, 
    FontSizeIcon, 
    FontIcon, 
    HeadingFontIcon,
    UploadIcon,
    WidthIcon, 
    ChatBubbleIcon, 
    ArrowUpIcon, 
    ArrowDownIcon,
    PaletteIcon,
    PauseIcon,
    PlayIcon
} from './Icons';
import { motion, AnimatePresence } from 'motion/react';
import SettingControl from './SettingControl';
import ChapterNavigation from './ChapterNavigation';
import ColorPicker from './ColorPicker';
import { InteractiveHoverButton } from './InteractiveHoverButton';
import TTSPlayerDesktop from './TTSPlayerDesktop';
import FloatingPauseButton from './FloatingPauseButton';

interface ReadViewProps {
    readState: ReadState;
    setReadState: React.Dispatch<React.SetStateAction<ReadState>>;
    customFonts: CustomFont[];
    setCustomFonts: React.Dispatch<React.SetStateAction<CustomFont[]>>;
    onBack: () => void;
}

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50];
const LINE_HEIGHTS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.0];
const PARAGRAPH_SPACINGS = [-12, -8, -4, 0, 4, 8, 12, 16, 20, 24, 32, 40, 48];
const FONTS = ['Sora', 'Oswald-Light', 'Oswald-Medium', 'Gelasio-Regular', 'Texturina_48pt-Bold', 'Tahoma', 'Arial', 'Verdana', 'Georgia', 'Times New Roman'];
const CONTAINER_WIDTHS = [700, 800, 910, 1000, 1100];

const ReadViewDesktop: React.FC<ReadViewProps> = ({ readState, setReadState, customFonts, setCustomFonts, onBack }) => {
    const { readerChapters, currentReaderChapterIndex, settings } = readState;
    const { fontSizeIndex, lineHeightIndex, fontFamily, titleFontFamily, paragraphSpacingIndex, backgroundColor } = settings;
    
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const currentContainerWidth = Math.min(
        settings.containerWidth || CONTAINER_WIDTHS[settings.containerWidthIndex || 2],
        windowWidth - 100
    );
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [ttsIndex, setTtsIndex] = useState(0);
    const [isTTSPlaying, setIsTTSPlaying] = useState(false);
    const lastScrollY = useRef(0);
    const initialColorRef = useRef(backgroundColor || '#1B1D1E');
    
    const settingsRef = useRef<HTMLDivElement>(null);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isSettingsVisible && !isColorPickerVisible &&
                settingsRef.current && 
                !settingsRef.current.contains(event.target as Node) &&
                settingsButtonRef.current &&
                !settingsButtonRef.current.contains(event.target as Node)) {
                setIsSettingsVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSettingsVisible, isColorPickerVisible]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                // Scrolling down
                setIsHeaderVisible(false);
                setIsSettingsVisible(false); // Close settings when scrolling down
            } else if (currentScrollY < lastScrollY.current) {
                // Scrolling up
                setIsHeaderVisible(true);
            }
            
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input field (just in case)
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                if (currentReaderChapterIndex > 0) {
                    handleChapterChange(currentReaderChapterIndex - 1);
                }
            } else if (e.key === 'ArrowRight') {
                if (currentReaderChapterIndex < readerChapters.length - 1) {
                    handleChapterChange(currentReaderChapterIndex + 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentReaderChapterIndex, readerChapters.length]);

    const handleChapterChange = (index: number) => {
        setReadState(prev => ({ ...prev, currentReaderChapterIndex: index }));
        window.scrollTo(0, 0);
    };

    const handleWidthDecrement = () => {
        setReadState(p => {
            const current = p.settings.containerWidth || CONTAINER_WIDTHS[p.settings.containerWidthIndex || 2];
            return {...p, settings: {...p.settings, containerWidth: Math.max(400, current - 100)}};
        });
    };

    const handleWidthIncrement = () => {
        setReadState(p => {
            const current = p.settings.containerWidth || CONTAINER_WIDTHS[p.settings.containerWidthIndex || 2];
            const maxWidth = windowWidth - 100;
            return {...p, settings: {...p.settings, containerWidth: Math.min(maxWidth, current + 100)}};
        });
    };

    const openColorPicker = () => {
        initialColorRef.current = settings.backgroundColor || '#1B1D1E';
        setIsColorPickerVisible(true);
    };

    const closeColorPicker = () => {
        // Revert to initial color if cancelled
        setReadState(p => ({...p, settings: {...p.settings, backgroundColor: initialColorRef.current}}));
        setIsColorPickerVisible(false);
    };

    const confirmColorPicker = (color: string) => {
        setReadState(p => {
            const currentRecents = p.settings.recentColors || ['#F4ECD8', '#E3EDCD', '#E8E9EA', '#1B1D1E', '#000000', '#FFFFFF'];
            let newRecents = currentRecents;
            // Only update recent colors if it's not already the first one
            if (currentRecents[0] !== color) {
                newRecents = [color, ...currentRecents.filter(c => c !== color)].slice(0, 6);
            }
            return {
                ...p, 
                settings: {
                    ...p.settings, 
                    backgroundColor: color,
                    recentColors: newRecents
                }
            };
        });
        setIsColorPickerVisible(false);
    };

    const currentChapter = readerChapters[currentReaderChapterIndex];

    // Helper to split content into segments for TTS and highlighting
    const segments = useMemo(() => {
        if (!currentChapter?.content) return [];
        return currentChapter.content
            .split(/\n|(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }, [currentChapter?.content]);

    // Auto-scroll to current TTS segment
    useEffect(() => {
        if (isTTSPlaying) {
            const activeElement = document.querySelector(`[data-tts-index="${ttsIndex}"]`);
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [ttsIndex, isTTSPlaying]);

    // Reset TTS when chapter changes
    useEffect(() => {
        setTtsIndex(0);
        setIsTTSPlaying(false);
    }, [currentReaderChapterIndex]);

    return (
        <div className="relative min-h-screen text-app-text" style={{ backgroundColor: backgroundColor || '#1B1D1E' }}>
            <header 
                className={`fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center backdrop-blur-lg border-b transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}
                style={{ 
                    backgroundColor: `${backgroundColor || '#1B1D1E'}99`,
                    borderColor: backgroundColor || '#1B1D1E'
                }}
            >
                <div className="flex space-x-2 flex-1">
                    <InteractiveHoverButton 
                        onClick={onBack}
                        className="text-sm"
                    >
                        Thư viện
                    </InteractiveHoverButton>
                </div>
                {currentChapter && (
                    <div className="flex-1 text-center truncate px-4">
                        <span className="text-white font-medium truncate" style={{ fontFamily: titleFontFamily || 'Texturina_48pt-Bold' }}>
                            {currentChapter.title}
                        </span>
                    </div>
                )}
                <div className="flex space-x-2 flex-1 justify-end" ref={settingsButtonRef}>
                    <GooeyNav 
                        initialActiveIndex={-1}
                        shape="square"
                        itemClassName="w-10 h-10 flex items-center justify-center p-0 border border-white/10 bg-[#2A2D2F] hover:border-white/20"
                        items={[
                            { 
                                label: <SettingsIcon />, 
                                onClick: () => setIsSettingsVisible(prev => !prev) 
                            }
                        ]} 
                    />
                </div>
            </header>
            
            <div className="pt-24 pb-8 px-8">
                {currentChapter && (
                    <>
                        <div className="max-w-3xl mx-auto mb-8">
                            <ChapterNavigation 
                                chapters={readerChapters} 
                                currentIndex={currentReaderChapterIndex} 
                                onChapterChange={handleChapterChange} 
                                dropdownDirection="down"
                            />
                        </div>
                        
                        {/* Independent TTS Player Area */}
                        <div className="max-w-3xl mx-auto mb-8 sticky top-[88px] z-10">
                            <TTSPlayerDesktop 
                                content={currentChapter.content}
                                currentIndex={ttsIndex}
                                onIndexChange={setTtsIndex}
                                isPlaying={isTTSPlaying}
                                setIsPlaying={setIsTTSPlaying}
                                settings={settings}
                            />
                        </div>
                    </>
                )}
                <div className="flex justify-center py-8">
                    <div className="transition-all duration-300" style={{ maxWidth: `${currentContainerWidth}px`, width: '100%' }}>
                        {currentChapter ? (
                            <article style={{ fontSize: `${FONT_SIZES[fontSizeIndex]}px`, lineHeight: LINE_HEIGHTS[lineHeightIndex], fontFamily: fontFamily }} className="text-[#D7D5D1]">
                                <div className="mb-12">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-app-textMuted uppercase tracking-[0.2em] mb-4">
                                        <span>{readState.storyName || 'The Silent Echoes'}</span>
                                    </div>
                                    <h1 
                                        style={{ fontFamily: titleFontFamily || 'Playfair Display' }} 
                                        className="text-[64px] leading-[1.1] font-bold text-white mb-6"
                                    >
                                        {currentChapter.title}
                                    </h1>
                                    <div className="w-16 h-1 bg-app-accent/60 rounded-full"></div>
                                </div>

                                {currentChapter.content.split('\n').map((paragraph, pIdx) => {
                                    if (!paragraph.trim()) return <div key={pIdx} className="h-4" />;
                                    
                                    const paragraphSegments = paragraph.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
                                    
                                    let segmentGlobalOffset = 0;
                                    for (let i = 0; i < pIdx; i++) {
                                        const prevPara = currentChapter.content.split('\n')[i];
                                        if (prevPara.trim()) {
                                            segmentGlobalOffset += prevPara.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0).length;
                                        }
                                    }

                                    return (
                                        <div key={pIdx} style={{ marginBottom: `${PARAGRAPH_SPACINGS[paragraphSpacingIndex]}px` }}>
                                            {paragraphSegments.map((segment, sIdx) => {
                                                const globalIdx = segmentGlobalOffset + sIdx;
                                                const isHighlighted = isTTSPlaying && ttsIndex === globalIdx;
                                                
                                                return (
                                                    <span 
                                                        key={sIdx}
                                                        data-tts-index={globalIdx}
                                                        className={`transition-all duration-300 rounded px-1 -mx-1 ${isHighlighted ? 'bg-app-accent/20 text-white shadow-[0_0_15px_rgba(var(--app-accent-rgb),0.3)]' : ''}`}
                                                    >
                                                        <DialogueLine line={segment} settings={settings} isHighlighted={isHighlighted} />
                                                        {' '}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </article>
                        ) : (
                            <div className="text-center text-app-textMuted pt-20">
                                <h2 className="text-2xl font-semibold mb-2">Trình Đọc Truyện</h2>
                                <p className="text-base">Tải lên một file .txt để bắt đầu đọc.</p>
                            </div>
                        )}
                    </div>
                </div>
                {currentChapter && (
                    <div className="max-w-3xl mx-auto pb-20">
                         <ChapterNavigation 
                            chapters={readerChapters} 
                            currentIndex={currentReaderChapterIndex} 
                            onChapterChange={handleChapterChange} 
                            dropdownDirection="up"
                        />
                    </div>
                )}
            </div>

            {isSettingsVisible && (
                <div ref={settingsRef} className="fixed top-20 right-4 bg-app-surface border border-app-border rounded-xl shadow-2xl p-4 w-full max-w-sm text-white space-y-6 z-30 max-h-[85vh] overflow-y-auto">
                    {/* 1. Theme */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <PaletteIcon />
                                <span className="text-white text-sm font-medium">Theme</span>
                            </div>
                            <div className="flex bg-[#2A2D2F] rounded-lg p-0.5">
                                <button 
                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, themeColor: '#04DA98'}}))}
                                    className={`px-3 py-1 text-[10px] rounded-md transition-all ${settings.themeColor === '#04DA98' || !settings.themeColor ? 'bg-app-accent text-[#0A0A0A] shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Xanh
                                </button>
                                <button 
                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, themeColor: '#F0BC85'}}))}
                                    className={`px-3 py-1 text-[10px] rounded-md transition-all ${settings.themeColor === '#F0BC85' ? 'bg-app-accent text-[#0A0A0A] shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Nâu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Khu vực chỉnh dòng-cỡ chữ */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                        <SettingControl icon={<LineHeightIcon />} label="Giãn dòng" value={`${Math.round(LINE_HEIGHTS[lineHeightIndex] * 100)}%`} onDecrement={() => setReadState(p => ({...p, settings: {...p.settings, lineHeightIndex: Math.max(0, p.settings.lineHeightIndex - 1)}}))} onIncrement={() => setReadState(p => ({...p, settings: {...p.settings, lineHeightIndex: Math.min(LINE_HEIGHTS.length - 1, p.settings.lineHeightIndex + 1)}}))} />
                        <SettingControl icon={<ParagraphSpacingIcon />} label="Xuống dòng" value={`${PARAGRAPH_SPACINGS[paragraphSpacingIndex]}px`} onDecrement={() => setReadState(p => ({...p, settings: {...p.settings, paragraphSpacingIndex: Math.max(0, p.settings.paragraphSpacingIndex - 1)}}))} onIncrement={() => setReadState(p => ({...p, settings: {...p.settings, paragraphSpacingIndex: Math.min(PARAGRAPH_SPACINGS.length - 1, p.settings.paragraphSpacingIndex + 1)}}))} />
                        <SettingControl icon={<FontSizeIcon />} label="Cỡ chữ" value={`${FONT_SIZES[fontSizeIndex]}px`} onDecrement={() => setReadState(p => ({...p, settings: {...p.settings, fontSizeIndex: Math.max(0, p.settings.fontSizeIndex - 1)}}))} onIncrement={() => setReadState(p => ({...p, settings: {...p.settings, fontSizeIndex: Math.min(FONT_SIZES.length - 1, p.settings.fontSizeIndex + 1)}}))} />
                        <SettingControl icon={<WidthIcon />} label="Chiều rộng khung" value={`${currentContainerWidth}px`} onDecrement={handleWidthDecrement} onIncrement={handleWidthIncrement} />
                    </div>
                    
                    {/* 3. Khu vực font */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3"><FontIcon /><span className="text-white text-sm">Font chữ</span></div>
                            <CustomDropdown
                                options={[
                                    ...FONTS.map(f => ({ value: f, label: f, group: 'Mặc định' })),
                                    ...customFonts.map(f => ({ value: f.name, label: f.name, group: 'Tùy chỉnh' }))
                                ]}
                                value={fontFamily}
                                onChange={(val) => setReadState(p => ({...p, settings: {...p.settings, fontFamily: val}}))}
                                placeholder="Chọn Font"
                                className="w-[160px]"
                                buttonClassName="bg-[#2A2D2F] px-3 py-1.5 text-sm"
                                menuClassName="bg-[#2A2D2F]"
                                renderOption={(option) => (
                                    <span className="truncate" style={{ fontFamily: option.value }}>
                                        {option.label}
                                    </span>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3"><HeadingFontIcon /><span className="text-white text-sm">Font tiêu đề</span></div>
                            <CustomDropdown
                                options={[
                                    ...FONTS.map(f => ({ value: f, label: f, group: 'Mặc định' })),
                                    ...customFonts.map(f => ({ value: f.name, label: f.name, group: 'Tùy chỉnh' }))
                                ]}
                                value={titleFontFamily || 'Texturina_48pt-Bold'}
                                onChange={(val) => setReadState(p => ({...p, settings: {...p.settings, titleFontFamily: val}}))}
                                placeholder="Chọn Font"
                                className="w-[160px]"
                                buttonClassName="bg-[#2A2D2F] px-3 py-1.5 text-sm"
                                menuClassName="bg-[#2A2D2F]"
                                renderOption={(option) => (
                                    <span className="truncate" style={{ fontFamily: option.value }}>
                                        {option.label}
                                    </span>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <UploadIcon />
                                <span className="text-white text-sm">Tải lên Font (.ttf/.otf)</span>
                            </div>
                            <input 
                                type="file" 
                                accept=".ttf,.otf" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const dataUrl = event.target?.result as string;
                                            const fontName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
                                            setCustomFonts(prev => {
                                                if (!prev.some(f => f.name === fontName)) {
                                                    return [...prev, { name: fontName, dataUrl }];
                                                }
                                                return prev;
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                    // Reset input so the same file can be uploaded again if needed
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-[#2A2D2F] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-sm text-white transition-all focus:outline-none focus:ring-1 focus:ring-app-accent shadow-sm"
                            >
                                Tải lên
                            </button>
                        </div>
                    </div>

                    {/* 4. Khu vực màu background */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: backgroundColor || '#1B1D1E' }}></div>
                                <span className="text-white text-sm">Màu background</span>
                            </div>
                            <button 
                                onClick={openColorPicker}
                                className="bg-[#2A2D2F] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-sm text-white transition-all focus:outline-none focus:ring-1 focus:ring-app-accent shadow-sm"
                            >
                                Chọn màu
                            </button>
                        </div>
                    </div>

                    {/* 5. Khu vực bubble chat */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <ChatBubbleIcon />
                                <span className="text-white text-sm">Làm đẹp lời thoại</span>
                            </div>
                            <button 
                                onClick={() => setReadState(p => ({...p, settings: {...p.settings, beautifyDialogue: !p.settings.beautifyDialogue}}))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-app-accent focus:ring-offset-1 focus:ring-offset-[#1B1D1E] ${settings.beautifyDialogue ? 'bg-app-accent' : 'bg-[#2A2D2F]'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.beautifyDialogue ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {settings.beautifyDialogue && (
                            <div className="space-y-3 pl-9 pt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-app-textMuted">Kiểu bong bóng</span>
                                    <div className="flex bg-[#2A2D2F] rounded-lg p-0.5">
                                        <button 
                                            onClick={() => setReadState(p => ({...p, settings: {...p.settings, dialoguePreset: 'modern', bubbleTextColor: '#04DA98'}}))}
                                            className={`px-3 py-1 text-[10px] rounded-md transition-all ${settings.dialoguePreset !== 'classic' ? 'bg-app-accent text-[#0A0A0A] shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Hiện đại
                                        </button>
                                        <button 
                                            onClick={() => setReadState(p => ({...p, settings: {...p.settings, dialoguePreset: 'classic', bubbleTextColor: '#D7D5D1'}}))}
                                            className={`px-3 py-1 text-[10px] rounded-md transition-all ${settings.dialoguePreset === 'classic' ? 'bg-app-accent text-[#0A0A0A] shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            Cổ điển
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-app-textMuted">Màu chữ</span>
                                    <div className="flex items-center space-x-3">
                                        {settings.dialoguePreset === 'classic' ? (
                                            <>
                                                <button 
                                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleTextColor: '#D7D5D1'}}))}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all ${settings.bubbleTextColor?.toUpperCase() === '#D7D5D1' ? 'border-white scale-110 shadow-[0_0_8px_rgba(215,213,209,0.4)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: '#D7D5D1' }}
                                                    title="Trắng"
                                                />
                                                <button 
                                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleTextColor: '#E6E6DA'}}))}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all ${settings.bubbleTextColor?.toUpperCase() === '#E6E6DA' ? 'border-white scale-110 shadow-[0_0_8px_rgba(230,230,218,0.4)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: '#E6E6DA' }}
                                                    title="Ngà"
                                                />
                                                <button 
                                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleTextColor: '#BF966A'}}))}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all ${settings.bubbleTextColor?.toUpperCase() === '#BF966A' ? 'border-white scale-110 shadow-[0_0_8px_rgba(191,150,106,0.4)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: '#BF966A' }}
                                                    title="Nâu sáng"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleTextColor: '#04DA98'}}))}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all ${settings.bubbleTextColor?.toUpperCase() === '#04DA98' ? 'border-white scale-110 shadow-[0_0_8px_rgba(4,218,152,0.6)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: '#04DA98' }}
                                                    title="Xanh sáng"
                                                />
                                                <button 
                                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleTextColor: '#10A673'}}))}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all ${settings.bubbleTextColor?.toUpperCase() === '#10A673' ? 'border-white scale-110 shadow-[0_0_8px_rgba(15,152,106,0.6)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: '#10A673' }}
                                                    title="Xanh tối"
                                                />
                                                <button 
                                                    onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleTextColor: '#FFFFFF'}}))}
                                                    className={`w-5 h-5 rounded-md border-2 transition-all ${settings.bubbleTextColor?.toUpperCase() === '#FFFFFF' || settings.bubbleTextColor === 'white' ? 'border-app-accent scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                    style={{ backgroundColor: '#FFFFFF' }}
                                                    title="Trắng"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <span className="text-sm text-white">Vị trí bong bóng chat</span>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleOffset: (p.settings.bubbleOffset || 0) - 1}}))}
                                            className="p-1.5 rounded-full bg-[#2A2D2F] text-app-accent hover:bg-app-accent hover:text-white transition-colors"
                                            title="Lên trên"
                                        >
                                            <ArrowUpIcon />
                                        </button>
                                        <button 
                                            onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleOffset: (p.settings.bubbleOffset || 0) + 1}}))}
                                            className="p-1.5 rounded-full bg-[#2A2D2F] text-app-accent hover:bg-app-accent hover:text-white transition-colors"
                                            title="Xuống dưới"
                                        >
                                            <ArrowDownIcon />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => setReadState(p => ({...p, settings: {...p.settings, bubbleOffset: 0}}))}
                                        className="text-xs text-app-textMuted hover:text-white transition-colors underline"
                                    >
                                        Reset vị trí bubble chat
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {isColorPickerVisible && (
                <ColorPicker 
                    color={backgroundColor || '#1B1D1E'} 
                    recentColors={settings.recentColors || ['#F4ECD8', '#E3EDCD', '#E8E9EA', '#1B1D1E', '#000000', '#FFFFFF']}
                    onChange={(color) => setReadState(p => ({...p, settings: {...p.settings, backgroundColor: color}}))} 
                    onConfirm={confirmColorPicker}
                    onClose={closeColorPicker} 
                />
            )}

            <FloatingPauseButton 
                isVisible={isTTSPlaying} 
                onClick={() => setIsTTSPlaying(false)} 
                className="fixed bottom-10 right-10"
                size="lg"
            />
        </div>
    );
};

export default ReadViewDesktop;
