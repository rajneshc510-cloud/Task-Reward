import React from 'react';
import { Home, CheckCircle2, Wallet, User } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onSelectScreen,
}) => {
  const tabs = [
    { id: 'home' as ScreenType, label: 'Home', icon: Home },
    { id: 'tasks' as ScreenType, label: 'Tasks', icon: CheckCircle2 },
    { id: 'wallet' as ScreenType, label: 'Wallet', icon: Wallet },
    { id: 'profile' as ScreenType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white border-t border-slate-200/80 px-4 py-2 flex items-center justify-around select-none shadow-[0_-2px_10px_rgba(0,0,0,0.03)] z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = currentScreen === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectScreen(tab.id)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 group active:scale-95"
          >
            <div
              className={`w-12 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isSelected
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isSelected ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[11px] mt-1 tracking-tight transition-colors ${
                isSelected ? 'font-bold text-blue-700' : 'text-slate-500 font-medium'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
