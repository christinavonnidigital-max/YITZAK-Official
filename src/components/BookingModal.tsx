import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  CheckCircle2, 
  Check,
  X, 
  Loader2, 
  ShieldCheck, 
  CalendarCheck,
  Send,
  User as UserIcon,
  Mail,
  Building,
  ExternalLink,
  Clock,
  Globe
} from 'lucide-react';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { sendEmailViaVercel } from '../lib/emailService';
import { PILLARS } from '../data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess?: (user: User) => void;
  initialPillarId?: string;
  initialNotes?: string;
  onBookingSuccess?: () => void;
  onNavigatePrivacy?: () => void;
}

const PRIMARY_CALENDLY_URL = 'https://calendly.com/cgumpo-yitzak/30min';

export default function BookingModal({
  isOpen,
  onClose,
  currentUser,
  initialPillarId = 'consulting',
  initialNotes = '',
  onBookingSuccess,
  onNavigatePrivacy
}: BookingModalProps) {
  const [bookingMode, setBookingMode] = useState<'direct' | 'calendly'>('direct');
  const [selectedPillar, setSelectedPillar] = useState(initialPillarId);
  const [notes, setNotes] = useState(initialNotes);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Simplified Direct Form State
  const [directForm, setDirectForm] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    company: '',
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
        const pillarTitle = pillarInfo ? pillarInfo.title : 'Advisory Consultation';

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

  // Cleanly format Calendly URL for embedding & full-tab with South Africa Standard Time (SAST)
  const getFullCalendlyUrl = () => {
    try {
      const url = new URL(PRIMARY_CALENDLY_URL);
      url.searchParams.set('hide_landing_page_details', '1');
      url.searchParams.set('hide_gdpr_banner', '1');
      url.searchParams.set('background_color', 'ffffff');
      url.searchParams.set('text_color', '012b1d');
      url.searchParams.set('primary_color', '023625');
      // Set timezone to Africa/Johannesburg (South Africa Standard Time - SAST)
      url.searchParams.set('timezone', 'Africa/Johannesburg');
      
      if (directForm.fullName) {
        url.searchParams.set('name', directForm.fullName);
      }
      if (directForm.email) {
        url.searchParams.set('email', directForm.email);
      }

      return url.toString();
    } catch {
      return `${PRIMARY_CALENDLY_URL}?timezone=Africa%2FJohannesburg`;
    }
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directForm.fullName.trim() || !directForm.email.trim() || !directForm.company.trim()) {
      setDirectError('Please fill in your full name, work email, and company/facility.');
      return;
    }

    setIsSubmittingDirect(true);
    setDirectError(null);

    const refCode = `YTZ-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const payload = {
      bookingRef: refCode,
      userName: directForm.fullName.trim(),
      userEmail: directForm.email.trim(),
      company: directForm.company.trim(),
      pillar: currentPillarObj.title,
      pillarId: selectedPillar,
      notes: directForm.message || notes,
      status: 'pending',
      scheduledVia: 'Direct Request',
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
        subject: `Consultation Request: ${directForm.company} (${directForm.fullName})`,
        html: `
          <h2>New Consultation Request Received</h2>
          <p><strong>Client:</strong> ${directForm.fullName} (${directForm.email})</p>
          <p><strong>Company / Facility:</strong> ${directForm.company}</p>
          <p><strong>Service Required:</strong> ${currentPillarObj.title}</p>
          <p><strong>Notes:</strong><br>${(directForm.message || notes || 'None specified').replace(/\n/g, '<br>')}</p>
        `,
        type: 'booking'
      });
    } catch (mailErr) {
      console.warn('Consultation request dispatch notification:', mailErr);
    }

    setIsSubmittingDirect(false);
    setDirectSuccess(true);
    if (onBookingSuccess) onBookingSuccess();
  };

  return (
    <AnimatePresence>
      <div 
        id="consultation-booking-modal"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#00140D]/85 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col h-[92vh] sm:h-[88vh] max-h-[780px]"
        >
          {/* Header */}
          <div className="bg-[#023625] text-white px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#B68A35]/20 border border-[#B68A35]/40 flex items-center justify-center text-[#E6CA85] shrink-0">
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-white tracking-tight leading-tight">
                    Request a Consultation
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

          {/* Modal Body: No double-scroll in Calendly mode */}
          <div className={`relative flex-1 bg-white flex flex-col min-h-0 ${bookingMode === 'direct' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
            {bookingMode === 'direct' ? (
              /* PRIMARY DEFAULT: Simplified Direct Consultation Request Form */
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
                      Thank you, <strong>{directForm.fullName}</strong>. Your consultation request for <strong>{currentPillarObj.title}</strong> has been received. We’ll get back to you at <strong>{directForm.email}</strong> to arrange a suitable time.
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
                        Request a Consultation
                      </h4>
                      <p className="text-[11px] sm:text-xs text-ash mt-0.5">
                        Tell us what you need and we’ll get back to arrange a suitable time.
                      </p>
                    </div>

                    {directError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <span>{directError}</span>
                      </div>
                    )}

                    {/* Field 1: Service Required */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-1.5">
                        Service Required *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                        {PILLARS.map((pillar) => {
                          const isSelected = selectedPillar === pillar.id;
                          return (
                            <button
                              key={pillar.id}
                              type="button"
                              onClick={() => setSelectedPillar(pillar.id)}
                              className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between min-h-[72px] ${
                                isSelected
                                  ? 'bg-[#023625] text-white border-[#023625] ring-2 ring-[#B68A35]/50 shadow-xs'
                                  : 'bg-[#FAF8F5] text-primary/80 border-border/80 hover:border-[#B68A35]/60 hover:bg-white'
                              }`}
                            >
                              <span className="text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2">
                                {pillar.title}
                              </span>
                              <span className={`text-[10px] mt-1 flex items-center gap-1 font-bold ${
                                isSelected ? 'text-[#E6CA85]' : 'text-ash/70'
                              }`}>
                                {isSelected ? (
                                  <>
                                    <Check size={11} className="text-[#E6CA85] stroke-[3]" />
                                    <span>Selected</span>
                                  </>
                                ) : (
                                  <span>Select</span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Field 2 & 3: Full Name & Work Email */}
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
                    </div>

                    {/* Field 4: Company / Facility */}
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

                    {/* Field 5: Notes Optional */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-primary/80 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={directForm.message}
                        onChange={(e) => setDirectForm({ ...directForm, message: e.target.value })}
                        placeholder="Detail standard targets (e.g. ISO 22000, FSSC 22000, BRCGS, HACCP) or specific requirements..."
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-border rounded-xl text-xs text-primary focus:outline-none focus:border-[#B68A35] focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="space-y-2 pt-1">
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

                      <p className="text-[11px] text-center text-ash">
                        By submitting, you acknowledge our{' '}
                        {onNavigatePrivacy ? (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigatePrivacy();
                            }}
                            className="text-[#B68A35] font-semibold hover:underline cursor-pointer"
                          >
                            Privacy Notice
                          </button>
                        ) : (
                          <span className="text-[#B68A35] font-semibold">Privacy Notice</span>
                        )}.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* Calendly Live Sync Option - Fills modal without inner container scrollbar */
              <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
                {/* Header Banner: Explicit Event Title, SAST Timezone & Open in Full Tab CTA */}
                <div className="bg-[#FAF8F5] border-b border-border/80 px-4 sm:px-6 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 text-xs shrink-0">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock size={15} className="text-[#B68A35] shrink-0" />
                    <div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-primary">
                        Yitzak Consultation - 30 minutes
                      </div>
                      <div className="text-[11px] text-ash inline-flex items-center gap-1 font-sans">
                        <Globe size={11} className="text-[#B68A35]" />
                        <span>South Africa Standard Time (SAST)</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={getFullCalendlyUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#023625] hover:bg-[#034d35] text-white text-[11px] font-semibold transition-colors shrink-0 shadow-xs cursor-pointer ml-auto"
                  >
                    <span>Open in Full Tab</span>
                    <ExternalLink size={12} />
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

                {/* Direct Full-Height Embed Frame without parent double-scroll */}
                <div className="flex-1 w-full h-full min-h-0 relative overflow-hidden bg-white">
                  {!isIframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-2 text-ash text-xs">
                      <Loader2 size={24} className="animate-spin text-[#023625]" />
                      <span>Loading consultation scheduler...</span>
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    src={bookingMode === 'calendly' ? getFullCalendlyUrl() : undefined}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    frameBorder="0"
                    title="Yitzak Consultation - 30 minutes"
                    className="w-full h-full min-h-0 border-0 block"
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
              Your enquiry will be handled confidentially.
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
