import React, { useState, useRef } from 'react';
import { SavedStoryMeta } from '../types';
import { PlusIcon, BookOpenIcon, EditIcon, TrashIcon, StarIcon, ScrollIcon } from './Icons';
import GooeyNav from './GooeyNav';
import { InteractiveHoverButton } from './InteractiveHoverButton';

interface LibraryViewProps {
    savedStories: SavedStoryMeta[];
    onSelectStory: (id: string) => void;
    onDeleteStory: (id: string) => void;
    onEditStoryName: (id: string, newName: string) => void;
    onUpload: (file: File) => void;
    onBack: () => void;
}

const LibraryViewDesktop: React.FC<LibraryViewProps> = ({ 
    savedStories, 
    onSelectStory, 
    onDeleteStory, 
    onEditStoryName,
    onUpload,
    onBack
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
        <div className="min-h-screen bg-[#1B1D1E] text-app-text p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Top Header */}
                <div className="flex items-center justify-between mb-16">
                    <InteractiveHoverButton 
                        onClick={onBack}
                        className="text-sm"
                    >
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
                        <GooeyNav 
                            initialActiveIndex={-1}
                            items={[
                                { 
                                    label: (
                                        <div className="flex items-center gap-2">
                                            <PlusIcon className="w-4 h-4" />
                                            <span>Đăng truyện</span>
                                        </div>
                                    ), 
                                    onClick: () => fileInputRef.current?.click() 
                                }
                            ]} 
                        />
                    </div>
                </div>

                {/* Section Title */}
                <div className="mb-12">
                    <h1 className="text-5xl font-serif text-white mb-4">Thư Viện Của Tôi</h1>
                    <p className="text-app-textMuted text-lg">Quản lý bộ sưu tập truyện và bản thảo số của bạn.</p>
                    <div className="w-12 h-1 bg-app-accent mt-6 rounded-full"></div>
                </div>

                {savedStories.length === 0 ? (
                    <div className="text-center py-24 text-app-textMuted bg-[#141414] rounded-3xl border border-white/5">
                        <BookOpenIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-serif italic">Chưa có truyện nào trong thư viện.</p>
                        <p className="text-sm mt-2 opacity-60">Hãy tải lên một file .txt để bắt đầu đọc.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedStories.map((story, index) => {
                            const progress = Math.round((story.currentChapterIndex / (story.totalChapters - 1 || 1)) * 100);
                            const hasStar = index === 2; // Just for visual matching with Image 1
                            
                            return (
                                <div 
                                    key={story.id} 
                                    className="group bg-[#141414] border border-white/5 hover:border-app-accent/30 rounded-2xl p-6 flex flex-col transition-all duration-500 hover:shadow-[0_0_30px_rgba(1,207,143,0.1)] relative overflow-hidden"
                                >
                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-white/5 rounded-lg text-app-accent">
                                            {index % 2 === 0 ? <BookOpenIcon className="w-6 h-6" /> : <ScrollIcon className="w-6 h-6" />}
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            {hasStar && (
                                                <StarIcon className="w-5 h-5 text-app-accent mr-1" />
                                            )}
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button 
                                                    onClick={(e) => startEditing(e, story)}
                                                    className="p-2 text-app-textMuted hover:text-green-400 transition-colors after:hidden"
                                                    title="Đổi tên"
                                                >
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                                                    className="p-2 text-app-textMuted hover:text-red-500 transition-colors after:hidden"
                                                    title="Xóa truyện"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Title & Meta */}
                                    <div className="mb-8">
                                        {editingStoryId === story.id ? (
                                            <form onSubmit={saveEditing} className="mb-2" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="text" 
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="w-full bg-[#0A0A0A] border border-app-accent rounded-lg px-3 py-2 text-white text-lg font-gelasio focus:outline-none"
                                                    autoFocus
                                                    onBlur={saveEditing}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Escape') cancelEditing();
                                                    }}
                                                />
                                            </form>
                                        ) : (
                                            <h3 className="text-2xl font-gelasio text-white mb-2 line-clamp-2 leading-tight group-hover:text-app-accent transition-colors">
                                                {story.displayName || story.fileName}
                                            </h3>
                                        )}
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-app-textMuted uppercase tracking-widest">
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
                                        <div className="flex justify-between items-end mb-3 text-[11px] font-medium">
                                            <span className="text-app-textMuted">Chương {story.currentChapterIndex + 1}/{story.totalChapters}</span>
                                            <span className="text-app-accent">Hoàn thành {progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden">
                                            <div 
                                                className="h-full bg-app-accent transition-all duration-1000 ease-out"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>

                                        {/* Actions */}
                                        <button 
                                            onClick={() => onSelectStory(story.id)}
                                            className="w-full py-3 bg-app-accent text-[#0A0A0A] font-bold rounded-xl hover:bg-app-accentHover transition-all duration-300 uppercase text-xs tracking-widest"
                                        >
                                            Đọc tiếp
                                        </button>
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

export default LibraryViewDesktop;
