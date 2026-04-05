import React, { useState, useRef } from 'react';
import { SavedStoryMeta } from '../types';
import { PlusIcon, BookOpenIcon, EditIcon, TrashIcon, ScrollIcon, StarIcon } from './Icons';
import { InteractiveHoverButton } from './InteractiveHoverButton';

interface LibraryViewProps {
    savedStories: SavedStoryMeta[];
    onSelectStory: (id: string) => void;
    onDeleteStory: (id: string) => void;
    onEditStoryName: (id: string, newName: string) => void;
    onUpload: (file: File) => void;
    onBack: () => void;
    themeColor: string;
}

const LibraryViewMobile: React.FC<LibraryViewProps> = ({ 
    savedStories, 
    onSelectStory, 
    onDeleteStory, 
    onEditStoryName,
    onUpload,
    onBack,
    themeColor
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const isCancelling = useRef(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startEditing = (e: React.MouseEvent, story: SavedStoryMeta) => {
        e.stopPropagation();
        isCancelling.current = false;
        setEditingStoryId(story.id);
        setEditingName(story.displayName || story.fileName);
    };

    const saveEditing = (e?: React.FormEvent | React.FocusEvent) => {
        if (e) e.preventDefault();
        if (isCancelling.current) return;
        if (editingStoryId && editingName.trim()) {
            onEditStoryName(editingStoryId, editingName.trim());
        }
        setEditingStoryId(null);
    };

    const cancelEditing = () => {
        isCancelling.current = true;
        setEditingStoryId(null);
        setEditingName('');
    };

    return (
        <div className="min-h-screen bg-[#1B1D1E] text-app-text p-4 pb-safe font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <InteractiveHoverButton onClick={onBack} className="px-4 py-1.5 text-xs">
                        Menu
                    </InteractiveHoverButton>
                    <div>
                        <input 
                            type="file" 
                            accept=".txt" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            ref={fileInputRef} 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center w-10 h-10 bg-app-accent text-[#0A0A0A] rounded-full hover:opacity-90 transition-opacity active:scale-95 shadow-lg"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {savedStories.length === 0 ? (
                    <div className="text-center py-20 text-app-textMuted bg-white/5 rounded-2xl border border-white/10 border-dashed">
                        <BookOpenIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-base">Chưa có truyện nào.</p>
                        <p className="text-sm mt-2">Tải lên file .txt để đọc.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {savedStories.map((story, index) => {
                            const progress = Math.round((story.currentChapterIndex / (story.totalChapters - 1 || 1)) * 100);
                            const hasStar = index === 2; // Just for visual matching with Image 1
                            
                            return (
                                <div 
                                    key={story.id} 
                                    className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex flex-col transition-all duration-300 active:scale-[0.98] relative overflow-hidden"
                                    onClick={() => onSelectStory(story.id)}
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="p-2.5 bg-white/5 rounded-lg text-app-accent">
                                            {index % 2 === 0 ? <BookOpenIcon className="w-5 h-5" /> : <ScrollIcon className="w-5 h-5" />}
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            {hasStar && (
                                                <StarIcon className="w-4 h-4 text-app-accent mr-1" />
                                            )}
                                            <div className="flex">
                                                <button 
                                                    onClick={(e) => startEditing(e, story)}
                                                    className="p-2 text-app-textMuted hover:text-green-400 active:text-green-400 transition-colors after:hidden"
                                                    title="Đổi tên"
                                                >
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                                                    className="p-2 text-app-textMuted hover:text-red-500 active:text-red-500 transition-colors after:hidden"
                                                    title="Xóa truyện"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title & Meta */}
                                    <div className="mb-6">
                                        {editingStoryId === story.id ? (
                                            <form onSubmit={saveEditing} className="mb-2" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="text" 
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="w-full bg-[#0A0A0A] border border-app-accent rounded-lg px-3 py-2 text-white text-base font-gelasio focus:outline-none"
                                                    autoFocus
                                                    onBlur={saveEditing}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                />
                                            </form>
                                        ) : (
                                            <h3 className="text-xl font-gelasio text-white mb-2 line-clamp-2 leading-tight">
                                                {story.displayName || story.fileName}
                                            </h3>
                                        )}
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-app-textMuted uppercase tracking-widest">
                                            <span>{index % 2 === 0 ? 'Huyền Huyễn' : 'Lịch Sử'}</span>
                                            <span>•</span>
                                            <span>
                                                {story.wordCount >= 1000000 
                                                    ? (story.wordCount / 1000000).toFixed(1) + 'M' 
                                                    : story.wordCount >= 1000 
                                                        ? (story.wordCount / 1000).toFixed(1) + 'K' 
                                                        : story.wordCount} Chữ
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="mt-auto">
                                        <div className="flex justify-between items-end mb-2 text-[10px] font-medium">
                                            <span className="text-app-textMuted">Chương {story.currentChapterIndex + 1}/{story.totalChapters}</span>
                                            <span className="text-app-accent">Hoàn thành {progress}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full mb-5 overflow-hidden">
                                            <div 
                                                className="h-full bg-app-accent transition-all duration-1000 ease-out"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>

                                        {/* Actions */}
                                        <div className="w-full py-3 bg-app-accent text-[#0A0A0A] font-bold rounded-xl text-center uppercase text-[10px] tracking-widest active:scale-95 transition-transform">
                                            Đọc tiếp
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryViewMobile;
