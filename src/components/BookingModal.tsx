import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, CheckCircle2, X, Loader2, Sparkles, Building2, User as UserIcon, Mail, FileText, ChevronDown, CalendarPlus, Download } from 'lucide-react';
import { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PILLARS, TIME_SLOTS } from '../data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess?: (user: User) => void;
  initialPillarId?: string;
  initialNotes?: string;
  onBookingSuccess: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  currentUser,
  initialPillarId = 'consulting',
  initialNotes = '',
  onBookingSuccess
}: BookingModalProps) {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPillar, setSelectedPillar] = useState(initialPillarId);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0] || '09:00 - 10:00');
  const [notes, setNotes] = useState(initialNotes);

  // Status & Validation State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.displayName || '');
      setEmail(currentUser?.email || '');
      setSelectedPillar(initialPillarId || 'consulting');
      setNotes(initialNotes || '');
      setSubmitted(false);
      setSubmitting(false);
      setValidationError(null);

      // Default preferred date to tomorrow (or Monday if weekend)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1); // If Sun -> Mon
      if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2); // If Sat -> Mon
      setDate(tomorrow.toISOString().split('T')[0]);

      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialPillarId, initialNotes, currentUser]);

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getPillarTitle = (id: string) => {
    if (id === 'training') return 'Professional Training';
    if (id === 'consulting') return 'Consulting & Advisory';
    if (id === 'certification') return 'Certification Support';
    if (id === 'process_implementation') return 'Business Process Implementation';
    if (id === 'compliance') return 'Compliance & Management Systems';
    const found = PILLARS.find(p => p.id === id);
    return found ? found.title : 'Consulting & Advisory';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Subtle inline validation
    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid corporate or personal email address.');
      return;
    }
    if (!date) {
      setValidationError('Please select a preferred consultation date.');
      return;
    }
    if (!timeSlot) {
      setValidationError('Please select a preferred time slot.');
      return;
    }

    setSubmitting(true);
    const refCode = `YTZ-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(refCode);

    const pillarName = getPillarTitle(selectedPillar);

    const bookingPayload = {
      bookingRef: refCode,
      userName: name.trim(),
      userEmail: email.trim(),
      pillar: pillarName,
      pillarId: selectedPillar,
      date,
      timeSlot,
      notes: notes.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      source: 'Simplified Website Booking Form'
    };

    try {
      // 1. Write to Firestore
      const docId = `request_${Date.now()}_${refCode}`;
      await setDoc(doc(db, 'consultation_requests', docId), {
        ...bookingPayload,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore fallback: saving request locally', err);
    }

    // 2. Save locally for instant persistence
    const existingRequests = JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]');
    existingRequests.push(bookingPayload);
    localStorage.setItem('yitzak_consultation_requests', JSON.stringify(existingRequests));

    // Finish submission after brief realistic processing
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      onBookingSuccess();
    }, 600);
  };

  // Google Calendar Template URL Generator
  const getGoogleCalendarUrl = () => {
    const pillarName = getPillarTitle(selectedPillar);
    const title = encodeURIComponent(`Yitzak Consulting Session: ${pillarName}`);
    const details = encodeURIComponent(
      `Consultation Request with Yitzak Consulting Group.\n\nClient Name: ${name}\nClient Email: ${email}\nReference: ${bookingRef}\nService Pillar: ${pillarName}\nNotes: ${notes || 'None'}`
    );
    const location = encodeURIComponent('Yitzak Advisory Virtual Meeting Room');

    const times = timeSlot.split(' - ');
    const startTime = times[0] ? times[0].trim().replace(':', '') : '0900';
    const endTime = times[1] ? times[1].split(' ')[0].replace(':', '') : '1000';

    const startIso = `${date.replace(/-/g, '')}T${startTime}00Z`;
    const endIso = `${date.replace(/-/g, '')}T${endTime}00Z`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  // ICS File Generator for Outlook / Apple Calendar
  const handleDownloadIcs = () => {
    const pillarName = getPillarTitle(selectedPillar);
    const times = timeSlot.split(' - ');
    const startTime = times[0] ? times[0].trim().replace(':', '') : '0900';
    const endTime = times[1] ? times[1].split(' ')[0].replace(':', '') : '1000';

    const startIso = `${date.replace(/-/g, '')}T${startTime}00`;
    const endIso = `${date.replace(/-/g, '')}T${endTime}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Yitzak Consulting//Consultation Booking//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Yitzak Consulting: ${pillarName}`,
      `DESCRIPTION:Consultation Request for ${name} (${email}). Reference: ${bookingRef}. Notes: ${(notes || 'N/A').replace(/\n/g, ' ')}`,
      'LOCATION:Yitzak Advisory Virtual Meeting Room',
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Yitzak_Consultation_${date}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0F3D3E]/50 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white border border-[#E5E5E5] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden my-auto relative"
          >
            {/* Header */}
            <div className="bg-[#0F3D3E] text-white p-6 sm:p-8 flex justify-between items-start relative">
              <div className="space-y-1.5 pr-6">
                <span className="font-[#Montserrat] text-[11px] font-semibold text-[#C49A3A] uppercase tracking-widest block">
                  Yitzak Consulting Advisory
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Schedule Consultation
                </h3>
                <p className="font-sans text-xs text-white/80 leading-relaxed pt-1">
                  Fill in your details below to request a tailored advisory session with our principal consultants.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 bg-white max-h-[80vh] overflow-y-auto">
              {!submitted ? (
                /* STEP 1: Streamlined Single Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Validation Message */}
                  {validationError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-xs font-sans flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                      <span>{validationError}</span>
                    </motion.div>
                  )}

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking_name" className="block text-xs font-semibold uppercase tracking-wider text-[#333333] mb-1.5 font-sans">
                        Full Name <span className="text-[#C49A3A]">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                        <input
                          id="booking_name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          placeholder="e.g. John Doe"
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E5E5] focus:border-[#0F3D3E] text-xs text-[#333333] rounded-md outline-none font-sans transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="booking_email" className="block text-xs font-semibold uppercase tracking-wider text-[#333333] mb-1.5 font-sans">
                        Email Address <span className="text-[#C49A3A]">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                        <input
                          id="booking_email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          placeholder="e.g. john@company.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E5E5] focus:border-[#0F3D3E] text-xs text-[#333333] rounded-md outline-none font-sans transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Consulting Pillar Dropdown */}
                  <div>
                    <label htmlFor="booking_pillar" className="block text-xs font-semibold uppercase tracking-wider text-[#333333] mb-1.5 font-sans">
                      Select Consulting Pillar <span className="text-[#C49A3A]">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                      <select
                        id="booking_pillar"
                        value={selectedPillar}
                        onChange={(e) => setSelectedPillar(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#E5E5E5] focus:border-[#0F3D3E] text-xs text-[#333333] rounded-md outline-none font-sans appearance-none cursor-pointer transition-colors"
                      >
                        <option value="training">Professional Training &amp; Capacity Development</option>
                        <option value="consulting">Consulting &amp; Strategic Advisory</option>
                        <option value="certification">Certification Support &amp; Audit Readiness</option>
                        <option value="process_implementation">Business Process Implementation (HR, Accounting &amp; Ops)</option>
                        <option value="compliance">Compliance &amp; Integrated Management Systems (IMS)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                    </div>
                  </div>

                  {/* Date & Time Slot Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="booking_date" className="block text-xs font-semibold uppercase tracking-wider text-[#333333] mb-1.5 font-sans">
                        Preferred Date <span className="text-[#C49A3A]">*</span>
                      </label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                        <input
                          id="booking_date"
                          type="date"
                          required
                          min={getMinDate()}
                          value={date}
                          onChange={(e) => {
                            setDate(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E5E5] focus:border-[#0F3D3E] text-xs text-[#333333] rounded-md outline-none font-sans transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="booking_timeslot" className="block text-xs font-semibold uppercase tracking-wider text-[#333333] mb-1.5 font-sans">
                        Preferred Time Slot <span className="text-[#C49A3A]">*</span>
                      </label>
                      <div className="relative">
                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                        <select
                          id="booking_timeslot"
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#E5E5E5] focus:border-[#0F3D3E] text-xs text-[#333333] rounded-md outline-none font-sans appearance-none cursor-pointer transition-colors"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot} (SAST / UTC+2)
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes Textarea */}
                  <div>
                    <label htmlFor="booking_notes" className="block text-xs font-semibold uppercase tracking-wider text-[#333333] mb-1.5 font-sans">
                      Additional Notes <span className="text-[#737373] font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-3 top-3 text-[#737373]" />
                      <textarea
                        id="booking_notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Specify your ISO standards of interest, team size, or key objectives..."
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E5E5E5] focus:border-[#0F3D3E] text-xs text-[#333333] rounded-md outline-none font-sans resize-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Primary CTA Submit Button */}
                  <div className="pt-2">
                    <button
                      id="submit_consultation_btn"
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary font-sans font-bold text-xs uppercase tracking-wider py-3.5 rounded-md cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-60 transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <span>Submit Consultation Request</span>
                      )}
                    </button>
                    <p className="text-[11px] text-[#737373] text-center mt-2.5 font-sans">
                      No password required. Instant confirmation receipt will be generated.
                    </p>
                  </div>
                </form>
              ) : (
                /* STEP 2: Clean Confirmation Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-4 space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#0F3D3E]/10 text-[#0F3D3E] flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="font-serif text-2xl font-bold text-[#0F3D3E]">
                      Request Received
                    </h4>
                    <p className="font-sans text-xs text-[#333333] leading-relaxed">
                      Thank you, <strong className="text-[#0F3D3E]">{name}</strong>. Your consultation request for <strong className="text-[#0F3D3E]">{getPillarTitle(selectedPillar)}</strong> has been received. We’ll confirm availability within 24 hours.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg p-4 text-left space-y-2.5 max-w-md mx-auto text-xs font-sans">
                    <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2">
                      <span className="text-[#737373] uppercase text-[10px] tracking-wider font-semibold">Reference ID</span>
                      <span className="font-mono text-[#0F3D3E] font-bold bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">
                        {bookingRef}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#737373]">Pillar:</span>
                      <span className="font-semibold text-[#333333]">{getPillarTitle(selectedPillar)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#737373]">Requested Date:</span>
                      <span className="font-semibold text-[#333333]">{date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#737373]">Preferred Slot:</span>
                      <span className="font-semibold text-[#333333]">{timeSlot} (SAST)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#737373]">Email Contact:</span>
                      <span className="font-semibold text-[#333333]">{email}</span>
                    </div>
                  </div>

                  {/* Calendar Integration CTAs */}
                  <div className="pt-2 max-w-md mx-auto space-y-2.5">
                    <span className="block text-[11px] font-semibold text-[#737373] uppercase tracking-wider font-sans">
                      Add to Calendar
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline py-2.5 px-3 text-xs font-sans rounded-md flex items-center justify-center gap-1.5 cursor-pointer no-underline"
                      >
                        <CalendarPlus size={14} />
                        <span>Google Calendar</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleDownloadIcs}
                        className="btn-outline py-2.5 px-3 text-xs font-sans rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Download .ics File</span>
                      </button>
                    </div>
                  </div>

                  {/* Close / Reset Actions */}
                  <div className="pt-4 border-t border-[#E5E5E5] flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-primary font-sans text-xs uppercase tracking-wider py-2.5 px-8 rounded-md cursor-pointer"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setValidationError(null);
                      }}
                      className="btn-outline font-sans text-xs uppercase tracking-wider py-2.5 px-4 rounded-md cursor-pointer"
                    >
                      Submit Another
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
