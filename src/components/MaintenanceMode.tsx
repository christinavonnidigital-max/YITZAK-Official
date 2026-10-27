import React, { useState } from 'react';
import { Mail, Shield, Lock, ArrowRight, Check, KeyRound, MapPin, ExternalLink, Clock } from 'lucide-react';
import { verifyStaffBypassPin, setStaffBypass } from '../lib/maintenanceConfig';
import YitzakLogo from './YitzakLogo';

interface MaintenanceModeProps {
  onBypassGranted: () => void;
}

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ onBypassGranted }) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyStaffBypassPin(pinInput)) {
      setStaffBypass(true);
      onBypassGranted();
    } else {
      setErrorMsg('Invalid staff access PIN. Please try again.');
    }
  };

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#023625] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#B68A35] selection:text-white">
      {/* Background Subtle Geometric Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, #B68A35 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Top Header / Subtle Logo */}
      <header className="relative z-10 pt-8 sm:pt-10 px-6 sm:px-12 max-w-6xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YitzakLogo lightMode size={36} />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-[#DFC181]">
          <span className="w-2 h-2 rounded-full bg-[#DFC181] animate-pulse" />
          <span>Status: Scheduled Maintenance</span>
        </div>
      </header>

      {/* Main Hero Card Container */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 sm:py-16 text-center flex flex-col items-center justify-center my-auto">
        {/* Official YITZAK Brand Logo */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-[#B68A35]/30">
            <img 
              src="/YITZAK-logo-green.png" 
              alt="YITZAK Consulting" 
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3 mb-6">
          <div className="inline-block">
            <span className="text-[#DFC181] font-mono text-xs sm:text-sm font-bold uppercase tracking-widest bg-[#B68A35]/15 border border-[#B68A35]/30 px-3.5 py-1 rounded-full">
              Developing Competence · Enabling Compliance
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Our Website Is Temporarily Offline
          </h1>
          <p className="font-serif italic text-base sm:text-lg text-[#DFC181]/90 max-w-xl mx-auto">
            Undergoing scheduled governance &amp; platform updates
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-white/5 border border-white/15 backdrop-blur-md rounded-2xl p-6 sm:p-8 max-w-2xl text-left space-y-4 shadow-xl">
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            The Yitzak Consulting website is currently undergoing planned maintenance, technical enhancements, and compliance reviews.
          </p>
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#DFC181] uppercase tracking-wider font-semibold">
              <Clock size={14} />
              <span>Advisory &amp; Client Engagements Remain Fully Active</span>
            </div>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Our consulting operations, gap assessments, client advisory, and training schedules remain fully operational. Please contact our team directly using the details below:
            </p>
          </div>

          {/* Contact Direct Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white/10 hover:bg-white/15 transition-all border border-white/10 rounded-xl p-3.5 flex items-center justify-between group">
              <a 
                href="mailto:cgumpo@yitzak.co.za" 
                className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-white truncate hover:text-[#DFC181] transition-colors"
              >
                <Mail size={16} className="text-[#DFC181] shrink-0" />
                <span className="truncate">cgumpo@yitzak.co.za</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy('cgumpo@yitzak.co.za')}
                className="text-[11px] font-mono text-[#DFC181] hover:underline shrink-0 ml-2 cursor-pointer"
                title="Copy email address"
              >
                {copiedEmail === 'cgumpo@yitzak.co.za' ? (
                  <span className="flex items-center gap-1 text-emerald-400"><Check size={12} /> Copied</span>
                ) : (
                  'Copy'
                )}
              </button>
            </div>

            <div className="bg-white/10 hover:bg-white/15 transition-all border border-white/10 rounded-xl p-3.5 flex items-center justify-between group">
              <a 
                href="mailto:info@yitzak.co.za" 
                className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-white truncate hover:text-[#DFC181] transition-colors"
              >
                <Mail size={16} className="text-[#DFC181] shrink-0" />
                <span className="truncate">info@yitzak.co.za</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy('info@yitzak.co.za')}
                className="text-[11px] font-mono text-[#DFC181] hover:underline shrink-0 ml-2 cursor-pointer"
                title="Copy email address"
              >
                {copiedEmail === 'info@yitzak.co.za' ? (
                  <span className="flex items-center gap-1 text-emerald-400"><Check size={12} /> Copied</span>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="mailto:cgumpo@yitzak.co.za?subject=Website%20Enquiry%20-%20Yitzak%20Consulting"
            className="bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-7 rounded-xl transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
          >
            <Mail size={15} />
            <span>Send Email to Business Development</span>
          </a>
        </div>
      </main>

      {/* Footer & Staff Bypass Entry Point */}
      <footer className="relative z-10 py-6 px-6 max-w-6xl mx-auto w-full border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <MapPin size={13} className="text-[#DFC181] shrink-0" />
          <span>359 Surrey Avenue, Ferndale, Randburg, South Africa</span>
        </div>

        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Yitzak Consulting (Pty) Ltd</span>
          <span className="text-white/20">·</span>
          {/* Subtle Staff / Admin Bypass Link */}
          <button
            type="button"
            onClick={() => setShowPinModal(true)}
            className="text-white/40 hover:text-[#DFC181] transition-colors underline underline-offset-2 flex items-center gap-1 text-[11px] cursor-pointer"
            title="Authorized staff preview access"
          >
            <Lock size={11} />
            <span>Staff Access</span>
          </button>
        </div>
      </footer>

      {/* Staff Bypass PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#023625] border-2 border-[#B68A35]/60 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-white shadow-2xl relative">
            <button
              onClick={() => {
                setShowPinModal(false);
                setErrorMsg('');
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-lg cursor-pointer"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B68A35]/20 border border-[#B68A35]/40 flex items-center justify-center text-[#DFC181]">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Staff Preview Access</h3>
                <p className="text-[11px] text-white/60">Enter bypass PIN to view the full website</p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#DFC181] mb-1.5 uppercase tracking-wider">
                  Access PIN / Code
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter staff PIN (e.g. yitzak2026)"
                  autoFocus
                  className="w-full bg-white/10 border border-white/20 focus:border-[#B68A35] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition-all font-mono"
                />
                {errorMsg && (
                  <p className="text-xs text-rose-300 mt-1.5 font-sans">{errorMsg}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#B68A35] hover:bg-[#a3792c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceMode;
