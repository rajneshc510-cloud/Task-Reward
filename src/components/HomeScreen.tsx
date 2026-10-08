import React from 'react';
import { Sparkles, CalendarCheck, Gift, Trophy, ChevronRight, ShieldCheck } from 'lucide-react';
import { UserProfile, RewardTask } from '../types';

interface HomeScreenProps {
  userProfile: UserProfile;
  tasks: RewardTask[];
  onNavigateToTasks: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  tasks,
  onNavigateToTasks,
}) => {
  const getTaskIcon = (iconType: RewardTask['iconType']) => {
    switch (iconType) {
      case 'checkin':
        return <CalendarCheck className="w-6 h-6 text-blue-600" />;
      case 'bonus':
        return <Gift className="w-6 h-6 text-amber-500" />;
      case 'activity':
        return <Trophy className="w-6 h-6 text-emerald-600" />;
    }
  };

  const getTaskBg = (iconType: RewardTask['iconType']) => {
    switch (iconType) {
      case 'checkin':
        return 'bg-blue-50';
      case 'bonus':
        return 'bg-amber-50';
      case 'activity':
        return 'bg-emerald-50';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50 select-none pb-24">
      {/* App Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            TaskReward
          </h1>
        </div>
        <p className="text-sm text-slate-500 font-medium">
          Complete tasks and collect reward points
        </p>
      </div>

      {/* Large Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl shadow-blue-600/20">
        {/* Background glow circle */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-100 tracking-wide uppercase">
              Current Balance
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black text-white tracking-wider border border-white/20 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              DEMO REWARDS
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">
              {userProfile.coins.toLocaleString()}
            </span>
            <span className="text-lg font-bold text-blue-200">
              Points
            </span>
          </div>

          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-blue-100/90 font-medium">
            <span>Lifetime Earned: <strong className="text-white font-bold">{userProfile.totalEarned.toLocaleString()} pts</strong></span>
            <span className="text-[11px] bg-blue-900/40 px-2.5 py-0.5 rounded-lg border border-blue-400/20">
              100% Free Demo
            </span>
          </div>
        </div>
      </div>

      {/* Daily Tasks Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Daily Tasks
            </h2>
            <p className="text-xs text-slate-500">
              Refreshes every 24 hours
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToTasks}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline px-2 py-1"
          >
            Go to Tasks →
          </button>
        </div>

        {/* 3 Task Cards */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={onNavigateToTasks}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl ${getTaskBg(
                    task.iconType
                  )} flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform`}
                >
                  {getTaskIcon(task.iconType)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                    {task.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200/60 shadow-xs">
                  +{task.points} pts
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
