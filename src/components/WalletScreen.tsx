import React from 'react';
import { Wallet, ShieldAlert, History, ArrowDownLeft, Clock } from 'lucide-react';
import { UserProfile, TransactionRecord } from '../types';

interface WalletScreenProps {
  userProfile: UserProfile;
  transactions: TransactionRecord[];
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  userProfile,
  transactions,
}) => {
  // Demonstration rate: 100 points = $1.00 USD (Virtual demo value)
  const demoDollarValue = (userProfile.coins * 0.01).toFixed(2);

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50 select-none pb-24">
      {/* Wallet Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Demo Wallet
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Manage and review your demonstration rewards balance
        </p>
      </div>

      {/* Wallet Balance Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Reward Balance
          </span>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-black border border-blue-200/60">
            Demo Currency
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tight">
            {userProfile.coins.toLocaleString()}
          </span>
          <span className="text-lg font-bold text-slate-500">Points</span>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Estimated Demo Value
            </span>
            <span className="text-xl font-black text-emerald-600">
              ${demoDollarValue} <span className="text-xs text-slate-400 font-semibold">USD</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 font-medium block">
              Lifetime Earned
            </span>
            <span className="text-sm font-bold text-slate-700">
              +{userProfile.totalEarned.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>

      {/* Demo Safety Notice */}
      <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold">Demonstration Rewards Notice</p>
          <p className="text-amber-800/90 leading-relaxed">
            All points displayed in this app are demonstration rewards for app engagement. This app does not process real-money withdrawals, cash payouts, or request bank or UPI details.
          </p>
        </div>
      </div>

      {/* Transaction / Reward History Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            Reward History
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            {transactions.length} record{transactions.length === 1 ? '' : 's'}
          </span>
        </div>

        {transactions.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                No Transactions Yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                You haven't claimed any tasks yet. Head over to the Tasks tab to claim your first reward!
              </p>
            </div>
          </div>
        ) : (
          /* Transaction List */
          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600 block">
                    +{tx.points}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Points
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
