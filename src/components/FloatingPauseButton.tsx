import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PauseIcon } from './Icons';

interface FloatingPauseButtonProps {
    isVisible: boolean;
    onClick: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const FloatingPauseButton: React.FC<FloatingPauseButtonProps> = ({ 
    isVisible, 
    onClick, 
    className = "fixed bottom-8 right-6",
    size = 'md'
}) => {
    const buttonSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
    const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    className={`${className} z-40`}
                >
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            boxShadow: [
                                "0 0 0 0px rgba(var(--app-accent-rgb), 0.5)",
                                "0 0 0 15px rgba(var(--app-accent-rgb), 0)"
                            ]
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: [0.8, 0, 0, 1]
                        }}
                        onClick={onClick}
                        className={`relative ${buttonSize} rounded-full bg-app-accent text-[#0A0A0A] flex items-center justify-center z-10 border-0`}
                        aria-label="Tạm dừng đọc"
                    >
                        <PauseIcon className={iconSize} />
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FloatingPauseButton;
