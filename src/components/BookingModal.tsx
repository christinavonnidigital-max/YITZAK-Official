import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  CheckCircle2, 
  X, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  CalendarCheck,
  Send,
  User as UserIcon,
  Mail,
  Building,
  Phone,
  ChevronRight,
  ExternalLink,
  Info
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

export default function BookingModal({
  isOpen,
  onClose,
  currentUser,
  initialPillarId = 'consulting',
  initialNotes = '',
  onBookingSuccess
}: BookingModalProps) {
  // Default to Direct Institutional Request for 0-latency and no CAPTCHA friction
  const [bookingMode, setBookingMode] = useState<'direct' | 'calendly'>('direct');
  const [selectedPillar, setSelectedPillar] = useState(initialPillarId);
  const [notes, setNotes] = useState(initialNotes);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Direct Form State
  const [directForm, setDirectForm] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    company: '',
    phone: '',
    preferredDate: '',
    preferredTime: '10:00 AM - 12:00 PM (SAST)',
    message: initialNotes || ''
  });
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setBookingMode('direct');
      setSelectedPillar(initialPillarId || 'consulting');
      setNotes(initialNotes || '');
      setDirectForm(prev => ({
        ...prev,
        fullName: currentUser?.displayName || prev.fullName || '',
        email: currentUser?.email || prev.email || '',
        message: initialNotes || prev.message || ''
      }));
      setBookingConfirmed(false);
      setDirectSuccess(false);
      setDirectError(null);
      setIsIframeLoaded(false);
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
      const url = new URL(PRIMARY_CALENDLY_URL);
      url.searchParams.set('hide_landing_page_details', '1');
      url.searchParams.set('hide_gdpr_banner', '1');
      url.searchParams.set('background_color', 'ffffff');
      url.searchParams.set('text_color', '012b1d');
      url.searchParams.set('primary_color', '023625');
      
      if (directForm.fullName) {
        url.searchParams.set('name', directForm.fullName);
      }
      if (directForm.email) {
        url.searchParams.set('email', directForm.email);
      }

      return url.toString();
    } catch {
      return PRIMARY_CALENDLY_URL;
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directForm.fullName.trim() || !directForm.email.trim() || !directForm.company.trim()) {
      setDirectError('Please fill in your full name, work email, and company.');
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
      userName: directForm.fullName.trim(),
      userEmail: directForm.email.trim(),
      company: directForm.company.trim(),
      phone: directForm.phone.trim(),
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
      const docId = `booking_${Date.now()}_${refCode}`;
      await setDoc(doc(db, 'consultation_requests', docId), {
        ...payload,
        timestamp: serverTimestamp()
      });
    } catch (dbErr) {
      console.warn('Firestore direct write fallback:', dbErr);
    }

    try {
      const stored = JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]');
      stored.push(payload);
      localStorage.setItem('yitzak_consultation_requests', JSON.stringify(stored));
    } catch {}

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
        id="consultation-booking-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#00140D]/85 backdrop-blur-md overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh]"
        >
          {/* Executive Header */}
          <div className="bg-[#023625] text-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#B68A35]/20 border border-[#B68A35]/40 flex items-center justify-center text-[#E6CA85] shrink-0">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
                    Schedule Institutional Consultation
                  </h3>
                  <p className="text-[11px] text-white/70 leading-tight mt-0.5">
                    Select your advisory focus and scheduling preference
                  </p>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                className="sm:hidden w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Header Right: Segmented Switcher & Desktop Close */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <div className="inline-flex items-center bg-black/25 p-0.5 rounded-lg border border-white/10 text-xs w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setBookingMode('direct')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bookingMode === 'direct' 
                      ? 'bg-[#B68A35] text-white shadow-xs' 
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <Send size={11} />
                  <span>Direct Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('calendly')}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bookingMode === 'calendly' 
                      ? 'bg-[#B68A35] text-white shadow-xs' 
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <Calendar size={12} />
                  <span>Live Calendly</span>
                </button>
              </div>

              {/* Desktop Close Button */}
              <button
                onClick={onClose}
                className="hidden sm:flex w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 items-center justify-center transition-colors cursor-pointer border border-white/10 shrink-0"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="relative flex-1 bg-white overflow-y-auto flex flex-col">
            {bookingMode === 'direct' ? (
              /* PRIMARY DEFAULT: Direct Consultation Request Form */
              <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto w-full">
                {directSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#FAF8F5] border border-[#B68A35]/30 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-xs"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#023625] text-[#E6CA85] flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={26} />
                    </div>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-primary">
                      Consultation Request Received
                    </h4>
                    <p className="text-ash text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{directForm.fullName}</strong>. Your consultation request for <strong>{currentPillarObj.title}</strong> has been transmitted. Our team will contact you at <strong>{directForm.email}</strong> promptly.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={onClose}
                        className="bg-[#023625] hover:bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Close Window
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleDirectSubmit} className="space-y-4">
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-primary">
                        Institutional Consultation Request
                      </h4>
                      <p className="text-[11px] sm:text-xs text-ash mt-0.5">
                        Direct priority scheduling with our lead food safety and compliance specialists.
                      </p>
                    </div>

                    {directError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <span>{directError}</span>
                      </div>
                    )}

                    {/* Step 1: Select Advisory Focus */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-1.5">
                        1. Advisory Pillar Focus
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                        {PILLARS.map((pillar) => {
                          const isSelected = selectedPillar === pillar.id;
                          return (
                            <button
                              key={pillar.id}
                              type="button"
                              onClick={() => setSelectedPillar(pillar.id)}
                              className={`p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-[#023625] text-white border-[#023625] shadow-xs'
                                  : 'bg-[#FAF8F5] text-primary/80 border-border/80 hover:border-[#B68A35]/60 hover:bg-white'
                              }`}
                            >
                              <span className="text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2">
                                {pillar.title}
                              </span>
                              <span className={`text-[9px] sm:text-[10px] mt-1 flex items-center gap-0.5 font-medium ${
                                isSelected ? 'text-[#E6CA85]' : 'text-ash'
                              }`}>
                                {isSelected ? 'Selected' : 'Select'}
                                <ChevronRight size={9} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Contact Information */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-1.5">
                        2. Contact &amp; Organisation Details
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-primary/70 mb-1">
                            Full Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={directForm.fullName}
                              onChange={(e) => setDirectForm({ ...directForm, fullName: e.target.value })}
                              placeholder="e.g. Dr. Arthur Mthembu"
                              className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-[#B68A35] focus:bg-white transition-colors"
                            />
                            <UserIcon size={13} className="absolute left-2.5 top-2.5 text-ash pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-primary/70 mb-1">
                            Work Email *
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={directForm.email}
                              onChange={(e) => setDirectForm({ ...directForm, email: e.target.value })}
                              placeholder="name@enterprise.co.za"
                              className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-[#B68A35] focus:bg-white transition-colors"
                            />
                            <Mail size={13} className="absolute left-2.5 top-2.5 text-ash pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-primary/70 mb-1">
                            Company / Facility *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={directForm.company}
                              onChange={(e) => setDirectForm({ ...directForm, company: e.target.value })}
                              placeholder="e.g. AgriFoods Processing Ltd"
                              className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-[#B68A35] focus:bg-white transition-colors"
                            />
                            <Building size={13} className="absolute left-2.5 top-2.5 text-ash pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-primary/70 mb-1">
                            Contact Phone (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={directForm.phone}
                              onChange={(e) => setDirectForm({ ...directForm, phone: e.target.value })}
                              placeholder="+27 (0)10 000 0000"
                              className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-[#B68A35] focus:bg-white transition-colors"
                            />
                            <Phone size={13} className="absolute left-2.5 top-2.5 text-ash pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Date & Time Preferences */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-1.5">
                        3. Scheduling Preference
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <CalendarDatePicker
                          label="Preferred Date"
                          value={directForm.preferredDate}
                          onChange={(selectedDate) => setDirectForm({ ...directForm, preferredDate: selectedDate })}
                          allowToday={false}
                        />

                        <div>
                          <label className="block text-[10px] font-semibold text-primary/70 mb-1">
                            Preferred Time Window
                          </label>
                          <select
                            value={directForm.preferredTime}
                            onChange={(e) => setDirectForm({ ...directForm, preferredTime: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FAF8F5] border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-[#B68A35] focus:bg-white transition-colors"
                          >
                            <option value="09:00 AM - 11:00 AM (SAST)">Morning (09:00 - 11:00 SAST)</option>
                            <option value="11:00 AM - 01:00 PM (SAST)">Midday (11:00 - 13:00 SAST)</option>
                            <option value="02:00 PM - 04:00 PM (SAST)">Afternoon (14:00 - 16:00 SAST)</option>
                            <option value="04:00 PM - 05:30 PM (SAST)">Late Afternoon (16:00 - 17:30 SAST)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Scope / Notes */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-1">
                        4. Scope / Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={directForm.message}
                        onChange={(e) => setDirectForm({ ...directForm, message: e.target.value })}
                        placeholder="Detail standard targets (e.g. ISO 22000, FSSC 22000, BRCGS, HACCP)..."
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-[#B68A35] focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmittingDirect}
                      className="w-full bg-[#023625] hover:bg-[#034d35] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                    >
                      {isSubmittingDirect ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Transmitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Submit Consultation Request</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* Calendly Live Sync Option */
              <div className="flex-1 flex flex-col min-h-[580px] sm:min-h-[660px]">
                {/* Dedicated Window Helper Banner (Bypasses iFrame CAPTCHAs completely) */}
                <div className="bg-[#FAF8F5] border-b border-border/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Info size={14} className="text-[#B68A35] shrink-0" />
                    <span className="text-[11px] sm:text-xs">
                      Experiencing CAPTCHA or cookie prompts in browser?
                    </span>
                  </div>
                  <a
                    href={PRIMARY_CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#023625] hover:bg-[#034d35] text-white text-[11px] font-semibold transition-colors shrink-0 shadow-xs"
                  >
                    <span>Open in Full Tab</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                {/* Calendly Booking Success Banner */}
                {bookingConfirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#023625] text-white p-3 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-xs border-b border-[#B68A35]/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#E6CA85] text-[#012B1D] flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#E6CA85]">
                          Consultation Scheduled!
                        </h4>
                        <p className="text-[10px] sm:text-xs text-white/80">
                          Confirmation details have been dispatched to your email.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-3 py-1 bg-[#B68A35] hover:bg-[#9E7528] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Done
                    </button>
                  </motion.div>
                )}

                {/* Sized Calendly Embed Frame with adequate height */}
                <div className="flex-1 w-full h-full min-h-[580px] sm:min-h-[660px] relative">
                  <iframe
                    ref={iframeRef}
                    src={getFullCalendlyUrl()}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Yitzak Institutional Consultation Scheduler"
                    className="w-full h-full min-h-[580px] sm:min-h-[660px] border-0"
                    onLoad={() => setIsIframeLoaded(true)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clean Sub-Footer */}
          <div className="bg-[#FAF8F5] border-t border-border/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-xs text-ash shrink-0">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-primary/80 font-medium">
              <ShieldCheck size={13} className="text-[#023625]" />
              Confidential &amp; NDA Protected
            </span>

            <div className="text-[10px] sm:text-[11px] text-ash">
              Direct: <a href="mailto:info@yitzak.co.za" className="text-[#023625] font-semibold hover:underline">info@yitzak.co.za</a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
