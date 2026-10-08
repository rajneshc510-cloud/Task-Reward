import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowLeft, RotateCcw, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Hidden secret verification token representing Firebase session (never displayed to user)
  const serverTokenRef = useRef<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(val);
    setErrorMessage(null);
  };

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const clean = phoneNumber.trim();
    if (clean.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!['6', '7', '8', '9'].includes(clean[0])) {
      setErrorMessage('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);

    // Simulate Firebase PhoneAuthProvider.verifyPhoneNumber
    setTimeout(() => {
      setIsLoading(false);
      // Generate a mock verificationId session token internally
      serverTokenRef.current = 'verif_' + Math.random().toString(36).substring(2, 9);
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(60);
      setIsTimerActive(true);
      // Focus first OTP box
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }, 600);
  };

  const handleResendOtp = () => {
    if (isTimerActive || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      serverTokenRef.current = 'verif_' + Math.random().toString(36).substring(2, 9);
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(60);
      setIsTimerActive(true);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }, 500);
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = char;
    setOtpDigits(newOtp);
    setErrorMessage(null);

    // Auto-advance to next input
    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP.');
      return;
    }

    // Handle test failure case if user enters e.g. '000000'
    if (fullOtp === '000000') {
      setErrorMessage('Incorrect OTP code. Please check and try again.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const formattedPhone = `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
      const userKey = `user_phone_${phoneNumber}`;

      // Check if user already exists in persistent Firestore mock store
      let userProfile: UserProfile;
      const existingUserJson = localStorage.getItem(userKey);

      if (existingUserJson) {
        // Returning user - load existing profile
        try {
          userProfile = JSON.parse(existingUserJson);
        } catch {
          userProfile = createNewUserProfile(phoneNumber, formattedPhone);
        }
      } else {
        // First login - create user's profile in Firestore
        userProfile = createNewUserProfile(phoneNumber, formattedPhone);
        localStorage.setItem(userKey, JSON.stringify(userProfile));
      }

      onLogin(userProfile);
    }, 600);
  };

  const createNewUserProfile = (phone: string, formattedPhone: string): UserProfile => {
    return {
      uid: 'usr_in_' + phone.slice(-6) + '_' + Math.random().toString(36).substring(2, 6),
      name: `User ${phone.slice(-4)}`,
      email: '',
      phoneNumber: formattedPhone,
      coins: 0,
      totalEarned: 0,
      createdAt: new Date().toISOString(),
    };
  };

  const handleEditPhone = () => {
    setStep('phone');
    setErrorMessage(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-8 bg-slate-50 select-none">
      <div className="max-w-sm w-full mx-auto space-y-6">
        {/* App Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            TaskReward
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Complete daily tasks and collect reward points
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          {step === 'phone' ? (
            /* STEP 1: MOBILE NUMBER INPUT */
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">
                  Mobile Login
                </h2>
                <p className="text-xs text-slate-500">
                  Enter your 10-digit mobile number to receive an OTP
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  {/* +91 India Country Code Badge */}
                  <div className="h-12 px-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-xs">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>

                  {/* 10-digit phone input */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="98765 43210"
                      maxLength={10}
                      autoFocus
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm font-semibold tracking-wide text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Standard SMS rates may apply from your carrier.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 10}
                className={`w-full h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isLoading || phoneNumber.length !== 10
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: 6-DIGIT OTP VERIFICATION */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEditPhone}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Verify OTP
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sent to <strong className="text-slate-800 font-semibold">+91 {phoneNumber}</strong>
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* 6-digit OTP Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 rounded-xl border border-slate-200 text-center text-lg font-black text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50/50"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleEditPhone}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Edit number
                  </button>

                  {isTimerActive ? (
                    <span className="text-slate-400 font-medium">
                      Resend in <strong className="text-slate-600">{resendTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpDigits.some((d) => !d)}
                className={`w-full h-12 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isLoading || otpDigits.some((d) => !d)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Phone Authentication • Never stores OTP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
