import React, { useState } from 'react';
import { CalendarCheck, Gift, Trophy, CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RewardTask } from '../types';

interface TasksScreenProps {
  tasks: RewardTask[];
  claimedTaskIds: Set<string>;
  onClaimTask: (task: RewardTask) => { success: boolean; message: string };
}

export const TasksScreen: React.FC<TasksScreenProps> = ({
  tasks,
  claimedTaskIds,
  onClaimTask,
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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

  const handleClaim = (task: RewardTask) => {
    setClaimingId(task.id);
    setFeedback(null);

    setTimeout(() => {
      const result = onClaimTask(task);
      setClaimingId(null);

      if (result.success) {
        setFeedback({
          type: 'success',
          message: result.message,
        });

        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#1976D2', '#10B981', '#F59E0B', '#3B82F6'],
          });
        } catch {
          // ignore if canvas-confetti is not rendered
        }
      } else {
        setFeedback({
          type: 'error',
          message: result.message,
        });
      }
    }, 450);
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50 select-none pb-24">
      {/* Tasks Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Tasks & Rewards
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Claim each task once per calendar day to accumulate demo points
        </p>
      </div>

      {/* Feedback Message Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-semibold transition-all shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold px-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const isClaimed = claimedTaskIds.has(task.id);
          const isProcessing = claimingId === task.id;

          return (
            <div
              key={task.id}
              className={`bg-white rounded-3xl p-5 border transition-all duration-200 shadow-sm ${
                isClaimed
                  ? 'border-slate-200 bg-slate-50/60 opacity-90'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl ${getTaskBg(
                      task.iconType
                    )} flex items-center justify-center shrink-0 border border-slate-100`}
                  >
                    {getTaskIcon(task.iconType)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-normal">
                      {task.description}
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200/70 shrink-0">
                  +{task.points} pts
                </span>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-medium">
                  {isClaimed ? 'Claimed today • Resets at 00:00' : '1 claim available today'}
                </span>

                <button
                  type="button"
                  disabled={isClaimed || isProcessing}
                  onClick={() => handleClaim(task)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                    isClaimed
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300/60'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Claiming...</span>
                    </>
                  ) : isClaimed ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Claimed</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Earn +{task.points} Points</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
