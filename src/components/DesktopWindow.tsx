import React from "react";
import { X, Minus, Maximize2, Minimize2, ChevronUp, ChevronDown } from "lucide-react";

interface DesktopWindowProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  isMaximized: boolean;
  onMaximizeToggle: () => void;
  headerColorClass?: string;
  badge?: string;
  children: React.ReactNode;
}

export default function DesktopWindow({
  title,
  icon,
  isOpen,
  onClose,
  isMinimized,
  onMinimizeToggle,
  isMaximized,
  onMaximizeToggle,
  headerColorClass = "from-slate-900 to-indigo-950",
  badge,
  children,
}: DesktopWindowProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
        isMaximized 
          ? "fixed inset-4 md:inset-8 z-40" 
          : isMinimized 
            ? "h-14 md:h-14 z-20 shrink-0" 
            : "h-[650px] md:h-[720px] min-h-[400px] z-30 flex-1"
      } border-slate-200 shadow-slate-100/50`}
    >
      {/* Window Titlebar */}
      <div className={`bg-gradient-to-r ${headerColorClass} px-5 py-3.5 flex items-center justify-between text-white select-none shrink-0 border-b border-white/5`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-xs">
            {icon}
          </div>
          <span className="text-xs font-black uppercase tracking-wider">{title}</span>
          {badge && (
            <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
              {badge}
            </span>
          )}
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1.5">
          {/* Minimize / Collapse */}
          <button
            onClick={onMinimizeToggle}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all"
            title={isMinimized ? "Pencereyi Aç" : "Küçült"}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Maximize */}
          <button
            onClick={onMaximizeToggle}
            disabled={isMinimized}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            title={isMaximized ? "Eski Boyutuna Getir" : "Tam Ekran Yap"}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white transition-all border border-red-500/10"
            title="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div 
        className={`flex-1 overflow-hidden flex flex-col bg-slate-50/50 ${
          isMinimized ? "hidden" : "block"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
