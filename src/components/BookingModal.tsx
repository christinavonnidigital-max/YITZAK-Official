import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  Loader2, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  Settings2,
  CalendarCheck,
  Video,
  Info,
  Send,
  User as UserIcon,
  Mail,
  Building,
  Phone,
  MessageSquare
} from 'lucide-react';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sendEmailViaVercel } from '../lib/emailService';
import { PILLARS } from '../data';
import CalendarDatePicker from './CalendarDatePicker';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess?: (user: User) => void;
  initialPillarId?: string;
  initialNotes?: string;
  onBookingSuccess?: () => void;
}

const PRIMARY_CALENDLY_URL = 'https://calendly.com/cgumpo-yitzak/30min';
const PROFILE_CALENDLY_URL = 'https://calendly.com/cgumpo-yitzak';

export default function BookingModal({
  isOpen,
  onClose,
  currentUser,
  initialPillarId = 'consulting',
  initialNotes = '',
  onBookingSuccess
}: BookingModalProps) {
  const [bookingMode, setBookingMode] = useState<'calendly' | 'direct'>('calendly');
  const [selectedPillar, setSelectedPillar] = useState(initialPillarId);
  const [notes, setNotes] = useState(initialNotes);
  const [calendlyUrl, setCalendlyUrl] = useState(() => {
    return PRIMARY_CALENDLY_URL;
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Direct Form State
  const [directForm, setDirectForm] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    company: '',
    phone: '',
    preferredDate: '',
    preferredTime: '10:00 AM (SAST)',
    message: initialNotes || ''
  });
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPillar(initialPillarId || 'consulting');
      setNotes(initialNotes || '');
      setDirectForm(prev => ({
        ...prev,
        fullName: currentUser?.displayName || prev.fullName || '',
        email: currentUser?.email || prev.email || '',
        message: initialNotes || prev.message || ''
      }));
      setCalendlyUrl(PRIMARY_CALENDLY_URL);
      setIsLoadingIframe(true);
      setBookingConfirmed(false);
      setDirectSuccess(false);
      setDirectError(null);
      setIsEditingUrl(false);
    }
  }, [isOpen, initialPillarId, initialNotes, currentUser]);

  // Listen to Calendly PostMessage Events
  useEffect(() => {
    const handleCalendlyEvent = async (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      
      if (e.data.event === 'calendly.event_scheduled') {
        const payload = e.data.payload || {};
        setBookingConfirmed(true);

        const refCode = `YTZ-CAL-${Math.floor(100000 + Math.random() * 900000)}`;
        const pillarInfo = PILLARS.find(p => p.id === selectedPillar);
        const pillarTitle = pillarInfo ? pillarInfo.title : 'Institutional Advisory';

        const bookingRecord = {
          bookingRef: refCode,
          userName: directForm.fullName || currentUser?.displayName || 'Client',
          userEmail: directForm.email || currentUser?.email || 'client@yitzak.co.za',
          pillar: pillarTitle,
          pillarId: selectedPillar,
          notes: notes,
          status: 'confirmed',
          scheduledVia: 'Calendly Live Sync',
          eventUri: payload.event?.uri || '',
          inviteeUri: payload.invitee?.uri || '',
          createdAt: new Date().toISOString()
        };

        try {
          const docId = `booking_${Date.now()}_${refCode}`;
          await setDoc(doc(db, 'consultation_requests', docId), {
            ...bookingRecord,
            timestamp: serverTimestamp()
          });
        } catch (err) {
          console.warn('Firestore fallback on Calendly booking:', err);
        }

        const stored = JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]');
        stored.push(bookingRecord);
        localStorage.setItem('yitzak_consultation_requests', JSON.stringify(stored));

        if (onBookingSuccess) {
          onBookingSuccess();
        }
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, [selectedPillar, notes, directForm, currentUser, onBookingSuccess]);

  if (!isOpen) return null;

  const currentPillarObj = PILLARS.find(p => p.id === selectedPillar) || PILLARS[0];

  // Cleanly format Calendly URL for iframe embedding
  const getFullCalendlyUrl = () => {
    try {
      const cleanBase = calendlyUrl.trim() || PRIMARY_CALENDLY_URL;
      const url = new URL(cleanBase);
      
      // Standard embed params
      url.searchParams.set('hide_landing_page_details', '1');
      url.searchParams.set('hide_gdpr_banner', '1');
      url.searchParams.set('primary_color', '023625');
      url.searchParams.set('text_color', '012B1D');
      
      if (directForm.fullName) {
        url.searchParams.set('name', directForm.fullName);
      }
      if (directForm.email) {
        url.searchParams.set('email', directForm.email);
      }

      return url.toString();
    } catch {
      return calendlyUrl;
    }
  };

  const handleSaveCustomUrl = () => {
    if (customUrlInput.trim()) {
      let formatted = customUrlInput.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = 'https://' + formatted;
      }
      setCalendlyUrl(formatted);
      setIsEditingUrl(false);
      setIsLoadingIframe(true);
    }
  };

  const handleResetUrl = () => {
    setCalendlyUrl(PRIMARY_CALENDLY_URL);
    setIsEditingUrl(false);
    setIsLoadingIframe(true);
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directForm.fullName || !directForm.email || !directForm.company) {
      setDirectError('Please fill in your name, work email, and company.');
      return;
    }

    if (directForm.preferredDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(directForm.preferredDate);
      if (selected < today) {
        setDirectError('Preferred consultation date must be in the future.');
        return;
      }
    }

    setIsSubmittingDirect(true);
    setDirectError(null);

    const refCode = `YTZ-DIR-${Math.floor(100000 + Math.random() * 900000)}`;
    const payload = {
      bookingRef: refCode,
      userName: directForm.fullName,
      userEmail: directForm.email,
      company: directForm.company,
      phone: directForm.phone,
      pillar: currentPillarObj.title,
      pillarId: selectedPillar,
      preferredDate: directForm.preferredDate || 'Earliest Available',
      preferredTime: directForm.preferredTime,
      notes: directForm.message || notes,
      status: 'pending',
      scheduledVia: 'Direct Institutional Request',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Save to Firestore
      const docId = `booking_${Date.now()}_${refCode}`;
      await setDoc(doc(db, 'consultation_requests', docId), {
        ...payload,
        timestamp: serverTimestamp()
      });
    } catch (dbErr) {
      console.warn('Firestore direct write fallback:', dbErr);
    }

    // 2. Local Storage Backup
    try {
      const stored = JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]');
      stored.push(payload);
      localStorage.setItem('yitzak_consultation_requests', JSON.stringify(stored));
    } catch {}

    // 3. Email Dispatch via Resend / Vercel Service
    try {
      await sendEmailViaVercel({
        to: ['christinagumpo@gmail.com', 'info@yitzak.co.za'],
        subject: `Institutional Consultation Request: ${directForm.company} (${directForm.fullName})`,
        html: `
          <h2>New Institutional Consultation Scheduled</h2>
          <p><strong>Client:</strong> ${directForm.fullName} (${directForm.email})</p>
          <p><strong>Company:</strong> ${directForm.company}</p>
          <p><strong>Phone:</strong> ${directForm.phone || 'N/A'}</p>
          <p><strong>Advisory Focus:</strong> ${currentPillarObj.title}</p>
          <p><strong>Requested Date:</strong> ${directForm.preferredDate || 'Flexible'}</p>
          <p><strong>Preferred Time Slot:</strong> ${directForm.preferredTime}</p>
          <p><strong>Inquiry Notes:</strong><br>${(directForm.message || notes || 'None specified').replace(/\n/g, '<br>')}</p>
        `,
        type: 'booking'
      });
    } catch (mailErr) {
      console.warn('Direct consultation notification dispatch note:', mailErr);
    }

    setIsSubmittingDirect(false);
    setDirectSuccess(true);
    if (onBookingSuccess) onBookingSuccess();
  };

  return (
    <AnimatePresence>
      <div 
        id="calendly-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#00140D]/80 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="bg-[#012B1D] text-white px-5 sm:px-8 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B68A35]/20 border border-[#B68A35]/40 flex items-center justify-center text-[#E6CA85]">
                <CalendarCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                    Schedule Institutional Consultation
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#B68A35]/20 text-[#E6CA85] text-[10px] font-mono tracking-wider font-semibold border border-[#B68A35]/30">
                    <Sparkles size={10} />
                    Live Calendar
                  </span>
                </div>
                <p className="text-xs text-white/70">
                  Select a live advisory slot with our lead food safety compliance specialists.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              <div className="hidden sm:flex items-center bg-white/10 p-0.5 rounded-lg border border-white/15 text-xs mr-1">
                <button
                  onClick={() => setBookingMode('calendly')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    bookingMode === 'calendly' 
                      ? 'bg-[#B68A35] text-white shadow-xs' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Calendly Live
                </button>
                <button
                  onClick={() => setBookingMode('direct')}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    bookingMode === 'direct' 
                      ? 'bg-[#B68A35] text-white shadow-xs' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Direct Form
                </button>
              </div>

              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#E6CA85] hover:text-white text-xs font-sans font-medium transition-colors border border-white/10"
                title="Open directly in Calendly tab"
              >
                <span>Open in Tab</span>
                <ExternalLink size={12} />
              </a>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Service Pillar Selector Bar */}
          <div className="bg-[#FAF8F5] border-b border-border/70 px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
              <span className="font-semibold text-primary/70 shrink-0 font-sans">Advisory Focus:</span>
              <div className="flex items-center gap-1.5">
                {PILLARS.map((pillar) => {
                  const isSelected = selectedPillar === pillar.id;
                  return (
                    <button
                      key={pillar.id}
                      onClick={() => {
                        setSelectedPillar(pillar.id);
                        setIsLoadingIframe(true);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                        isSelected
                          ? 'bg-[#023625] text-white border-[#023625] shadow-xs'
                          : 'bg-white text-primary/80 border-border/80 hover:border-[#B68A35]/50 hover:text-[#B68A35]'
                      }`}
                    >
                      {pillar.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Switcher & Config */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setBookingMode(bookingMode === 'calendly' ? 'direct' : 'calendly')}
                className="sm:hidden text-[11px] font-bold text-[#B68A35] underline cursor-pointer"
              >
                {bookingMode === 'calendly' ? 'Switch to Direct Form' : 'Switch to Calendly'}
              </button>
              
              {bookingMode === 'calendly' && (
                <button
                  onClick={() => {
                    setIsEditingUrl(!isEditingUrl);
                    setCustomUrlInput(calendlyUrl);
                  }}
                  className="text-[11px] text-ash hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                  title="Configure Calendly URL endpoint"
                >
                  <Settings2 size={13} />
                  <span>Configure Link</span>
                </button>
              )}
            </div>
          </div>

          {/* Optional Custom Link Configuration Bar */}
          {isEditingUrl && bookingMode === 'calendly' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-mist/80 border-b border-border p-3 px-5 sm:px-8 flex flex-col gap-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <span className="font-semibold text-primary shrink-0">Calendly URL:</span>
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://calendly.com/cgumpo-yitzak/30min"
                  className="w-full bg-white border border-border px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#023625]"
                />
                <div className="flex items-center gap-2 shrink-0 justify-end">
                  <button
                    onClick={handleSaveCustomUrl}
                    className="px-3 py-1.5 bg-[#023625] hover:bg-[#034d35] text-white font-medium rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setCalendlyUrl(PROFILE_CALENDLY_URL);
                      setIsEditingUrl(false);
                      setIsLoadingIframe(true);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-border text-primary rounded-lg text-xs cursor-pointer hover:bg-mist"
                    title="Use main profile link"
                  >
                    Use Profile Link
                  </button>
                  <button
                    onClick={handleResetUrl}
                    className="px-2.5 py-1.5 text-ash hover:text-primary text-xs cursor-pointer transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Modal Body: Calendly Embed OR Direct Booking Form */}
          <div className="relative flex-1 bg-white min-h-[520px] sm:min-h-[580px] overflow-y-auto flex flex-col">
            {bookingMode === 'calendly' ? (
              <>
                {/* Calendly Live Sync Banner */}
                {bookingConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#023625] text-white p-4 px-6 flex items-center justify-between gap-4 shrink-0 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E6CA85] text-[#012B1D] flex items-center justify-center">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#E6CA85]">
                          Consultation Successfully Scheduled!
                        </h4>
                        <p className="text-xs text-white/80">
                          Calendar invites and video conference details have been dispatched to your email.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-4 py-1.5 bg-[#B68A35] hover:bg-[#9E7528] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Done
                    </button>
                  </motion.div>
                )}

                {/* Quick Helper Toolbar above iframe */}
                <div className="bg-[#FAF8F5] border-b border-border/70 px-5 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-primary/80">
                    <span className="font-mono text-[11px] font-semibold text-[#7d5800]">Endpoint:</span>
                    <code className="text-[11px] bg-white px-2 py-0.5 rounded border border-border">{calendlyUrl}</code>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={calendlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#023625] hover:text-[#B68A35] font-bold text-xs flex items-center gap-1 underline underline-offset-2"
                    >
                      <span>Open directly in Calendly</span>
                      <ExternalLink size={11} />
                    </a>
                    <span className="text-border">|</span>
                    <button
                      onClick={() => setBookingMode('direct')}
                      className="text-[#B68A35] hover:text-[#7d5800] font-bold text-xs cursor-pointer"
                    >
                      Use Direct Form
                    </button>
                  </div>
                </div>

                {/* Loading Placeholder */}
                {isLoadingIframe && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10">
                    <Loader2 size={32} className="text-[#023625] animate-spin" />
                    <div className="text-center">
                      <p className="font-serif font-bold text-sm text-primary">Loading Live Advisory Calendar...</p>
                      <p className="text-xs text-ash">Connecting to real-time advisor availability</p>
                    </div>
                  </div>
                )}

                {/* Responsive Calendly Embed iframe */}
                <iframe
                  ref={iframeRef}
                  src={getFullCalendlyUrl()}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Yitzak Institutional Consultation Scheduler"
                  className="w-full flex-1 min-h-[500px] sm:min-h-[560px]"
                  onLoad={() => setIsLoadingIframe(false)}
                />
              </>
            ) : (
              /* Direct Consultation Booking Form */
              <div className="p-6 sm:p-10 max-w-2xl mx-auto w-full space-y-6">
                {directSuccess ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="font-serif text-2xl font-bold text-emerald-950">
                      Consultation Request Transmitted
                    </h4>
                    <p className="text-emerald-800 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{directForm.fullName}</strong>. Your consultation request for <strong>{currentPillarObj.title}</strong> has been received. Our lead advisory director will contact you at <strong>{directForm.email}</strong> to confirm the exact session schedule.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-4 bg-[#023625] hover:bg-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDirectSubmit} className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h4 className="font-serif text-xl font-bold text-primary">
                        Direct Advisory Booking Request
                      </h4>
                      <p className="text-xs text-ash mt-1">
                        Submit your details to receive immediate consultation confirmation and video credentials.
                      </p>
                    </div>

                    {directError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                        {directError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={directForm.fullName}
                          onChange={(e) => setDirectForm({ ...directForm, fullName: e.target.value })}
                          placeholder="e.g. Dr. Arthur Mthembu"
                          className="w-full px-3.5 py-2.5 bg-mist border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-[#B68A35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                          Corporate Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={directForm.email}
                          onChange={(e) => setDirectForm({ ...directForm, email: e.target.value })}
                          placeholder="name@enterprise.co.za"
                          className="w-full px-3.5 py-2.5 bg-mist border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-[#B68A35]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                          Company / Facility *
                        </label>
                        <input
                          type="text"
                          required
                          value={directForm.company}
                          onChange={(e) => setDirectForm({ ...directForm, company: e.target.value })}
                          placeholder="e.g. Enterprise Agribusiness Ltd"
                          className="w-full px-3.5 py-2.5 bg-mist border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-[#B68A35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={directForm.phone}
                          onChange={(e) => setDirectForm({ ...directForm, phone: e.target.value })}
                          placeholder="+27 (0) 11 000 0000"
                          className="w-full px-3.5 py-2.5 bg-mist border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-[#B68A35]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CalendarDatePicker
                        label="Preferred Date"
                        value={directForm.preferredDate}
                        onChange={(selectedDate) => setDirectForm({ ...directForm, preferredDate: selectedDate })}
                        allowToday={false}
                      />

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                          Preferred Time Window
                        </label>
                        <select
                          value={directForm.preferredTime}
                          onChange={(e) => setDirectForm({ ...directForm, preferredTime: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-mist border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-[#B68A35]"
                        >
                          <option value="09:00 AM - 11:00 AM (SAST)">Morning (09:00 - 11:00 SAST)</option>
                          <option value="11:00 AM - 01:00 PM (SAST)">Midday (11:00 - 13:00 SAST)</option>
                          <option value="02:00 PM - 04:00 PM (SAST)">Afternoon (14:00 - 16:00 SAST)</option>
                          <option value="04:00 PM - 05:30 PM (SAST)">Late Afternoon (16:00 - 17:30 SAST)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        Specific Scope / Requirements
                      </label>
                      <textarea
                        rows={3}
                        value={directForm.message}
                        onChange={(e) => setDirectForm({ ...directForm, message: e.target.value })}
                        placeholder="Detail your certification standard (e.g. ISO 22000, FSSC 22000, BRCGS, HACCP) or advisory scope..."
                        className="w-full px-3.5 py-2.5 bg-mist border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-[#B68A35]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingDirect}
                      className="w-full bg-[#023625] hover:bg-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingDirect ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      <span>Submit Consultation Request</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer / Value Props */}
          <div className="bg-[#FAF8F5] border-t border-border px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ash shrink-0">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-primary/80 font-medium">
                <ShieldCheck size={14} className="text-[#023625]" />
                Confidential &amp; NDA Protected
              </span>
              <span className="flex items-center gap-1 text-primary/80 font-medium">
                <Video size={14} className="text-[#B68A35]" />
                Direct Video Session
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-ash">
                Need urgent assistance? <a href="mailto:info@yitzak.co.za" className="text-[#023625] font-semibold hover:underline">info@yitzak.co.za</a>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
