import React from 'react';
import { motion } from 'motion/react';
import { BookIcon, ChevronLeftIcon } from './Icons';

interface LibraryBackButtonProps {
    onClick: () => void;
}

const LibraryBackButton: React.FC<LibraryBackButtonProps> = ({ onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover="hover"
            initial="initial"
            className="group relative w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-[#2A2D2F] hover:border-app-accent/50 transition-all duration-300 active:scale-95 overflow-hidden"
            aria-label="Quay lại thư viện"
        >
            {/* Expanding background circle (the "dot" effect) */}
            <div className="absolute h-2 w-2 rounded-full bg-app-accent transition-all duration-500 group-hover:scale-[15] opacity-0 group-hover:opacity-100"></div>

            <motion.div
                variants={{
                    initial: { x: 0, opacity: 1 },
                    hover: { x: 25, opacity: 0 }
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute z-10"
            >
                <BookIcon className="w-5 h-5 text-app-accent" />
            </motion.div>
            
            <motion.div
                variants={{
                    initial: { x: -25, opacity: 0 },
                    hover: { x: 0, opacity: 1 }
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute z-10 text-[#0A0A0A]"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </motion.div>
        </motion.button>
    );
};

export default LibraryBackButton;
