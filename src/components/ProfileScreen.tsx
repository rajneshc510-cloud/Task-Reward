import React, { useState } from 'react';
import {
  Coins,
  Wallet,
  Share2,
  Headphones,
  Settings,
  LogOut,
  ChevronRight,
  Copy,
  Check,
  Calendar,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onNavigateToWallet: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onNavigateToWallet,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<'support' | 'settings' | null>(null);

  const referralCode = `TR-${userProfile.uid.slice(-6).toUpperCase()}`;

  const handleCopyReferral = () => {
    navigator.clipboard?.writeText?.(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = (() => {
    try {
      const d = new Date(userProfile.createdAt);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  })();

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-slate-50 select-none pb-24">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center text-center space-y-3">
        {/* Circular avatar with "R" */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/30 border-4 border-white">
            R
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-slate-900">
            {userProfile.name}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {userProfile.phoneNumber || userProfile.email || '+91 • Mobile User'}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Member since {formattedDate}</span>
        </div>
      </div>

      {/* Quick Stats: Coins & Wallet */}
      <div className="grid grid-cols-2 gap-3">
        {/* Coins Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-amber-600">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Coins
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 pt-1">
            {userProfile.coins.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Available to hold
          </p>
        </div>

        {/* Wallet Card */}
        <div
          onClick={onNavigateToWallet}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Wallet
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-blue-600 group-hover:text-blue-700">
              View History
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Demo ledger details
          </p>
        </div>
      </div>

      {/* Referral Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Referral Program
            </h3>
            <p className="text-xs text-slate-500">
              Share your invite code with fellow testers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <code className="flex-1 font-mono text-sm font-bold text-blue-700 px-2 tracking-wider">
            {referralCode}
          </code>
          <button
            type="button"
            onClick={handleCopyReferral}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Actions: Contact Support, Settings, Logout */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm divide-y divide-slate-100">
        <button
          type="button"
          onClick={() => setActiveModal('support')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              Contact Support
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('settings')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              Settings
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-rose-50 text-left transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-rose-600 group-hover:text-rose-700">
              Logout
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>

      {/* Contact Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-blue-600" />
                Contact Support
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have questions about your demo rewards or task verification? Our developer team is here to assist.
            </p>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="text-slate-500 font-semibold">Support Email:</p>
              <p className="font-mono font-bold text-blue-700">support@taskreward.app</p>
              <p className="text-slate-400 text-[11px] pt-1">Response time: within 24 hours</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-700" />
                App Settings
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span>Application</span>
                <span className="font-bold text-slate-900">TaskReward Android</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span>Version</span>
                <span className="font-mono font-bold text-blue-600">v1.0.0 (Build 1)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span>Design System</span>
                <span className="font-bold text-slate-900">Material Design 3</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span>Database Engine</span>
                <span className="font-bold text-slate-900">Firebase Firestore</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Demo Reward Policy</span>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
