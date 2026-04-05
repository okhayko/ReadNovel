import React from 'react';
import { BookOpenIcon } from './Icons';
import MagicRings from './MagicRings';
import ShapeBlur from './ShapeBlur';
import ShinyLogo from './ShinyLogo';

interface MenuViewProps {
    onNavigateRead: () => void;
    themeColor?: string;
}

const MenuViewDesktop: React.FC<MenuViewProps> = ({ onNavigateRead, themeColor }) => {
    const isBrownTheme = themeColor === '#F0BC85';
    const color = isBrownTheme ? "#f0bc85" : "#04da98";
    const colorTwo = isBrownTheme ? "#04da98" : "#f0bc85";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative overflow-hidden bg-app-bg">
            <div className="absolute inset-0 z-0">
                <MagicRings
                    color={color}
                    colorTwo={colorTwo}
                    ringCount={6}
                    speed={1}
                    attenuation={10}
                    lineThickness={2}
                    baseRadius={0.35}
                    radiusStep={0.1}
                    scaleRate={0.1}
                    opacity={1}
                    blur={0}
                    noiseAmount={0.1}
                    rotation={0}
                    ringGap={1.5}
                    fadeIn={0.7}
                    fadeOut={0.5}
                    followMouse={false}
                    mouseInfluence={0.2}
                    hoverScale={1.2}
                    parallax={0.05}
                    clickBurst={false}
                />
                <div className="absolute inset-0 bg-app-bg/40 backdrop-blur-[2px]"></div>
            </div>
            
            <header className="mb-12 z-10 flex flex-col items-center">
                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 z-0">
                        <ShapeBlur
                            variation={0}
                            pixelRatioProp={window.devicePixelRatio || 1}
                            shapeSize={1.2}
                            roundness={0.5}
                            borderSize={0.05}
                            circleSize={0.25}
                            circleEdge={1}
                        />
                    </div>
                    <div className="relative z-10 p-6 transform hover:scale-110 transition-transform duration-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 text-app-accent drop-shadow-[0_0_15px_rgba(var(--app-accent-rgb),0.5)]">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            <path d="M8 7h6" />
                            <path d="M8 11h8" />
                            <path d="M12 15h4" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4 mb-6">
                    <h1 className="text-7xl font-bold tracking-tight leading-relaxed">
                        <ShinyLogo
                            text="Thư Viện Truyện"
                            speed={2}
                            delay={0}
                            color="#b5b5b5"
                            shineColor="#ffffff"
                            spread={120}
                            direction="left"
                            yoyo={false}
                            pauseOnHover={false}
                            disabled={false}
                            className="font-texturina-bold"
                        />
                    </h1>
                </div>
                <p className="text-xl text-app-textMuted max-w-lg font-light">
                    Không gian đọc truyện cá nhân của bạn. Tải lên, lưu trữ và đắm chìm vào thế giới của những trang sách.
                </p>
            </header>
            
            <div className="max-w-xs w-full z-10">
                <div className="relative group">
                    <button
                        onClick={onNavigateRead}
                        className="relative inline-block p-px font-semibold leading-6 text-white bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 w-full"
                    >
                        <span
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        ></span>

                        <span className="relative z-10 block px-6 py-3 rounded-xl bg-gray-950">
                            <div className="relative z-10 flex items-center justify-center space-x-2">
                                <span className="transition-all duration-500 group-hover:translate-x-1 text-lg font-bold">
                                    Truy cập Thư viện
                                </span>
                                <svg
                                    className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-1"
                                    data-slot="icon"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        clipRule="evenodd"
                                        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                                        fillRule="evenodd"
                                    ></path>
                                </svg>
                            </div>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuViewDesktop;
