import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Check, KeyRound, MapPin, Clock, Phone, ShieldCheck } from 'lucide-react';
import { verifyStaffBypassPin, setStaffBypass } from '../lib/maintenanceConfig';

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
      {/* Background Subtle Luxury Radial Lighting */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 900px 600px at 50% 15%, rgba(182, 138, 53, 0.12), transparent 70%),
            radial-gradient(ellipse 700px 500px at 80% 85%, rgba(2, 54, 37, 0.8), transparent 70%),
            radial-gradient(ellipse 600px 400px at 20% 90%, rgba(182, 138, 53, 0.06), transparent 70%)
          `
        }}
      />

      {/* Subtle Micro-Grid Texture */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #DFC181 1.5px, transparent 0%)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 pt-8 sm:pt-10 px-6 sm:px-12 max-w-6xl mx-auto w-full flex items-center justify-between gap-6 border-b border-white/10 pb-6">
        {/* Brand Lockup: Authentic White Yitzak Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/YITZAK-logo-green.png" 
            alt="YITZAK Consulting" 
            className="h-9 sm:h-10 w-auto object-contain brightness-0 invert select-none"
          />
        </div>

        {/* Status & Staff Access Trigger */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#DFC181] tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#B68A35] shadow-[0_0_8px_#DFC181]" />
            <span>Scheduled Maintenance</span>
          </div>

          <button
            type="button"
            onClick={() => setShowPinModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white/80 hover:text-white transition-all border border-white/15 cursor-pointer font-sans"
            title="Authorized staff preview"
          >
            <Lock size={12} className="text-[#DFC181]" />
            <span className="text-[11px] font-medium tracking-wide">Staff Access</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 sm:py-16 text-center flex flex-col items-center justify-center my-auto w-full">
        
        {/* Authentic Gold Emblem Crest (No Clunky White Box!) */}
        <div className="mb-6 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#B68A35]/20 blur-2xl rounded-full transform scale-125 pointer-events-none" />
          <img 
            src="/YITZAK-icon-gold.png" 
            alt="Yitzak Institutional Emblem" 
            className="h-20 sm:h-24 w-auto object-contain relative z-10 filter drop-shadow-[0_12px_24px_rgba(182,138,53,0.3)] select-none transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Brand Tagline */}
        <p className="text-[#DFC181] font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] mb-4">
          Developing Competence &bull; Enabling Compliance
        </p>

        {/* Primary Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] max-w-2xl mb-4">
          Our Website Is Temporarily Offline
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed mb-10">
          We are currently executing scheduled governance reviews, digital platform updates, and compliance enhancements.
        </p>

        {/* Executive Reassurance & Advisory Card */}
        <div className="relative w-full max-w-2xl bg-[#012217]/90 border border-[#B68A35]/35 rounded-2xl p-6 sm:p-8 text-left shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Subtle Top Gold Highlight Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#DFC181] to-transparent" />

          {/* Section Indicator */}
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#DFC181] uppercase tracking-wider font-semibold mb-3">
            <ShieldCheck size={16} className="text-[#DFC181] shrink-0" />
            <span>Advisory &amp; Consulting Operations Fully Active</span>
          </div>

          <p className="text-sm text-white/90 leading-relaxed mb-6">
            Our consulting engagements, gap assessments, food safety advisory, and management system implementation schedules continue without interruption across Southern Africa.
          </p>

          {/* Contact Direct Link Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {/* Lead Consultant Card */}
            <div className="bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-[#B68A35]/40 rounded-xl p-4 flex flex-col justify-between group">
              <div>
                <span className="text-[10px] font-mono text-[#DFC181] uppercase tracking-wider block mb-1">
                  Lead Consultant &bull; Advisory Desk
                </span>
                <span className="text-xs font-medium text-white/70 block mb-2">
                  Cynthia Gumpo
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <a 
                  href="mailto:cgumpo@yitzak.co.za?subject=Advisory%20Enquiry%20-%20Yitzak" 
                  className="flex items-center gap-2 text-xs font-semibold text-white truncate hover:text-[#DFC181] transition-colors"
                >
                  <Mail size={14} className="text-[#DFC181] shrink-0" />
                  <span className="truncate">cgumpo@yitzak.co.za</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('cgumpo@yitzak.co.za')}
                  className="text-[11px] font-mono text-[#DFC181] hover:text-white shrink-0 ml-1 cursor-pointer transition-colors"
                  title="Copy email"
                >
                  {copiedEmail === 'cgumpo@yitzak.co.za' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold"><Check size={12} /> Copied</span>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>
            </div>

            {/* General Inquiries Card */}
            <div className="bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-[#B68A35]/40 rounded-xl p-4 flex flex-col justify-between group">
              <div>
                <span className="text-[10px] font-mono text-[#DFC181] uppercase tracking-wider block mb-1">
                  General Enquiries &bull; Head Office
                </span>
                <span className="text-xs font-medium text-white/70 block mb-2">
                  Client Support &amp; Training
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                <a 
                  href="mailto:info@yitzak.co.za?subject=General%20Enquiry%20-%20Yitzak" 
                  className="flex items-center gap-2 text-xs font-semibold text-white truncate hover:text-[#DFC181] transition-colors"
                >
                  <Mail size={14} className="text-[#DFC181] shrink-0" />
                  <span className="truncate">info@yitzak.co.za</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy('info@yitzak.co.za')}
                  className="text-[11px] font-mono text-[#DFC181] hover:text-white shrink-0 ml-1 cursor-pointer transition-colors"
                  title="Copy email"
                >
                  {copiedEmail === 'info@yitzak.co.za' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold"><Check size={12} /> Copied</span>
                  ) : (
                    'Copy'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Direct CTA Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <a
              href="mailto:cgumpo@yitzak.co.za?subject=Urgent%20Consulting%20Enquiry%20-%20Yitzak%20Consulting"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B68A35] hover:bg-[#a07629] text-white font-sans text-xs uppercase tracking-wider font-bold py-3.5 px-6 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-xl hover:translate-y-[-1px]"
            >
              <Mail size={15} />
              <span>Send Advisory Request</span>
              <ArrowRight size={14} />
            </a>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <Phone size={13} className="text-[#DFC181] shrink-0" />
              <span>Direct: <a href="tel:+27102107715" className="hover:text-white text-white/80 transition-colors">+27 10 210 7715</a></span>
            </div>
          </div>

          {/* Impartiality / Independence Governance Footnote */}
          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-white/50 leading-relaxed">
            <span className="font-semibold text-white/70">ISO/IEC 17021-1 Governance:</span> Yitzak Consulting (Pty) Ltd is an independent management systems advisory firm. Certification is conducted autonomously by independent accredited certification bodies.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6 max-w-6xl mx-auto w-full border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <MapPin size={13} className="text-[#DFC181] shrink-0" />
          <span>359 Surrey Avenue, Ferndale, Randburg, 2194, South Africa</span>
        </div>

        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Yitzak Consulting (Pty) Ltd</span>
          <span className="text-white/20">&bull;</span>
          <button
            type="button"
            onClick={() => setShowPinModal(true)}
            className="text-white/50 hover:text-[#DFC181] transition-colors underline underline-offset-2 flex items-center gap-1 text-[11px] cursor-pointer"
            title="Authorized staff preview access"
          >
            <Lock size={11} />
            <span>Staff Portal</span>
          </button>
        </div>
      </footer>

      {/* Staff Bypass PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#023625] border-2 border-[#B68A35]/60 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-white shadow-2xl relative animate-in fade-in duration-200">
            <button
              onClick={() => {
                setShowPinModal(false);
                setErrorMsg('');
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-xl cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B68A35]/20 border border-[#B68A35]/40 flex items-center justify-center text-[#DFC181]">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Staff Preview Access</h3>
                <p className="text-[11px] text-white/60">Enter bypass PIN to preview the full site</p>
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
                  placeholder="Enter staff PIN"
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
                  className="w-1/2 py-2.5 rounded-xl bg-[#B68A35] hover:bg-[#a3792c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-colors"
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
