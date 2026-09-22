import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  RotateCcw,
  Mail,
  ArrowRight
} from 'lucide-react';
import { 
  DEFAULT_ADMIN_PASSWORD, 
  getStoredAdminPassword, 
  isDefaultAdminPassword, 
  changeAdminPassword, 
  setAdminPasswordDirectly,
  resetAdminPasswordToDefault,
  isAccountWithoutDefaultPassword,
  hasCustomPasswordConfigured
} from '../lib/authSecurity';
import { dispatchPortalAccessCodeEmail } from '../lib/emailService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onPasswordChanged?: (newPassword: string, email?: string) => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail = '',
  onPasswordChanged
}: ChangePasswordModalProps) {
  // Target email can be modified or confirmed if blank
  const [targetEmail, setTargetEmail] = useState(userEmail || 'cgumpo@yitzak.co.za');
  const isExemptFromDefault = isAccountWithoutDefaultPassword(targetEmail);
  const hasConfigured = hasCustomPasswordConfigured(targetEmail);

  // Method switcher: if account has no default and no configured password, force email_code
  const [method, setMethod] = useState<'current_password' | 'email_code'>('current_password');
  
  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Email Code Flow State
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const emailToUse = userEmail && userEmail.trim() ? userEmail.trim() : 'cgumpo@yitzak.co.za';
      setTargetEmail(emailToUse);

      const exempt = isAccountWithoutDefaultPassword(emailToUse);
      const configured = hasCustomPasswordConfigured(emailToUse);
      
      if (exempt && !configured) {
        setMethod('email_code');
        setIsDefault(false);
      } else {
        setIsDefault(isDefaultAdminPassword(emailToUse));
        setMethod('current_password');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setEmailCodeSent(false);
      setEmailCode('');
      setActiveCode(null);
    }
  }, [isOpen, userEmail]);

  // Countdown timer for code resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  if (!isOpen) return null;

  // Password strength evaluation
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3 || score === 4) return { score: 3, label: 'Good', color: 'bg-emerald-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-600' };
  };

  const strength = getStrength(newPassword);

  const handleSendCode = async () => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please specify an administrator email address.');
      return;
    }

    setSendingCode(true);
    setErrorMsg(null);
    try {
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);
      const generatedCode = (100000 + (randomBuffer[0] % 900000)).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000;

      setActiveCode(generatedCode);
      setCodeExpiresAt(expiresAt);
      setResendCountdown(45);
      setEmailCodeSent(true);

      const namePart = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      await dispatchPortalAccessCodeEmail(cleanEmail, generatedCode, displayName);
    } catch (err: any) {
      setErrorMsg('Failed to send verification code. Please check your internet connection.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = targetEmail.trim().toLowerCase();

    if (method === 'current_password') {
      if (isExemptFromDefault && !hasConfigured) {
        setErrorMsg(`No password has been set yet for ${cleanEmail}. Please use the "Email Code (OTP)" method to set your initial password.`);
        return;
      }

      if (!currentPassword) {
        setErrorMsg('Please enter your current password.');
        return;
      }
      if (!newPassword) {
        setErrorMsg('Please enter a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }

      const result = changeAdminPassword(currentPassword, newPassword, confirmPassword, cleanEmail);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      setSuccessMsg(result.message);
      setIsDefault(false);
      if (onPasswordChanged) onPasswordChanged(newPassword, cleanEmail);
      setTimeout(() => {
        onClose();
      }, 1600);

    } else {
      // Email code method
      if (!emailCode.trim()) {
        setErrorMsg('Please enter the 6-digit verification code dispatched to your email.');
        return;
      }
      if (codeExpiresAt && Date.now() > codeExpiresAt) {
        setErrorMsg('Verification code has expired. Please request a new code.');
        return;
      }
      if (emailCode.trim() !== activeCode) {
        setErrorMsg('Invalid verification code. Please check the code sent to your email.');
        return;
      }
      if (!newPassword) {
        setErrorMsg('Please enter a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }

      const result = setAdminPasswordDirectly(newPassword, cleanEmail);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      setSuccessMsg(`✓ Verified via email! Password for ${cleanEmail} has been set and activated.`);
      setIsDefault(false);
      if (onPasswordChanged) onPasswordChanged(newPassword, cleanEmail);
      setTimeout(() => {
        onClose();
      }, 1600);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-border overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#023625] text-white p-5 border-b border-[#034d35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#B68A35] border border-white/10 shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                {isExemptFromDefault && !hasConfigured ? 'Set Administrator Password' : 'Change Administrator Password'}
              </h3>
              <p className="text-xs text-white/70">Portal credentials for {targetEmail}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Method Switcher Tabs (Shown only when multiple verification paths are available) */}
        {(!isExemptFromDefault || hasConfigured) && (
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMethod('current_password');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  method === 'current_password'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                <Lock size={13} className={method === 'current_password' ? 'text-[#B68A35]' : ''} />
                <span>Use Current Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('email_code');
                  setErrorMsg(null);
                  if (!emailCodeSent) {
                    handleSendCode();
                  }
                }}
                className={`py-2 px-3 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  method === 'email_code'
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-slate-600 hover:text-primary'
                }`}
              >
                <Mail size={13} className={method === 'email_code' ? 'text-[#B68A35]' : ''} />
                <span>Verify via Email Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Email Confirmation */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="email"
                required
                value={targetEmail}
                onChange={(e) => {
                  setTargetEmail(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter administrator email"
                className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] focus:ring-1 focus:ring-[#B68A35] bg-slate-50 font-mono transition-colors"
              />
            </div>
          </div>

          {method === 'current_password' ? (
            <div>
              <div className="mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Current Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] focus:ring-1 focus:ring-[#B68A35] bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showCurrent ? 'Hide' : 'Show'}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Verification Code sent to {targetEmail}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-[#B68A35]" size={16} />
                <input
                  type="text"
                  maxLength={6}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-sm font-mono tracking-widest text-charcoal outline-none focus:border-[#B68A35] focus:ring-1 focus:ring-[#B68A35] bg-white transition-colors"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-slate-500">Code valid for 15 minutes</span>
                <button
                  type="button"
                  disabled={resendCountdown > 0 || sendingCode}
                  onClick={handleSendCode}
                  className="text-[#B68A35] hover:text-[#977028] font-semibold disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] focus:ring-1 focus:ring-[#B68A35] bg-white transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title={showNew ? 'Hide' : 'Show'}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Password Strength:</span>
                  <span className={`font-bold ${
                    strength.score <= 1 ? 'text-red-600' :
                    strength.score === 2 ? 'text-amber-600' :
                    'text-emerald-700'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 transition-all ${
                        step <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-9 pr-10 py-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] focus:ring-1 focus:ring-[#B68A35] bg-white transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title={showConfirm ? 'Hide' : 'Show'}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#023625] hover:bg-[#034d35] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={14} className="text-[#B68A35]" />
              <span>{isExemptFromDefault && !hasConfigured ? 'Save & Activate Password' : 'Save Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
