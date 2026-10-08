import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, ArrowLeft, Circle, Square, Smartphone, Maximize2, Minimize2, Code2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  onBackPress?: () => void;
  canGoBack?: boolean;
  onOpenCodeInspector?: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  onBackPress,
  canGoBack = false,
  onOpenCodeInspector,
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');
  const [isFrameless, setIsFrameless] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-800 antialiased">
      {/* Top Bar for Simulator Controls */}
      <div className="w-full max-w-[440px] mb-2 px-3 flex items-center justify-between text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-300">Android 14 (API 34) • Jetpack Compose</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCodeInspector && (
            <button
              type="button"
              onClick={onOpenCodeInspector}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-bold text-[11px] transition-colors border border-blue-500/30"
              title="View Kotlin Source Code & Android Studio Project"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Kotlin Code</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFrameless(!isFrameless)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors hidden sm:flex"
            title={isFrameless ? 'Show Device Frame' : 'Full Screen'}
          >
            {isFrameless ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Android Device Body */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden bg-slate-50 ${
          isFrameless
            ? 'h-screen max-w-full rounded-none'
            : 'h-[100dvh] sm:h-[844px] max-w-[412px] sm:rounded-[44px] sm:border-[10px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Android Status Bar */}
        <header className="h-9 px-6 bg-slate-50 flex items-center justify-between select-none z-30 shrink-0">
          <span className="text-[12px] font-bold tracking-tight text-slate-800">
            {currentTime}
          </span>

          {/* Android Punch Hole Camera */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700/50 shadow-inner" />

          {/* Status Icons */}
          <div className="flex items-center gap-1.5 text-slate-800">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </main>

        {/* Android 3-Button Navigation Bar */}
        <footer className="h-10 bg-white border-t border-slate-200/80 flex items-center justify-around px-10 select-none z-30 shrink-0">
          {/* Back button */}
          <button
            type="button"
            onClick={onBackPress}
            disabled={!canGoBack}
            className={`p-2 transition-transform active:scale-90 ${
              canGoBack ? 'text-slate-800 hover:text-blue-600' : 'text-slate-300 cursor-default'
            }`}
            title="Android Back Button"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Home button */}
          <button
            type="button"
            onClick={onBackPress}
            className="p-2 text-slate-800 hover:text-blue-600 transition-transform active:scale-90"
            title="Android Home Button"
          >
            <Circle className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Recents button */}
          <button
            type="button"
            className="p-2 text-slate-800 hover:text-blue-600 transition-transform active:scale-90"
            title="Android Recents"
          >
            <Square className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </footer>
      </div>
    </div>
  );
};
