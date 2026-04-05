import React from 'react';
import { ReaderSettings } from '../types';

interface DialogueLineProps {
    line: string;
    settings: ReaderSettings;
    isHighlighted?: boolean;
}

const DialogueLine: React.FC<DialogueLineProps> = ({ line, settings, isHighlighted }) => {
    if (!line) return <>&nbsp;</>;
    if (!settings.beautifyDialogue) return <span>{line}</span>;
    
    const regex = /(“[^”]*”|"[^"]*"|«[^»]*»)/g;
    const parts = line.split(regex);
    
    const preset = settings.dialoguePreset || 'modern';
    
    return (
        <>
            {parts.map((part, index) => {
                const isQuote = index % 2 === 1;
                
                if (isQuote && part.match(/^(“[^”]*”|"[^"]*"|«[^»]*»)$/)) {
                    const prevPart = parts[index - 1];
                    const isStartOfLine = !prevPart || prevPart.trim().length === 0;
                    const isPrecededByColon = prevPart && prevPart.trim().endsWith(':');
                    
                    if (isStartOfLine || isPrecededByColon) {
                        if (preset === 'classic') {
                            return (
                                <span 
                                    key={index} 
                                    style={{ 
                                        transform: `translateY(${settings.bubbleOffset || 0}px)`,
                                        backgroundColor: isHighlighted ? 'rgba(var(--app-accent-rgb), 0.3)' : '#2D241E',
                                        borderColor: isHighlighted ? 'rgba(var(--app-accent-rgb), 0.6)' : '#8B6D4D',
                                        color: settings.bubbleTextColor || '#D7D5D1',
                                        boxShadow: isHighlighted ? '0 0 20px rgba(var(--app-accent-rgb), 0.4)' : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }} 
                                    className="relative inline-block border mx-1 px-3 pt-[6px] pb-[2px] rounded-sm align-baseline break-words transition-all duration-300"
                                >
                                    {/* Decorative Corner Accents */}
                                    <span className={`absolute -top-1 -left-1 w-2 h-2 border-t border-l ${isHighlighted ? 'border-app-accent' : 'border-[#8B6D4D]'}`}></span>
                                    <span className={`absolute -top-1 -right-1 w-2 h-2 border-t border-r ${isHighlighted ? 'border-app-accent' : 'border-[#8B6D4D]'}`}></span>
                                    <span className={`absolute -bottom-1 -left-1 w-2 h-2 border-b border-l ${isHighlighted ? 'border-app-accent' : 'border-[#8B6D4D]'}`}></span>
                                    <span className={`absolute -bottom-1 -right-1 w-2 h-2 border-b border-r ${isHighlighted ? 'border-app-accent' : 'border-[#8B6D4D]'}`}></span>
                                    
                                    <span className="relative z-10">
                                        {part}
                                    </span>
                                </span>
                            );
                        }
 
                        // Default 'modern' preset
                        return (
                            <span 
                                key={index} 
                                style={{ 
                                    color: settings.bubbleTextColor, 
                                    transform: `translateY(${settings.bubbleOffset || 0}px)`,
                                    backgroundColor: isHighlighted ? 'rgba(var(--app-accent-rgb), 0.25)' : '#061711',
                                    borderColor: isHighlighted ? 'rgba(var(--app-accent-rgb), 0.5)' : '#094733',
                                    boxShadow: isHighlighted ? '0 0 15px rgba(var(--app-accent-rgb), 0.3)' : 'none'
                                }} 
                                className="inline-block border px-2 py-0.5 rounded-2xl rounded-tl-none mx-1 align-baseline transition-all duration-300"
                            >
                                {part}
                            </span>
                        );
                    }
                }
                return <span key={index} className={isHighlighted ? 'text-white' : ''}>{part}</span>;
            })}
        </>
    );
};

export default DialogueLine;
