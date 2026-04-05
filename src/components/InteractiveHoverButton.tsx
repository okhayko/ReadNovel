import React from "react";
import { ArrowLeft, LucideIcon } from "lucide-react";

export interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  Icon?: LucideIcon;
}

export const InteractiveHoverButton: React.FC<InteractiveHoverButtonProps> = ({
  children,
  className = "",
  Icon = ArrowLeft,
  ...props
}) => {
  return (
    <button
      className={`group relative w-auto cursor-pointer overflow-hidden rounded-full border border-white/10 bg-transparent p-2 px-6 text-center font-semibold transition-all duration-300 hover:border-app-accent/50 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {/* Normal state: Text first, then dot */}
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
        <div className="h-2 w-2 rounded-full bg-app-accent transition-all duration-300 group-hover:scale-[100.8]"></div>
      </div>
      
      {/* Hover state: Arrow first, then text */}
      <div className="absolute top-0 left-0 z-10 flex h-full w-full -translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 text-[#0A0A0A]">
        <Icon className="w-4 h-4" />
        <span>{children}</span>
      </div>
    </button>
  );
};
