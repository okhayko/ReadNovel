import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Square, Volume2 } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { ReaderSettings } from '../types';
import { Meteors } from "./Meteors";

interface TTSPlayerProps {
    content: string;
    onIndexChange: (index: number) => void;
    currentIndex: number;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    settings: ReaderSettings;
}

const VOICES = [
    { value: 'vi-VN-HoaiMyNeural', label: 'Hoài My (Nữ)' },
    { value: 'vi-VN-NamMinhNeural', label: 'Nam Minh (Nam)' }
];

const TTSPlayerDesktop: React.FC<TTSPlayerProps> = ({ content, onIndexChange, currentIndex, isPlaying, setIsPlaying, settings }) => {
    const [voice, setVoice] = useState('vi-VN-HoaiMyNeural');
    const [rate, setRate] = useState(1.0);
    const [isPaused, setIsPaused] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const prefetchCache = useRef<Map<number, string>>(new Map());
    const isFetching = useRef<Set<number>>(new Set());

    // Parse content into segments
    const textArray = useMemo(() => {
        if (!content) return [];
        return content
            .split(/\n|(?<=[.!?])\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }, [content]);

    const cleanText = (text: string) => {
        return text.replace(/[""“”]/g, '');
    };

    const stopTTS = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        prefetchCache.current.forEach(url => URL.revokeObjectURL(url));
        prefetchCache.current.clear();
        isFetching.current.clear();
        
        setIsPlaying(false);
        setIsPaused(false);
    };

    const fetchAudio = async (index: number, retryCount = 0): Promise<string | null> => {
        if (index >= textArray.length || index < 0) return null;
        if (prefetchCache.current.has(index)) return prefetchCache.current.get(index)!;
        if (isFetching.current.has(index) && retryCount === 0) return null;

        isFetching.current.add(index);
        const text = cleanText(textArray[index]);
        
        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice, rate }),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            if (blob.size === 0) throw new Error("Empty audio");

            const url = URL.createObjectURL(blob);
            prefetchCache.current.set(index, url);
            return url;
        } catch (err) {
            console.error(`Error fetching audio for index ${index}:`, err);
            if (retryCount < 2) {
                await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
                isFetching.current.delete(index);
                return fetchAudio(index, retryCount + 1);
            }
            return null;
        } finally {
            isFetching.current.delete(index);
        }
    };

    const speak = async (index: number) => {
        if (index >= textArray.length) {
            stopTTS();
            return;
        }

        let url = prefetchCache.current.get(index);
        if (!url) url = await fetchAudio(index) || undefined;
        if (!url) {
            stopTTS();
            return;
        }

        if (audioRef.current) {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            audioRef.current.pause();
            audioRef.current.src = url;
        } else {
            audioRef.current = new Audio(url);
        }

        audioRef.current.playbackRate = rate;
        
        let nextTriggered = false;
        const handleNextTrigger = () => {
            if (!nextTriggered && isPlaying && !isPaused) {
                nextTriggered = true;
                onIndexChange(index + 1);
            }
        };

        audioRef.current.onended = handleNextTrigger;
        
        // High precision early trigger using requestAnimationFrame
        const checkTime = () => {
            if (audioRef.current && audioRef.current.duration > 0) {
                const timeLeft = (audioRef.current.duration - audioRef.current.currentTime) / audioRef.current.playbackRate;
                if (timeLeft < 0.45) { // Trigger 450ms before end for seamless transition
                    handleNextTrigger();
                } else {
                    rafIdRef.current = requestAnimationFrame(checkTime);
                }
            } else {
                rafIdRef.current = requestAnimationFrame(checkTime);
            }
        };
        rafIdRef.current = requestAnimationFrame(checkTime);

        try {
            await audioRef.current.play();
            fetchAudio(index + 1);
            fetchAudio(index + 2);
            
            if (prefetchCache.current.size > 5) {
                for (const [key, cachedUrl] of prefetchCache.current.entries()) {
                    if (key < index - 1 || key > index + 3) {
                        URL.revokeObjectURL(cachedUrl);
                        prefetchCache.current.delete(key);
                    }
                }
            }
        } catch (err) {
            console.error("Audio play error:", err);
            stopTTS();
        }
    };

    useEffect(() => {
        if (isPlaying && !isPaused) {
            speak(currentIndex);
        } else if (isPaused && audioRef.current) {
            audioRef.current.pause();
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        }
        return () => { 
            if (audioRef.current) audioRef.current.pause(); 
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [currentIndex, isPlaying, isPaused, voice, rate]);

    const handleTogglePlay = () => {
        if (isPlaying) {
            if (isPaused) {
                setIsPaused(false);
                if (audioRef.current) audioRef.current.play();
            } else {
                setIsPaused(true);
                if (audioRef.current) audioRef.current.pause();
            }
        } else {
            setIsPlaying(true);
            setIsPaused(false);
        }
    };

    const handleNext = () => currentIndex < textArray.length - 1 && onIndexChange(currentIndex + 1);
    const handlePrev = () => currentIndex > 0 && onIndexChange(currentIndex - 1);

    return (
        <div className="flex flex-col items-center gap-4 p-4 bg-app-surface/50 backdrop-blur-md border border-app-border rounded-2xl mb-8 relative">
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <Meteors number={15} />
            </div>
            <div className="flex items-center justify-between w-full gap-4 relative z-10">
                {/* Voice Selection */}
                <div className="flex-1">
                    <CustomDropdown
                        options={VOICES}
                        value={voice}
                        onChange={setVoice}
                        placeholder="Chọn giọng đọc"
                        className="w-full"
                        buttonClassName="bg-app-bg/50 border-app-border text-xs py-2"
                        centered={true}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrev}
                        className="p-2 rounded-full hover:bg-white/10 text-app-textMuted transition-colors"
                        disabled={currentIndex === 0}
                    >
                        <SkipBack size={20} />
                    </button>
                    
                    <button 
                        onClick={handleTogglePlay}
                        className="w-12 h-12 rounded-full bg-app-accent text-app-bg flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-app-accent/20"
                    >
                        {isPlaying && !isPaused ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                    </button>

                    <button 
                        onClick={handleNext}
                        className="p-2 rounded-full hover:bg-white/10 text-app-textMuted transition-colors"
                        disabled={currentIndex >= textArray.length - 1}
                    >
                        <SkipForward size={20} />
                    </button>

                    <button 
                        onClick={() => { stopTTS(); onIndexChange(0); }}
                        className="p-2 rounded-full hover:bg-white/10 text-app-textMuted transition-colors"
                    >
                        <Square size={18} fill="currentColor" />
                    </button>
                </div>

                {/* Speed Control */}
                <div className="flex-1 flex items-center gap-2">
                    <Volume2 size={16} className="text-app-textMuted" />
                    <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value={rate} 
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-app-border rounded-lg appearance-none cursor-pointer accent-app-accent"
                    />
                    <span className="text-[10px] font-mono text-app-textMuted w-8">{rate}x</span>
                </div>
            </div>
            
            {isPlaying && (
                <div className="text-[10px] text-app-accent/70 font-medium uppercase tracking-widest animate-pulse">
                    Đang đọc câu {currentIndex + 1} / {textArray.length}
                </div>
            )}
        </div>
    );
};

export default TTSPlayerDesktop;
