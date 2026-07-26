import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Lock, FileText, CheckCircle, AlertCircle, X, Loader2, Sparkles, Shield, BookOpen, Award } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, googleSignIn, getAccessToken, OperationType, handleFirestoreError } from '../lib/firebase';
import { preRegisterGuest } from '../lib/whitelist';
import { createCalendarEvent, sendConfirmationEmail } from '../lib/googleApi';
import { PILLARS, TIME_SLOTS } from '../data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  initialPillarId?: string;
  initialNotes?: string;
  onBookingSuccess: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  initialPillarId = 'compliance',
  initialNotes = '',
  onBookingSuccess
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Auth/Pillar, 2: Date/Time, 3: Confirm
  const [selectedPillar, setSelectedPillar] = useState(initialPillarId);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [timezone, setTimezone] = useState<'SAST' | 'UTC'>('SAST');
  const [isConfirmedCheckbox, setIsConfirmedCheckbox] = useState(false);
  const [actualSync, setActualSync] = useState({ calendar: false, email: false });

  // Synchronize state when modal is opened or props change
  useEffect(() => {
    if (isOpen) {
      setSelectedPillar(initialPillarId);
      setNotes(initialNotes);
      setStep(1);
      setError(null);
      setSuccess(false);
      setGuestName('');
      setGuestEmail('');
      setShowGuestForm(false);
      setIsConfirmedCheckbox(false);
      setActualSync({ calendar: false, email: false });
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, initialPillarId, initialNotes]);

  const formatTimeSlotSAST = (slot: string) => {
    if (!slot) return '';
    // Convert UTC slot to SAST (UTC+2)
    const [start, end] = slot.split(' - ');
    const convertHour = (hStr: string) => {
      const h = parseInt(hStr.split(':')[0], 10);
      const newH = (h + 2) % 24;
      return `${newH.toString().padStart(2, '0')}:00`;
    };
    return `${convertHour(start)} - ${convertHour(end)} (SAST)`;
  };

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format to YYYY-MM-DD
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setDate(tomorrowStr);
  }, []);

  // Filter out past dates
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthSuccess(result.user);
        setStep(2);
      }
    } catch (err: any) {
      console.error(err);
      const isPopupClosed = err?.code === 'auth/popup-closed-by-user' || 
                            err?.message?.includes('popup-closed-by-user') ||
                            (typeof err === 'object' && err !== null && JSON.stringify(err).includes('popup-closed-by-user'));

      if (isPopupClosed) {
        setError('Sign-in cancelled. The authentication window was closed before completing.');
      } else {
        setError('Google Authentication failed. Please authorize the requested scopes to enable calendar sync and automated notifications.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!currentUser) {
        setError('Please sign in with Google to proceed with booking.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!date) {
        setError('Please select a preferred consulting date.');
        return;
      }
      // Check if selected day is weekend
      const day = new Date(date).getDay();
      if (day === 5 || day === 6) { // Saturday=5, Sunday=6 in local timezone depending, actually let's calculate carefully or warn them
        // 0: Sunday, 6: Saturday
        const utcDay = new Date(date).getUTCDay();
        if (utcDay === 0 || utcDay === 6) {
          setError('Corporate bookings are restricted to weekdays (Monday - Friday).');
          return;
        }
      }
      if (!timeSlot) {
        setError('Please select an available consulting time slot.');
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    setError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);

    const pillarObj = PILLARS.find(p => p.id === selectedPillar);
    if (!pillarObj) {
      setError('Invalid consulting pillar selected.');
      setLoading(false);
      return;
    }

    // Explicit confirmation check via checkbox (bypasses iframe native popup blocker)
    const isGuest = currentUser?.uid?.startsWith('guest_') || currentUser?.isAnonymous;
    if (!isConfirmedCheckbox) {
      setError('Please check the confirmation box to authorize and schedule this booking.');
      setLoading(false);
      return;
    }

    try {
      const accessToken = isGuest ? null : await getAccessToken();
      if (!isGuest && !accessToken) {
        console.warn('Google Access Token is missing. Proceeding with database registration without Google Calendar & Gmail synchronization.');
      }

      const bookingId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Step 1: Create Google Calendar Event
      let calendarEventId = '';
      let syncedToCalendar = false;
      if (accessToken) {
        try {
          calendarEventId = await createCalendarEvent(accessToken, {
            title: pillarObj.title,
            description: `YITZAK Institutional Consulting Session.\nClient: ${currentUser?.displayName}\nEmail: ${currentUser?.email}\nNotes: ${notes || 'None'}`,
            date,
            timeSlot,
            userEmail: currentUser?.email || ''
          });
          syncedToCalendar = true;
        } catch (calErr: any) {
          console.warn('Google Calendar synchronization failed: ', calErr);
        }
      }

      // Step 2: Send automated confirmation email using Gmail
      let emailDispatched = false;
      if (accessToken) {
        try {
          await sendConfirmationEmail(accessToken, {
            to: currentUser?.email || '',
            recipientName: currentUser?.displayName || 'Valued Client',
            date,
            timeSlot,
            pillarName: pillarObj.title,
            notes: notes || undefined
          });
          emailDispatched = true;
        } catch (gmailErr: any) {
          console.warn('Gmail automated notification failed: ', gmailErr);
        }
      }

      setActualSync({ calendar: syncedToCalendar, email: emailDispatched });

      // Step 3: Write booking document to Firebase Firestore (Durable persistence) & Local Storage
      const bookingData = {
        userId: currentUser?.uid || 'guest',
        userName: currentUser?.displayName || guestName || 'Guest Client',
        userEmail: currentUser?.email || guestEmail || '',
        date,
        timeSlot,
        pillar: pillarObj.title,
        notes: notes || '',
        status: 'pending',
        isGuestBooking: isGuest,
        calendarEventId: calendarEventId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        const dbBookingData = {
          ...bookingData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'bookings', bookingId), dbBookingData);
      } catch (firestoreErr) {
        console.warn('Firestore booking write notice (using local storage fallback if guest):', firestoreErr);
      }

      if (isGuest) {
        const localBookings = JSON.parse(localStorage.getItem('yitzak_guest_bookings') || '[]');
        localBookings.push({
          id: bookingId,
          ...bookingData
        });
        localStorage.setItem('yitzak_guest_bookings', JSON.stringify(localBookings));
      }

      setSuccess(true);
      onBookingSuccess();
    } catch (err: any) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'bookings');
      } catch (firestoreErr: any) {
        setError(`Booking failed: ${firestoreErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentPillar = PILLARS.find(p => p.id === selectedPillar);
  const isGuest = currentUser?.uid?.startsWith('guest_') || currentUser?.isAnonymous;

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="booking_modal_container" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-primary/40 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-border w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px] my-auto shrink-0"
          >
            {/* Left Sidebar branding */}
            <div className="bg-primary text-on-primary p-8 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="font-label-kicker text-[11px] text-secondary-fixed uppercase tracking-widest block mb-2">Institutional Rigor</span>
                <h3 className="font-headline-md text-headline-md text-white tracking-tight mb-8">YITZAK</h3>
                <p className="font-body-std text-xs text-on-primary-container opacity-90 leading-relaxed">
                  Real-time synchronization with Google Workspace guarantees immediate calendar blocking and secure institutional confirmations.
                </p>
              </div>

              <div className="mt-8 relative z-10 border-t border-white/10 pt-8">
                <div className="flex items-center gap-2 text-[12px] font-mono text-secondary-fixed">
                  <Lock size={12} />
                  <span>Verified Identity</span>
                </div>
              </div>

              {/* Decorative branding element */}
              <div className="absolute -bottom-10 -left-10 text-[100px] font-bold text-white/5 font-display-hero select-none pointer-events-none">
                Y
              </div>
            </div>

            {/* Right Booking Flow area */}
            <div className="flex-1 p-8 flex flex-col justify-between">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                <div>
                  <h4 className="font-headline-md text-headline-md text-primary">Schedule Consultation</h4>
                  <p className="font-body-std text-xs text-ash">Step {step} of 3</p>
                </div>
                <button
                  id="close_modal_btn"
                  onClick={onClose}
                  className="text-ash hover:text-primary transition-colors p-2"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content body */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {error && (
                  <div className="bg-error-container text-on-error-container p-4 mb-8 flex items-start gap-2 text-xs">
                    <AlertCircle className="flex-shrink-0 text-error" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {success ? (
                  <div className="flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-8">
                      <CheckCircle size={36} />
                    </div>
                    <h5 className="font-headline-md text-headline-md text-primary mb-2">Consultation Scheduled</h5>
                    <p className="font-body-std text-sm text-ash max-w-md mb-8">
                      Your consultation for <strong>{currentPillar?.title}</strong> on <strong>{date}</strong> at <strong>{formatTimeSlotSAST(timeSlot)}</strong> ({timeSlot} UTC) has been booked successfully.
                    </p>
                    <div className="bg-surface border border-border p-4 text-xs text-left max-w-md w-full space-y-2.5 font-sans rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-ash font-medium">Booking Status:</span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Confirmed &amp; Scheduled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ash font-medium">Saved Location:</span>
                        <span className="text-primary font-bold">Dashboard &amp; Consultation Registry</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ash font-medium">Calendar &amp; Email:</span>
                        {isGuest ? (
                          <span className="text-ash italic">Saved locally for Guest session</span>
                        ) : actualSync.calendar || actualSync.email ? (
                          <span className="text-emerald-700 font-bold">Synced via Google</span>
                        ) : (
                          <span className="text-ash italic">Dashboard logged</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-16 bg-primary text-on-primary px-16 py-4 font-label-btn text-label-btn uppercase tracking-widest hover:bg-primary-container transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Step 1: Authentication and Pillar Selection */}
                    {step === 1 && (
                      <div className="space-y-8">
                        <p className="font-body-std text-xs text-ash">
                          Yitzak utilizes secure Google OAuth. Authenticating guarantees instantaneous calendar booking and authentic email confirmations.
                        </p>

                        {!currentUser ? (
                          <div className="bg-surface border border-border p-6 md:p-8 text-center space-y-6">
                            <Lock className="mx-auto text-primary" size={24} />
                            <div>
                              <h6 className="font-headline-md text-[16px] text-primary">Identity Authorization Required</h6>
                              <p className="font-body-std text-xs text-ash mt-2">
                                Sign in with your corporate Google Account to sync consultation events.
                              </p>
                            </div>

                            <div className="text-left text-xs text-[#856404] bg-[#fff3cd] border border-[#ffeeba] p-3.5 rounded-lg space-y-1">
                              <p className="font-semibold flex items-center gap-1.5">
                                <AlertCircle size={14} className="text-[#856404]" />
                                <span>Fast-Track Scheduling Available</span>
                              </p>
                              <p className="leading-relaxed text-[11px]">
                                Prefer to book without signing into Google? You can select "Proceed as Guest" below to confirm your consultation instantly.
                              </p>
                            </div>

                            <div className="space-y-4">
                              <button
                                id="modal_google_signin_btn"
                                onClick={handleGoogleSignIn}
                                disabled={authLoading || showGuestForm}
                                className="gsi-material-button w-full flex justify-center items-center gap-2 py-4 font-label-btn text-label-btn uppercase border border-border bg-white text-charcoal hover:bg-surface transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              >
                                {authLoading ? (
                                  <Loader2 className="animate-spin text-primary" size={16} />
                                ) : (
                                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                  </svg>
                                )}
                                <span className="font-label-btn text-xs">Sign in with Google</span>
                              </button>

                              {!showGuestForm ? (
                                <button
                                  type="button"
                                  onClick={() => setShowGuestForm(true)}
                                  className="w-full text-center py-2 text-xs text-secondary hover:underline font-semibold cursor-pointer block"
                                >
                                  Or: Bypass Google Auth & Book as Guest
                                </button>
                              ) : (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="text-left border border-border p-4 bg-[#F9F9F9] space-y-3"
                                >
                                  <h6 className="text-xs font-bold text-primary uppercase tracking-wide">Guest Details</h6>
                                  <div>
                                    <label className="text-[10px] uppercase font-mono tracking-wider text-ash block mb-1">Full Name</label>
                                    <input 
                                      type="text" 
                                      required
                                      value={guestName}
                                      onChange={(e) => setGuestName(e.target.value)}
                                      placeholder="e.g. John Doe"
                                      className="w-full p-2.5 border border-border bg-white text-xs text-charcoal outline-none focus:border-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase font-mono tracking-wider text-ash block mb-1">Email Address</label>
                                    <input 
                                      type="email" 
                                      required
                                      value={guestEmail}
                                      onChange={(e) => setGuestEmail(e.target.value)}
                                      placeholder="e.g. john.doe@company.com"
                                      className="w-full p-2.5 border border-border bg-white text-xs text-charcoal outline-none focus:border-primary"
                                    />
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!guestName.trim() || !guestEmail.trim()) {
                                          setError('Please enter both your name and email to proceed as a guest.');
                                          return;
                                        }
                                        if (!guestEmail.includes('@')) {
                                          setError('Please enter a valid email address.');
                                          return;
                                        }
                                        setError(null);

                                        // Auto pre-register guest in Firestore Whitelist
                                        try {
                                          await preRegisterGuest(
                                            guestEmail.trim(), 
                                            guestName.trim(), 
                                            'Pre-registered during Consultation Booking', 
                                            'guest', 
                                            'active'
                                          );
                                        } catch (e) {
                                          console.warn('Auto whitelist pre-registration notice:', e);
                                        }

                                        const mockUser: User = {
                                          uid: 'guest_' + Date.now(),
                                          displayName: guestName.trim(),
                                          email: guestEmail.trim(),
                                          photoURL: null,
                                          emailVerified: false,
                                          isAnonymous: true
                                        } as unknown as User;
                                        onAuthSuccess(mockUser);
                                        setStep(2);
                                      }}
                                      className="flex-1 bg-primary text-white py-2.5 text-xs uppercase font-bold tracking-widest hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                                    >
                                      Proceed as Guest
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowGuestForm(false);
                                        setError(null);
                                      }}
                                      className="px-3 border border-border text-ash hover:text-primary text-xs cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-primary-container/10 border border-primary-container/20 p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 flex items-center justify-center bg-[#B68A35]/10 text-[#B68A35] font-serif font-bold text-sm">
                              {currentUser.photoURL ? (
                                <img src={currentUser.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              ) : (
                                <span>{currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'G'}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-body-std text-xs font-bold text-primary">{currentUser.displayName}</p>
                              <p className="font-body-std text-[11px] text-ash">{currentUser.email}</p>
                            </div>
                            <span className="ml-auto bg-primary text-on-primary text-[9px] font-mono uppercase px-2 py-0.5 tracking-wider">
                              {currentUser.uid?.startsWith('guest_') ? 'Guest Client' : 'Authenticated'}
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="font-label-btn text-xs uppercase tracking-wider text-primary block mb-2">Select Consulting Pillar</label>
                          <div className="grid grid-cols-1 gap-2">
                            {PILLARS.map(p => (
                              <button
                                key={p.id}
                                onClick={() => setSelectedPillar(p.id)}
                                className={`text-left p-4 border transition-all flex items-start gap-4 group ${selectedPillar === p.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-secondary'}`}
                              >
                                <div className="mt-0.5 text-primary group-hover:text-secondary transition-colors flex-shrink-0">
                                  {p.id === 'compliance' ? (
                                    <Shield size={24} />
                                  ) : p.id === 'training' ? (
                                    <BookOpen size={24} />
                                  ) : (
                                    <Award size={24} />
                                  )}
                                </div>
                                <div>
                                  <span className="font-headline-md text-sm text-primary block font-bold">{p.title}</span>
                                  <span className="font-body-std text-xs text-ash line-clamp-1 mt-0.5">{p.description}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Date & Time Selection */}
                    {step === 2 && (
                      <div className="space-y-8 animate-fade-in">
                        <div>
                          <label className="font-label-btn text-xs uppercase tracking-wider text-primary block mb-2">Select Preferred Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" size={16} />
                            <input
                              type="date"
                              id="booking_date_input"
                              min={getMinDate()}
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full pl-16 pr-4 py-4 border border-border text-charcoal font-body-std text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                          </div>
                          <span className="text-[10px] text-ash mt-2 block">Corporate engagements are scheduled strictly Monday through Friday.</span>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="font-label-btn text-xs uppercase tracking-wider text-primary block">Select Consulting Slot</label>
                            <div className="flex bg-[#F0F0F0] p-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-border">
                              <button
                                type="button"
                                onClick={() => setTimezone('SAST')}
                                className={`px-2 py-1 rounded-sm cursor-pointer transition-all ${timezone === 'SAST' ? 'bg-[#B68A35] text-white font-bold' : 'text-ash hover:text-primary'}`}
                              >
                                SAST (UTC+2)
                              </button>
                              <button
                                type="button"
                                onClick={() => setTimezone('UTC')}
                                className={`px-2 py-1 rounded-sm cursor-pointer transition-all ${timezone === 'UTC' ? 'bg-[#B68A35] text-white font-bold' : 'text-ash hover:text-primary'}`}
                              >
                                UTC
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {TIME_SLOTS.map(slot => {
                              const displayTime = timezone === 'SAST' ? formatTimeSlotSAST(slot) : `${slot} (UTC)`;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setTimeSlot(slot)}
                                  className={`p-4 border text-xs font-mono text-center transition-all flex items-center justify-center gap-2 ${timeSlot === slot ? 'border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary' : 'border-border hover:border-secondary text-charcoal'}`}
                                >
                                  <Clock size={12} className={timeSlot === slot ? 'text-primary' : 'text-ash'} />
                                  <span>{displayTime}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="font-label-btn text-xs uppercase tracking-wider text-primary block mb-2">Corporate Objectives & Notes (Optional)</label>
                          <div className="relative">
                            <FileText className="absolute left-4 top-4 text-ash" size={16} />
                            <textarea
                              placeholder="Briefly describe your institutional requirements or context..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              maxLength={5000}
                              rows={3}
                              className="w-full pl-16 pr-4 py-4 border border-border text-charcoal font-body-std text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Final Confirmation Details */}
                    {step === 3 && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="bg-surface border border-border p-8 space-y-8">
                          <h5 className="font-headline-md text-sm text-primary border-b border-border pb-2 font-bold uppercase tracking-wider">Engagement Details</h5>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <span className="text-ash uppercase tracking-wider font-mono">Service Stream:</span>
                            <span className="col-span-2 text-primary font-bold">{currentPillar?.title}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <span className="text-ash uppercase tracking-wider font-mono">Date:</span>
                            <span className="col-span-2 text-primary font-bold">{date} (Weekday)</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <span className="text-ash uppercase tracking-wider font-mono">Time Slot:</span>
                            <span className="col-span-2 text-primary font-bold flex flex-col">
                              <span>{formatTimeSlotSAST(timeSlot)}</span>
                              <span className="text-ash text-[10px] font-normal font-mono">({timeSlot} UTC)</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <span className="text-ash uppercase tracking-wider font-mono">Client Account:</span>
                            <span className="col-span-2 text-charcoal font-bold">{currentUser?.email}</span>
                          </div>

                          {notes && (
                            <div className="border-t border-border pt-4 text-xs">
                              <span className="text-ash uppercase tracking-wider font-mono block mb-2">Notes:</span>
                              <p className="bg-white p-4 border border-border font-body-std text-charcoal whitespace-pre-wrap">{notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-primary/5 border border-primary/15 p-4 rounded-none text-xs flex items-start gap-2 text-primary leading-relaxed">
                          <Sparkles className="flex-shrink-0 text-secondary" size={16} />
                          <span>
                            Automated sync will instantly block this slot in your Google Calendar and dispatch a secure transaction receipt to your corporate Gmail.
                          </span>
                        </div>

                        {/* Visual inline confirmation to replace blocked iframe window.confirm popup */}
                        <div className="border border-border p-4 bg-white flex items-start gap-3 shadow-xs">
                          <input
                            type="checkbox"
                            id="booking_confirm_checkbox"
                            checked={isConfirmedCheckbox}
                            onChange={(e) => setIsConfirmedCheckbox(e.target.checked)}
                            className="mt-1 cursor-pointer h-4 w-4 shrink-0 rounded border-gray-300 accent-[#B68A35]"
                          />
                          <label htmlFor="booking_confirm_checkbox" className="text-xs text-charcoal leading-relaxed cursor-pointer select-none">
                            <strong>I confirm the booking details above</strong> and authorize YITZAK to secure this consultation. {isGuest ? 'My session will be booked directly as a guest.' : 'This will sync with my Google Calendar and trigger notifications.'}
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Footer Nav Controls */}
                    <div className="border-t border-border pt-4 mt-8 flex justify-between gap-4">
                      {step > 1 && (
                        <button
                          onClick={handleBackStep}
                          disabled={loading}
                          className="border border-border text-charcoal px-8 py-4 font-label-btn text-label-btn uppercase tracking-widest hover:border-secondary transition-all active:scale-95 disabled:opacity-50"
                        >
                          Back
                        </button>
                      )}
                      
                      <div className="flex-1" />

                      {step < 3 ? (
                        <button
                          onClick={handleNextStep}
                          className="bg-primary text-on-primary px-16 py-4 font-label-btn text-label-btn uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Continue</span>
                        </button>
                      ) : (
                        <button
                          id="confirm_booking_submit_btn"
                          onClick={handleConfirmBooking}
                          disabled={loading || !isConfirmedCheckbox}
                          className="bg-secondary-container text-on-secondary-container px-16 py-4 font-label-btn text-label-btn uppercase tracking-widest hover:bg-gold-hover hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                          title={!isConfirmedCheckbox ? 'Please confirm booking details first' : undefined}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin" size={14} />
                              <span>Syncing...</span>
                            </>
                          ) : (
                            <span>Confirm & Schedule</span>
                          )}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
