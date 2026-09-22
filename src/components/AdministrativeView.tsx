import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  CheckCircle2,
  XCircle, 
  Clock, 
  FileText, 
  Calendar, 
  Mail, 
  User as UserIcon, 
  Loader2, 
  ExternalLink, 
  Building, 
  Phone, 
  Sparkles, 
  Award, 
  ArrowRight, 
  ClipboardList, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  Megaphone, 
  HelpCircle, 
  Palette, 
  Eye, 
  Check, 
  MessageSquare, 
  RefreshCw, 
  Image as ImageIcon,
  Upload,
  Download,
  KeyRound,
  Lock,
  AlertCircle,
  X,
  Send
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth, getAccessToken, OperationType, handleFirestoreError } from '../lib/firebase';
import { Booking } from '../types';
import { 
  dispatchBookingConfirmationEmail, 
  dispatchBookingCancellationEmail, 
  createBookingMailtoUrl 
} from '../lib/emailService';
import WhitelistManager from './WhitelistManager';
import ChangePasswordModal from './ChangePasswordModal';
import { 
  getStoredAdminPassword, 
  isDefaultAdminPassword, 
  getAdminPasswordLastUpdated,
  resetAdminPasswordToDefault
} from '../lib/authSecurity';
import { getCMSState, saveCMSState, CMSState, CMSFAQItem } from '../lib/cmsState';
import { 
  getStoredTrainingHero, 
  saveCustomTrainingHero, 
  resetTrainingHero, 
  processImageFile, 
  DEFAULT_TRAINING_HERO, 
  FALLBACK_TRAINING_HERO 
} from '../lib/mediaAssets';
import {
  getStoredCustomEmblem,
  getStoredCustomSeal,
  downloadFileFromUrl,
  downloadSvgFile,
  getShieldSvgString,
  getAccreditationSealSvgString
} from '../lib/brandAssets';

interface AdministrativeViewProps {
  bookings: Booking[];
  referrals?: any[];
  loading: boolean;
  onRefresh: () => void;
  onOpenBooking: () => void;
  onOpenFaviconModal?: () => void;
}

export default function AdministrativeView({ 
  bookings, 
  referrals = [], 
  loading, 
  onRefresh, 
  onOpenBooking,
  onOpenFaviconModal
}: AdministrativeViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'consultations' | 'enquiries' | 'referrals' | 'branding' | 'whitelist'>('content');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [referralStatusFilter, setReferralStatusFilter] = useState<'all' | 'needs_coordination' | 'click_logged' | 'coordination_complete' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Email Dispatch & Status State
  const [emailStatusToast, setEmailStatusToast] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
    email: string;
    mailtoUrl?: string;
  } | null>(null);
  const [sendingEmailBookingId, setSendingEmailBookingId] = useState<string | null>(null);

  // CMS Form State
  const [cms, setCms] = useState<CMSState>(() => getCMSState());
  const [cmsSavedToast, setCmsSavedToast] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('Curriculum & Standards');
  const [isAddingFaq, setIsAddingFaq] = useState(false);

  // Training Hero Visual Media CMS State
  const [trainingHeroPhoto, setTrainingHeroPhoto] = useState<string>(() => getStoredTrainingHero());
  const [stagedTrainingHero, setStagedTrainingHero] = useState<{ dataUrl: string; name: string; size: string } | null>(null);
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const [isProcessingHero, setIsProcessingHero] = useState(false);
  const [heroPhotoToast, setHeroPhotoToast] = useState<{ type: 'success' | 'info'; text: string } | null>(null);
  const cmsHeroFileInputRef = useRef<HTMLInputElement>(null);

  // Official Emblem & Accreditation Seal State
  const [officialEmblem, setOfficialEmblem] = useState<string>(() => getStoredCustomEmblem());
  const [accreditationSeal, setAccreditationSeal] = useState<string>(() => getStoredCustomSeal());

  // Password Security State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(() => isDefaultAdminPassword());
  const [passwordLastUpdated, setPasswordLastUpdated] = useState(() => getAdminPasswordLastUpdated());
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // Inquiries State
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  useEffect(() => {
    // Listen for external CMS updates
    const handleUpdate = () => {
      setCms(getCMSState());
    };
    window.addEventListener('yitzak-cms-updated', handleUpdate);
    return () => window.removeEventListener('yitzak-cms-updated', handleUpdate);
  }, []);

  useEffect(() => {
    const handleHeroUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ imageUrl?: string }>;
      const newUrl = customEvent.detail?.imageUrl || getStoredTrainingHero();
      setTrainingHeroPhoto(newUrl);
    };
    window.addEventListener('yitzak-training-hero-updated', handleHeroUpdate);
    return () => window.removeEventListener('yitzak-training-hero-updated', handleHeroUpdate);
  }, []);

  useEffect(() => {
    const handleEmblemUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ emblemUrl?: string }>;
      setOfficialEmblem(customEvent.detail?.emblemUrl || getStoredCustomEmblem());
    };
    const handleSealUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ sealUrl?: string }>;
      setAccreditationSeal(customEvent.detail?.sealUrl || getStoredCustomSeal());
    };
    window.addEventListener('yitzak-emblem-updated', handleEmblemUpdate);
    window.addEventListener('yitzak-seal-updated', handleSealUpdate);
    return () => {
      window.removeEventListener('yitzak-emblem-updated', handleEmblemUpdate);
      window.removeEventListener('yitzak-seal-updated', handleSealUpdate);
    };
  }, []);

  useEffect(() => {
    const handlePasswordChange = () => {
      setIsDefaultPassword(isDefaultAdminPassword());
      setPasswordLastUpdated(getAdminPasswordLastUpdated());
    };
    window.addEventListener('yitzak-admin-password-changed', handlePasswordChange);
    return () => window.removeEventListener('yitzak-admin-password-changed', handlePasswordChange);
  }, []);

  const handleHeroFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }
    setIsProcessingHero(true);
    try {
      const dataUrl = await processImageFile(file);
      const sizeKb = Math.round(file.size / 1024);
      setStagedTrainingHero({
        dataUrl,
        name: file.name,
        size: `${sizeKb} KB`
      });
      setHeroPhotoToast({
        type: 'info',
        text: `"${file.name}" staged. Review preview below and click "Publish Photo to Live Site".`
      });
      setTimeout(() => setHeroPhotoToast(null), 5000);
    } catch (err) {
      console.error('Error processing hero file:', err);
    } finally {
      setIsProcessingHero(false);
    }
  };

  const handlePublishHero = () => {
    if (!stagedTrainingHero) return;
    saveCustomTrainingHero(stagedTrainingHero.dataUrl);
    setTrainingHeroPhoto(stagedTrainingHero.dataUrl);
    setStagedTrainingHero(null);
    setHeroPhotoToast({
      type: 'success',
      text: '✓ Training hero photograph published and live on public site!'
    });
    setTimeout(() => setHeroPhotoToast(null), 4000);
  };

  const handleResetHero = () => {
    if (window.confirm('Reset training hero photograph back to default institutional artwork?')) {
      resetTrainingHero();
      setTrainingHeroPhoto(DEFAULT_TRAINING_HERO);
      setStagedTrainingHero(null);
      setHeroPhotoToast({
        type: 'success',
        text: '✓ Training hero photograph reset to default artwork.'
      });
      setTimeout(() => setHeroPhotoToast(null), 4000);
    }
  };

  // Fetch inquiries on mount or tab change
  useEffect(() => {
    if (activeTab === 'enquiries') {
      fetchInquiries();
    }
  }, [activeTab]);

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const list: any[] = [];
      const localInquiries = JSON.parse(localStorage.getItem('yitzak_inquiries') || '[]');
      localInquiries.forEach((item: any) => list.push(item));

      if (auth.currentUser) {
        try {
          const col = collection(db, 'inquiries');
          const snap = await getDocs(col);
          snap.forEach(d => {
            if (!list.some(item => item.id === d.id)) {
              list.push({ id: d.id, ...d.data() });
            }
          });
        } catch (dbErr) {
          console.warn('Firestore inquiries read note:', dbErr);
        }
      }

      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setInquiries(list);
    } catch (e) {
      console.warn('Could not fetch inquiries:', e);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleSaveCMS = () => {
    saveCMSState(cms);
    setCmsSavedToast(true);
    setTimeout(() => setCmsSavedToast(false), 3000);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    const newFaq: CMSFAQItem = {
      id: `faq-custom-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: newFaqCategory,
      updatedAt: new Date().toISOString()
    };

    const updated = {
      ...cms,
      customFaqs: [...cms.customFaqs, newFaq]
    };
    setCms(updated);
    saveCMSState(updated);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setIsAddingFaq(false);
    setCmsSavedToast(true);
    setTimeout(() => setCmsSavedToast(false), 3000);
  };

  const handleDeleteFaq = (id: string) => {
    const updated = {
      ...cms,
      customFaqs: cms.customFaqs.filter(f => f.id !== id)
    };
    setCms(updated);
    saveCMSState(updated);
  };

  const formatTimeSlotSAST = (slot: string) => {
    if (!slot) return '';
    const [start, end] = slot.split(' - ');
    const convertHour = (hStr: string) => {
      const h = parseInt(hStr.split(':')[0], 10);
      const newH = (h + 2) % 24;
      return `${newH.toString().padStart(2, '0')}:00`;
    };
    return `${convertHour(start)} - ${convertHour(end)} (SAST)`;
  };

  // Statistics calculation
  const totalRequests = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  const totalReferrals = referrals.length;

  // Filter bookings based on controls
  const filteredBookings = bookings.filter(booking => {
    const searchLower = (search || '').toLowerCase().trim();
    const userName = (booking?.userName || '').toLowerCase();
    const userEmail = (booking?.userEmail || '').toLowerCase();
    const pillar = (booking?.pillar || '').toLowerCase();

    const matchesSearch = 
      !searchLower ||
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      pillar.includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || booking?.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter referrals based on controls
  const filteredReferrals = referrals.filter(ref => {
    const searchLower = (search || '').toLowerCase().trim();
    const userName = (ref?.userName || '').toLowerCase();
    const userEmail = (ref?.userEmail || '').toLowerCase();
    const schemeName = (ref?.schemeName || '').toLowerCase();
    const referralCode = (ref?.referralCode || '').toLowerCase();
    const userCompany = (ref?.userCompany || '').toLowerCase();

    const matchesSearch = 
      !searchLower ||
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      schemeName.includes(searchLower) ||
      referralCode.includes(searchLower) ||
      userCompany.includes(searchLower);
    
    const matchesStatus = referralStatusFilter === 'all' || ref?.status === referralStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDispatchBookingEmail = async (b: Booking, type: 'confirmation' | 'cancellation') => {
    if (!b?.userEmail) {
      alert('This booking record does not contain a recipient client email address.');
      return;
    }

    setSendingEmailBookingId(b.id || b.userEmail);
    try {
      const accessToken = await getAccessToken().catch(() => null);
      const mailto = createBookingMailtoUrl(type, {
        to: b.userEmail,
        recipientName: b.userName || 'Valued Client',
        date: b.date || 'Scheduled Date',
        timeSlot: b.timeSlot || 'Standard Slot',
        pillarName: b.pillar || 'Professional Advisory & Compliance',
        notes: b.notes,
      });

      if (type === 'confirmation') {
        const res = await dispatchBookingConfirmationEmail({
          to: b.userEmail,
          recipientName: b.userName || 'Valued Client',
          date: b.date || 'Scheduled Date',
          timeSlot: b.timeSlot || 'Standard Slot',
          pillarName: b.pillar || 'Professional Advisory & Compliance',
          notes: b.notes,
        }, accessToken);

        setEmailStatusToast({
          type: 'success',
          message: `Booking confirmation email successfully dispatched to ${b.userEmail}`,
          email: b.userEmail,
          mailtoUrl: mailto
        });
      } else {
        const res = await dispatchBookingCancellationEmail({
          to: b.userEmail,
          recipientName: b.userName || 'Valued Client',
          date: b.date || 'Scheduled Date',
          timeSlot: b.timeSlot || 'Standard Slot',
          pillarName: b.pillar || 'Professional Advisory & Compliance',
          notes: b.notes,
        }, accessToken);

        setEmailStatusToast({
          type: 'info',
          message: `Booking cancellation notice successfully dispatched to ${b.userEmail}`,
          email: b.userEmail,
          mailtoUrl: mailto
        });
      }
    } catch (err: any) {
      console.warn('Booking email dispatch note:', err);
      const mailto = createBookingMailtoUrl(type, {
        to: b.userEmail,
        recipientName: b.userName || 'Valued Client',
        date: b.date || 'Scheduled Date',
        timeSlot: b.timeSlot || 'Standard Slot',
        pillarName: b.pillar || 'Professional Advisory & Compliance',
        notes: b.notes,
      });
      setEmailStatusToast({
        type: 'info',
        message: `Status recorded. You can also send the ${type} notice directly via your email client.`,
        email: b.userEmail,
        mailtoUrl: mailto
      });
    } finally {
      setSendingEmailBookingId(null);
    }
  };

  const handleUpdateStatus = async (
    bookingId: string, 
    currentEventId: string | undefined, 
    newStatus: 'confirmed' | 'cancelled',
    directBookingObj?: Booking
  ) => {
    setUpdatingId(bookingId);

    // Resolve booking record early
    const resolvedBooking = directBookingObj || 
      bookings.find(b => b.id === bookingId) || 
      JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]').find((b: any) => b.id === bookingId || b.bookingRef === bookingId) ||
      JSON.parse(localStorage.getItem('yitzak_guest_bookings') || '[]').find((b: any) => b.id === bookingId);

    try {
      // 1. Update in local storage consultation requests
      try {
        const localReqs = JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]');
        const updatedReqs = localReqs.map((b: any) => {
          if (b.id === bookingId || b.bookingRef === bookingId) {
            return { ...b, status: newStatus, updatedAt: new Date().toISOString() };
          }
          return b;
        });
        localStorage.setItem('yitzak_consultation_requests', JSON.stringify(updatedReqs));

        const localGuests = JSON.parse(localStorage.getItem('yitzak_guest_bookings') || '[]');
        const updatedGuests = localGuests.map((b: any) => {
          if (b.id === bookingId) {
            return { ...b, status: newStatus, updatedAt: new Date().toISOString() };
          }
          return b;
        });
        localStorage.setItem('yitzak_guest_bookings', JSON.stringify(updatedGuests));
      } catch (locErr) {
        console.warn('Local storage status update note:', locErr);
      }

      // 2. Cancel calendar event if applicable
      if (newStatus === 'cancelled' && currentEventId) {
        const accessToken = await getAccessToken().catch(() => null);
        if (accessToken) {
          try {
            await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${currentEventId}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          } catch (calErr) {
            console.warn('Could not delete calendar event, proceeding to update DB status: ', calErr);
          }
        }
      }

      // 3. Update Firestore if authenticated in Firebase Auth
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'bookings', bookingId), {
            status: newStatus,
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn('Firestore updateDoc note:', dbErr);
        }
      }

      // 4. Automatically dispatch email to client & advisory desk
      if (resolvedBooking?.userEmail) {
        await handleDispatchBookingEmail(resolvedBooking, newStatus === 'confirmed' ? 'confirmation' : 'cancellation');
      }

      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert(`Administrative status update note: ${err.message || String(err)}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateReferralStatus = async (referralId: string, newStatus: string) => {
    setUpdatingId(referralId);
    try {
      await updateDoc(doc(db, 'referral_clicks', referralId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      const localRefs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
      const updated = localRefs.map((r: any) => {
        if (r.id === referralId) {
          return { ...r, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return r;
      });
      localStorage.setItem('yitzak_referral_clicks', JSON.stringify(updated));

      onRefresh();
    } catch (err: any) {
      console.error('Failed to update referral status:', err);
      const localRefs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
      const updated = localRefs.map((r: any) => {
        if (r.id === referralId) {
          return { ...r, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return r;
      });
      localStorage.setItem('yitzak_referral_clicks', JSON.stringify(updated));
      onRefresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-charcoal font-sans">
      {/* Top Banner Notice */}
      <div className="bg-[#023625] text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-[#034d35]">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-white/10 rounded-xl text-[#B68A35] shrink-0 mt-0.5">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h5 className="font-serif text-base text-white font-bold tracking-tight">YITZAK Administrative Console &amp; CMS</h5>
              <span className="bg-[#B68A35] text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded tracking-wider">
                Root Admin
              </span>
            </div>
            <p className="text-xs text-white/75 mt-1 leading-relaxed">
              Live content management system, booking schedule desk, and institutional assets for <strong>cgumpo@yitzak.co.za</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-start sm:justify-end">
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all cursor-pointer shadow-2xs"
            title="Change administrator portal password"
          >
            <KeyRound size={13} className="text-[#B68A35]" />
            <span className="whitespace-nowrap">Change Password</span>
          </button>

          {onOpenFaviconModal && (
            <button
              type="button"
              onClick={onOpenFaviconModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition-all cursor-pointer shadow-2xs"
            >
              <Palette size={13} className="text-[#B68A35]" />
              <span className="whitespace-nowrap">Branding Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Default Password Security Advisory Banner */}
      {isDefaultPassword && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="p-1.5 bg-amber-200/60 rounded-lg text-amber-800 shrink-0 mt-0.5 sm:mt-0">
              <KeyRound size={17} className="text-amber-800" />
            </div>
            <div>
              <p className="font-bold text-amber-950">Security Notice: Default Password Active (<code className="bg-amber-100 font-mono px-1.5 py-0.5 rounded text-amber-950 font-bold">123456</code>)</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Your portal login currently uses the default password. We strongly recommend setting a custom password to protect your institutional administrative console.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="px-3.5 py-2 bg-[#023625] hover:bg-[#034d35] text-white font-bold rounded-xl transition-all text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <KeyRound size={13} className="text-[#B68A35]" />
            <span>Update Password Now</span>
          </button>
        </div>
      )}

      {/* Primary CMS Navigation Tabs (Smooth Sideways Scrollable on Mobile) */}
      <div className="relative border-b border-border">
        <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 touch-pan-x scroll-smooth whitespace-nowrap gap-1 pb-0.5">
          <button
            onClick={() => setActiveTab('content')}
            className={`shrink-0 px-3.5 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'content' 
                ? 'border-[#B68A35] text-primary bg-[#B68A35]/5 font-extrabold' 
                : 'border-transparent text-ash hover:text-primary hover:bg-mist'
            }`}
          >
            <Edit3 size={15} className={activeTab === 'content' ? 'text-[#B68A35]' : ''} />
            <span>Site Content (CMS)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('consultations');
              setSearch('');
            }}
            className={`shrink-0 px-3.5 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'consultations' 
                ? 'border-[#B68A35] text-primary bg-[#B68A35]/5 font-extrabold' 
                : 'border-transparent text-ash hover:text-primary hover:bg-mist'
            }`}
          >
            <ClipboardList size={15} className={activeTab === 'consultations' ? 'text-[#B68A35]' : ''} />
            <span>Consultations ({totalRequests})</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`shrink-0 px-3.5 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'enquiries' 
                ? 'border-[#B68A35] text-primary bg-[#B68A35]/5 font-extrabold' 
                : 'border-transparent text-ash hover:text-primary hover:bg-mist'
            }`}
          >
            <MessageSquare size={15} className={activeTab === 'enquiries' ? 'text-[#B68A35]' : ''} />
            <span>Inbound Enquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('referrals');
              setSearch('');
            }}
            className={`shrink-0 px-3.5 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'referrals' 
                ? 'border-[#B68A35] text-primary bg-[#B68A35]/5 font-extrabold' 
                : 'border-transparent text-ash hover:text-primary hover:bg-mist'
            }`}
          >
            <Award size={15} className={activeTab === 'referrals' ? 'text-[#B68A35]' : ''} />
            <span>Partner Referrals ({totalReferrals})</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`shrink-0 px-3.5 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'branding' 
                ? 'border-[#B68A35] text-primary bg-[#B68A35]/5 font-extrabold' 
                : 'border-transparent text-ash hover:text-primary hover:bg-mist'
            }`}
          >
            <Palette size={15} className={activeTab === 'branding' ? 'text-[#B68A35]' : ''} />
            <span>Branding Studio</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('whitelist');
              setSearch('');
            }}
            className={`shrink-0 px-3.5 sm:px-5 py-3 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'whitelist' 
                ? 'border-[#B68A35] text-primary bg-[#B68A35]/5 font-extrabold' 
                : 'border-transparent text-ash hover:text-primary hover:bg-mist'
            }`}
          >
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Staff Access</span>
          </button>
        </div>
        {/* Subtle right gradient indicator on mobile */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent sm:hidden" />
      </div>

      {/* TAB 1: CONTENT MANAGEMENT SYSTEM (CMS) */}
      {activeTab === 'content' && (
        <div className="space-y-8 animate-fade-in">
          {cmsSavedToast && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" />
              <span>✓ CMS updates published and saved to live site successfully!</span>
            </div>
          )}

          {/* Section 1: Live Site Announcement Notice Bar */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <Megaphone className="text-[#B68A35]" size={20} />
                  Top Site Announcement Notice Bar
                </h4>
                <p className="text-xs text-ash mt-0.5">
                  Controls the persistent announcement strip displayed at the very top of all public web pages.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={cms.banner.enabled}
                    onChange={(e) => setCms({ ...cms, banner: { ...cms.banner, enabled: e.target.checked } })}
                    className="w-4 h-4 text-[#B68A35] rounded focus:ring-[#B68A35]"
                  />
                  <span>{cms.banner.enabled ? 'Enabled (Visible on Site)' : 'Disabled (Hidden)'}</span>
                </label>
              </div>
            </div>

            {/* Live Preview of the Banner */}
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-ash block mb-1.5 flex items-center gap-1">
                <Eye size={12} /> Live Preview on Site
              </span>
              <div className={`p-3 rounded-xl text-xs font-sans flex items-center justify-between gap-4 border ${
                cms.banner.theme === 'emerald' ? 'bg-[#023625] text-white border-[#034d35]' :
                cms.banner.theme === 'gold' ? 'bg-[#B68A35] text-white border-[#9E7528]' :
                'bg-[#111827] text-white border-gray-800'
              }`}>
                <div className="flex items-center gap-2.5 truncate">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-white/20 text-white">
                    {cms.banner.badge || 'NOTICE'}
                  </span>
                  <span className="truncate">{cms.banner.text || 'Enter your notice text below...'}</span>
                </div>
                {cms.banner.linkText && (
                  <span className="text-xs font-semibold underline text-[#E6CA85] shrink-0">
                    {cms.banner.linkText} →
                  </span>
                )}
              </div>
            </div>

            {/* Banner Editor Fields */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={cms.banner.badge}
                  onChange={(e) => setCms({ ...cms, banner: { ...cms.banner, badge: e.target.value } })}
                  placeholder="e.g. NOTICE, SCHEDULE"
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white font-mono"
                />
              </div>

              <div className="md:col-span-6">
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Notice Text</label>
                <input
                  type="text"
                  value={cms.banner.text}
                  onChange={(e) => setCms({ ...cms, banner: { ...cms.banner, text: e.target.value } })}
                  placeholder="Announcement text shown across website"
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Theme Color</label>
                <select
                  value={cms.banner.theme}
                  onChange={(e) => setCms({ ...cms, banner: { ...cms.banner, theme: e.target.value as any } })}
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white cursor-pointer"
                >
                  <option value="emerald">Institutional Emerald (#023625)</option>
                  <option value="gold">Executive Gold (#B68A35)</option>
                  <option value="charcoal">Slate Charcoal (#111827)</option>
                </select>
              </div>

              <div className="md:col-span-6">
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Button / Link Label</label>
                <input
                  type="text"
                  value={cms.banner.linkText || ''}
                  onChange={(e) => setCms({ ...cms, banner: { ...cms.banner, linkText: e.target.value } })}
                  placeholder="e.g. View Calendar, Book Audit"
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white"
                />
              </div>

              <div className="md:col-span-6">
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Link Destination View</label>
                <select
                  value={cms.banner.linkTarget || 'training'}
                  onChange={(e) => setCms({ ...cms, banner: { ...cms.banner, linkTarget: e.target.value } })}
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white cursor-pointer"
                >
                  <option value="training">Training Calendar View</option>
                  <option value="contact">Contact &amp; Enquiry View</option>
                  <option value="schemes">GFSI Schemes Catalog</option>
                  <option value="booking">Direct Consultation Modal</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveCMS}
                className="px-5 py-2.5 bg-primary hover:bg-[#034d35] text-white rounded-xl text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} />
                <span>Save Banner to Live Site</span>
              </button>
            </div>
          </div>

          {/* Section 2: Training Hero Photograph & Visual Media Asset CMS */}
          <div id="cms-training-hero-section" className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <ImageIcon className="text-[#B68A35]" size={20} />
                  Training Hero Photograph &amp; Media CMS
                </h4>
                <p className="text-xs text-ash mt-0.5">
                  Replace and manage the primary photography featured in the public &ldquo;Training that builds real competence&rdquo; section.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE ON SITE
                </span>
              </div>
            </div>

            {heroPhotoToast && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 animate-fade-in ${
                heroPhotoToast.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className={heroPhotoToast.type === 'success' ? 'text-emerald-600' : 'text-amber-600'} />
                  <span>{heroPhotoToast.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHeroPhotoToast(null)}
                  className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Live Card Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-ash flex items-center gap-1.5">
                    <Eye size={13} className="text-[#B68A35]" />
                    {stagedTrainingHero ? 'Staged Replacement Preview' : 'Current Live Website Image'}
                  </span>
                  {stagedTrainingHero && (
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Unpublished Changes Staged
                    </span>
                  )}
                </div>

                <div className="relative rounded-xl overflow-hidden border border-border shadow-xs aspect-[4/3] bg-mist/50 group">
                  <img
                    src={stagedTrainingHero ? stagedTrainingHero.dataUrl : trainingHeroPhoto}
                    alt="Training Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white text-xs space-y-0.5">
                      <p className="font-bold font-serif">Public Homepage &amp; Academy View</p>
                      <p className="text-[11px] text-white/80">Aspect ratio: 4:3 · High-density optimized display</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-ash bg-mist/40 p-2.5 rounded-xl border border-border/80">
                  <span className="font-mono">Dimensions: 4:3 Landscape</span>
                  <div className="flex items-center gap-3">
                    <a
                      href={trainingHeroPhoto}
                      download="yitzak-training-hero.png"
                      className="text-[#023625] hover:text-[#B68A35] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Download Current</span>
                    </a>
                    {trainingHeroPhoto !== DEFAULT_TRAINING_HERO && (
                      <button
                        type="button"
                        onClick={handleResetHero}
                        className="text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>Reset Default</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Upload & Replacement Controls */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                <input
                  ref={cmsHeroFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleHeroFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {/* Dropzone Container */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingHero(true);
                  }}
                  onDragLeave={() => setIsDraggingHero(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingHero(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleHeroFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => cmsHeroFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[210px] ${
                    isDraggingHero 
                      ? 'border-[#B68A35] bg-[#B68A35]/10' 
                      : 'border-slate-300 hover:border-[#023625] bg-mist/20 hover:bg-mist/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-border flex items-center justify-center text-[#023625]">
                    {isProcessingHero ? (
                      <Loader2 className="animate-spin text-[#B68A35]" size={22} />
                    ) : (
                      <Upload size={22} className="text-[#B68A35]" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif font-bold text-sm text-primary">
                      {isDraggingHero ? 'Drop photo here now' : 'Click or drag new training photo here'}
                    </p>
                    <p className="text-xs text-ash max-w-xs mx-auto">
                      Supports PNG, JPG, JPEG, WEBP, and SVG. Photos are automatically compressed and framed to 4:3.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cmsHeroFileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-charcoal font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Upload size={13} className="text-[#B68A35]" />
                    <span>Choose File From Device</span>
                  </button>
                </div>

                {/* Staged file banner & Publish controls */}
                {stagedTrainingHero ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-amber-700 shrink-0" />
                        <span className="text-xs font-bold text-amber-900 truncate max-w-[200px]">
                          {stagedTrainingHero.name}
                        </span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded">
                          {stagedTrainingHero.size}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStagedTrainingHero(null)}
                        className="text-[11px] text-amber-800 hover:text-red-700 underline font-semibold cursor-pointer"
                      >
                        Discard
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handlePublishHero}
                        className="flex-1 py-2.5 bg-[#023625] hover:bg-[#034d35] text-white text-xs font-serif font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save size={14} className="text-[#B68A35]" />
                        <span>Publish Photo to Live Site</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStagedTrainingHero(null)}
                        className="px-3 py-2.5 bg-white border border-amber-300 text-charcoal text-xs font-semibold rounded-xl hover:bg-amber-100/50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border text-xs text-ash">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#023625]" />
                      <span>Live site currently renders institutional training photo</span>
                    </span>
                    {onOpenFaviconModal && (
                      <button
                        type="button"
                        onClick={onOpenFaviconModal}
                        className="text-[#023625] hover:text-[#B68A35] font-semibold underline cursor-pointer text-xs"
                      >
                        Open in Branding Studio
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Contact Details & Headquarters */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-border pb-4">
              <h4 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <Building className="text-[#B68A35]" size={20} />
                Advisory Desk &amp; Corporate Contact Details
              </h4>
              <p className="text-xs text-ash mt-0.5">
                Updates institutional contact information displayed in the footer, contact page, and inquiry receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Telephone / Hotline</label>
                <input
                  type="text"
                  value={cms.contact.phone}
                  onChange={(e) => setCms({ ...cms, contact: { ...cms.contact, phone: e.target.value } })}
                  placeholder="+27 60 763 6710"
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Lead Advisor Work Email</label>
                <input
                  type="email"
                  value={cms.contact.email}
                  onChange={(e) => setCms({ ...cms, contact: { ...cms.contact, email: e.target.value } })}
                  placeholder="cgumpo@yitzak.co.za"
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Headquarters / Operating Base</label>
                <input
                  type="text"
                  value={cms.contact.address}
                  onChange={(e) => setCms({ ...cms, contact: { ...cms.contact, address: e.target.value } })}
                  placeholder="Randburg, Johannesburg, South Africa"
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Consulting Hours (SAST)</label>
                <input
                  type="text"
                  value={cms.contact.businessHours}
                  onChange={(e) => setCms({ ...cms, contact: { ...cms.contact, businessHours: e.target.value } })}
                  placeholder="Mon - Fri: 08:00 - 17:00 SAST"
                  className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveCMS}
                className="px-5 py-2.5 bg-primary hover:bg-[#034d35] text-white rounded-xl text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save size={14} />
                <span>Save Contact Details</span>
              </button>
            </div>
          </div>

          {/* Section 3: Knowledge Base & FAQ CMS Manager */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <HelpCircle className="text-[#B68A35]" size={20} />
                  Knowledge Base &amp; FAQ Manager
                </h4>
                <p className="text-xs text-ash mt-0.5">
                  Publish custom frequently asked questions and compliance guidance directly to the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingFaq(!isAddingFaq)}
                className="px-4 py-2 bg-[#B68A35] hover:bg-[#9E7528] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus size={14} />
                <span>Add New FAQ</span>
              </button>
            </div>

            {/* Add FAQ Form */}
            {isAddingFaq && (
              <form onSubmit={handleAddFaq} className="bg-mist/60 border border-border p-5 rounded-xl space-y-4">
                <h5 className="font-serif text-sm font-bold text-primary">Add New Frequently Asked Question</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Question</label>
                    <input
                      type="text"
                      required
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      placeholder="e.g. What is the preparation timeframe for FSSC 22000 Version 6?"
                      className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Category</label>
                    <select
                      value={newFaqCategory}
                      onChange={(e) => setNewFaqCategory(e.target.value)}
                      className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white cursor-pointer"
                    >
                      <option value="Curriculum & Standards">Curriculum &amp; Standards</option>
                      <option value="In-House Solutions">In-House Solutions</option>
                      <option value="Certificates & Verification">Certificates &amp; Verification</option>
                      <option value="Schedules & Registration">Schedules &amp; Registration</option>
                      <option value="Audit Readiness">Audit Readiness</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-ash block mb-1">Answer</label>
                  <textarea
                    rows={3}
                    required
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Comprehensive institutional response for clients..."
                    className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingFaq(false)}
                    className="px-4 py-2 border border-border text-charcoal text-xs rounded-xl font-medium hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold hover:bg-[#034d35] cursor-pointer"
                  >
                    Publish FAQ
                  </button>
                </div>
              </form>
            )}

            {/* Custom FAQs List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-ash">
                <span>Custom Published FAQs ({cms.customFaqs.length})</span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">4 Standard Base FAQs Active</span>
              </div>

              {cms.customFaqs.length === 0 ? (
                <div className="p-6 border border-dashed border-border rounded-xl text-center text-xs text-ash bg-mist/30">
                  No custom FAQs published yet. Click "Add New FAQ" above to add dynamic guidance questions to the live website.
                </div>
              ) : (
                cms.customFaqs.map((faq) => (
                  <div key={faq.id} className="p-4 border border-border rounded-xl bg-white flex items-start justify-between gap-4 shadow-2xs">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {faq.category}
                        </span>
                      </div>
                      <h6 className="font-serif font-bold text-xs text-primary">{faq.question}</h6>
                      <p className="text-xs text-ash leading-relaxed">{faq.answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 text-ash hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSULTATIONS DESK */}
      {activeTab === 'consultations' && (
        <div className="space-y-6 animate-fade-in">
          {/* Corporate Dashboard Statistics panel for Bookings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-border bg-surface p-2.5 sm:p-4 rounded-xl">
            <div className="bg-white p-2.5 sm:p-4 border border-border text-center overflow-hidden rounded-lg">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-ash uppercase tracking-wider block leading-tight break-words">Total Bookings</span>
              <span className="font-serif text-primary text-lg sm:text-xl font-bold mt-1 sm:mt-2 block">{totalRequests}</span>
            </div>
            <div className="bg-white p-2.5 sm:p-4 border border-border text-center overflow-hidden rounded-lg">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-secondary uppercase tracking-wider block leading-tight break-words">Pending Review</span>
              <span className="font-serif text-secondary text-lg sm:text-xl font-bold mt-1 sm:mt-2 block">{pendingCount}</span>
            </div>
            <div className="bg-white p-2.5 sm:p-4 border border-border text-center overflow-hidden rounded-lg">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-primary uppercase tracking-wider block leading-tight break-words">Approved Sessions</span>
              <span className="font-serif text-primary text-lg sm:text-xl font-bold mt-1 sm:mt-2 block">{confirmedCount}</span>
            </div>
            <div className="bg-white p-2.5 sm:p-4 border border-border text-center overflow-hidden rounded-lg">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-ash uppercase tracking-wider block leading-tight break-words">Cancelled Cases</span>
              <span className="font-serif text-ash text-lg sm:text-xl font-bold mt-1 sm:mt-2 block">{cancelledCount}</span>
            </div>
          </div>

          {/* Email Notification Status Banner */}
          {emailStatusToast && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in ${
              emailStatusToast.type === 'success' 
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-start sm:items-center gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${emailStatusToast.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  <Mail size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>{emailStatusToast.message}</span>
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Notification synchronized for client: <strong>{emailStatusToast.email}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {emailStatusToast.mailtoUrl && (
                  <a
                    href={emailStatusToast.mailtoUrl}
                    className="px-3 py-1.5 bg-white border border-current rounded-lg font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-neutral-50 transition-colors shadow-2xs"
                    title="Open draft in your local mail client or Gmail"
                  >
                    <ExternalLink size={12} />
                    <span>Open in Email App</span>
                  </a>
                )}
                <button
                  onClick={() => setEmailStatusToast(null)}
                  className="p-1 hover:bg-black/5 rounded cursor-pointer"
                  title="Dismiss notice"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Filters bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" size={16} />
              <input
                type="text"
                placeholder="Search consultations by client, email, or pillar stream..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border text-charcoal text-xs outline-none focus:border-primary rounded-lg bg-white"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-2 border text-[10px] uppercase tracking-wider font-bold transition-all rounded-lg shrink-0 cursor-pointer ${statusFilter === f ? 'border-primary bg-primary text-white' : 'border-border text-charcoal hover:border-secondary bg-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings Table / List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="text-xs text-ash">Retrieving full database records...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center space-y-2 bg-surface rounded-xl">
                <p className="font-serif text-sm text-primary font-bold">No consultations matching criteria</p>
                <p className="text-xs text-ash">Adjust search terms or clear status filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map(b => (
                  <div
                    key={b.id}
                    className="border border-border p-4 bg-white hover:border-[#B68A35] transition-all rounded-xl shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-[#B68A35] font-bold block">{b.pillar}</span>
                        <h6 className="font-serif font-bold text-sm text-primary">{b.userName}</h6>
                        <span className="text-xs text-ash font-mono">{b.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded font-bold tracking-wider ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-charcoal bg-mist/40 p-2.5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-ash" />
                        <span>Date: <strong>{b.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-ash" />
                        <span>Time: <strong>{formatTimeSlotSAST(b.timeSlot)}</strong></span>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-ash italic bg-white p-2 border border-border/50 rounded">
                        "{b.notes}"
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-ash font-mono">
                          {b.googleEventId ? '✓ Google Calendar Event Linked' : 'Manual Entry'}
                        </span>
                        {b.userEmail && (
                          <a
                            href={createBookingMailtoUrl(b.status === 'cancelled' ? 'cancellation' : 'confirmation', {
                              to: b.userEmail,
                              recipientName: b.userName || 'Valued Client',
                              date: b.date || '',
                              timeSlot: b.timeSlot || '',
                              pillarName: b.pillar || 'Professional Advisory & Compliance',
                              notes: b.notes
                            })}
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-secondary font-mono underline ml-1"
                            title="Open pre-filled message in your email client"
                          >
                            <Mail size={11} />
                            <span>Mailto Draft</span>
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status update buttons */}
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id!, b.googleEventId, 'confirmed', b)}
                            disabled={updatingId === b.id || sendingEmailBookingId === b.id}
                            className="px-3 py-1.5 bg-primary hover:bg-[#034d35] text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            <Check size={12} />
                            <span>{updatingId === b.id ? 'Updating...' : 'Confirm'}</span>
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id!, b.googleEventId, 'cancelled', b)}
                            disabled={updatingId === b.id || sendingEmailBookingId === b.id}
                            className="px-3 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            <X size={12} />
                            <span>{updatingId === b.id ? 'Updating...' : 'Cancel'}</span>
                          </button>
                        )}

                        {/* Direct email dispatch actions */}
                        {b.userEmail && (
                          <>
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleDispatchBookingEmail(b, 'confirmation')}
                                disabled={sendingEmailBookingId === b.id || updatingId === b.id}
                                className="px-2.5 py-1.5 border border-[#023625]/40 text-[#023625] hover:bg-[#023625]/5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                title={`Resend confirmation email directly to ${b.userEmail}`}
                              >
                                <Mail size={11} />
                                <span>{sendingEmailBookingId === b.id ? 'Sending...' : 'Resend Confirmation'}</span>
                              </button>
                            )}

                            {b.status === 'cancelled' && (
                              <button
                                onClick={() => handleDispatchBookingEmail(b, 'cancellation')}
                                disabled={sendingEmailBookingId === b.id || updatingId === b.id}
                                className="px-2.5 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                title={`Resend cancellation notice directly to ${b.userEmail}`}
                              >
                                <Mail size={11} />
                                <span>{sendingEmailBookingId === b.id ? 'Sending...' : 'Resend Cancellation'}</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INBOUND ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h4 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <MessageSquare className="text-[#B68A35]" size={20} />
                Inbound Web Enquiries &amp; Form Submissions
              </h4>
              <p className="text-xs text-ash mt-0.5">
                Client submissions sent through the "Send an Enquiry" contact form and website chat.
              </p>
            </div>
            <button
              onClick={fetchInquiries}
              disabled={inquiriesLoading}
              className="p-2 border border-border hover:border-[#B68A35] rounded-lg text-ash hover:text-primary transition-colors cursor-pointer"
              title="Refresh Inquiries"
            >
              <RefreshCw size={15} className={inquiriesLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {inquiriesLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-xs text-ash">Retrieving incoming messages...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center space-y-2 bg-surface rounded-xl">
              <p className="font-serif text-sm text-primary font-bold">No enquiries received yet</p>
              <p className="text-xs text-ash">Inbound messages from the contact form will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="border border-border p-5 rounded-xl bg-white shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#B68A35]/15 text-[#7a5a1f]">
                          {inq.subject || 'General Enquiry'}
                        </span>
                        <span className="text-[10px] text-ash font-mono">
                          {inq.createdAt?.seconds ? new Date(inq.createdAt.seconds * 1000).toLocaleString() : new Date(inq.createdAt || '').toLocaleString()}
                        </span>
                      </div>
                      <h6 className="font-serif font-bold text-sm text-primary mt-1">{inq.name}</h6>
                      <a href={`mailto:${inq.email}`} className="text-xs text-[#B68A35] hover:underline font-mono">
                        {inq.email}
                      </a>
                    </div>
                    <a
                      href={`mailto:${inq.email}?subject=Re:%20${encodeURIComponent(inq.subject || 'YITZAK Advisory Enquiry')}`}
                      className="px-3.5 py-1.5 bg-primary hover:bg-[#034d35] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Mail size={13} />
                      <span>Reply via Email</span>
                    </a>
                  </div>
                  <div className="bg-mist/50 p-3 rounded-lg text-xs text-charcoal leading-relaxed whitespace-pre-wrap">
                    {inq.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PARTNER REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" size={16} />
              <input
                type="text"
                placeholder="Search partner referrals by client or tracking code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border text-charcoal text-xs outline-none focus:border-primary rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredReferrals.length === 0 ? (
              <div className="border border-dashed border-border p-12 text-center space-y-2 bg-surface rounded-xl">
                <p className="font-serif text-sm text-primary font-bold">No partner referral records found</p>
                <p className="text-xs text-ash">Outbound FoodChain ID referral tracking will appear here.</p>
              </div>
            ) : (
              filteredReferrals.map(ref => (
                <div key={ref.id} className="border border-border p-5 rounded-xl bg-white shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-[#B68A35] font-bold block">{ref.schemeName}</span>
                      <h6 className="font-serif font-bold text-sm text-primary">{ref.userName}</h6>
                      <span className="text-xs text-ash font-mono">{ref.userEmail}</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BRAND & FAVICON STUDIO */}
      {activeTab === 'branding' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-6">
            <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <Palette className="text-[#B68A35]" size={20} />
                  Institutional Branding &amp; Asset Studio
                </h4>
                <p className="text-xs text-ash mt-0.5">
                  Manage official vector logos, browser tab favicons, executive stationery, and brand tokens.
                </p>
              </div>
              {onOpenFaviconModal && (
                <button
                  type="button"
                  onClick={onOpenFaviconModal}
                  className="px-4 py-2.5 bg-[#023625] hover:bg-[#034d35] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
                >
                  <Sparkles size={14} className="text-[#B68A35]" />
                  <span>Launch Branding Studio Modal</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 border border-border rounded-xl bg-mist/30 text-center space-y-3 flex flex-col items-center justify-between">
                <div className="w-16 h-16 rounded-xl bg-white border border-border flex items-center justify-center p-2 shadow-2xs">
                  <img src="/YITZAK-icon-green.png" alt="Icon" className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <h6 className="font-serif font-bold text-sm text-primary">Live Browser Favicon</h6>
                  <p className="text-[11px] text-ash mt-1">Multi-resolution PNG, SVG &amp; ICO browser tab icon.</p>
                </div>
                {onOpenFaviconModal && (
                  <button
                    type="button"
                    onClick={onOpenFaviconModal}
                    className="w-full py-2 bg-primary hover:bg-[#034d35] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-[#B68A35]" />
                    <span>Open Favicon Studio</span>
                  </button>
                )}
              </div>

              <div className="p-5 border border-border rounded-xl bg-mist/30 text-center space-y-3 flex flex-col items-center justify-between">
                <div className="w-full h-16 rounded-xl bg-white border border-border flex items-center justify-center p-2 shadow-2xs">
                  <img src="/YITZAK-logo-green.png" alt="Logo" className="max-h-10 object-contain" />
                </div>
                <div>
                  <h6 className="font-serif font-bold text-sm text-primary">Header Horizontal Logo</h6>
                  <p className="text-[11px] text-ash mt-1">High-res PNG &amp; vector SVG with gold advisory typography.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <a
                    href="/YITZAK-logo-green.png"
                    download="YITZAK-logo-green.png"
                    className="py-2 border border-border hover:border-primary text-charcoal hover:text-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>PNG</span>
                  </a>
                  <a
                    href="/favicon.svg"
                    download="YITZAK-crest.svg"
                    className="py-2 border border-border hover:border-primary text-charcoal hover:text-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>SVG</span>
                  </a>
                </div>
              </div>

              <div className="p-5 border border-border rounded-xl bg-mist/30 text-center space-y-3 flex flex-col items-center justify-between">
                <div className="w-16 h-16 rounded-xl bg-[#023625] border border-[#034d35] flex items-center justify-center p-2 shadow-2xs text-[#B68A35] font-serif font-bold text-xl">
                  YZ
                </div>
                <div>
                  <h6 className="font-serif font-bold text-sm text-primary">Brand Palette Tokens</h6>
                  <p className="text-[11px] text-ash mt-1">#023625 (Primary) · #B68A35 (Gold) · #FFFFFF</p>
                </div>
                <div className="flex gap-2 w-full">
                  <div className="flex-1 py-1.5 bg-[#023625] text-white text-[10px] font-mono text-center rounded font-bold">
                    #023625
                  </div>
                  <div className="flex-1 py-1.5 bg-[#B68A35] text-white text-[10px] font-mono text-center rounded font-bold">
                    #B68A35
                  </div>
                </div>
              </div>

              <div className="p-5 border border-border rounded-xl bg-mist/30 text-center space-y-3 flex flex-col items-center justify-between">
                <div className="w-full h-16 rounded-xl bg-white border border-border overflow-hidden p-0.5 shadow-2xs flex items-center justify-center">
                  <img 
                    src={trainingHeroPhoto} 
                    alt="Training Hero" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h6 className="font-serif font-bold text-sm text-primary">Training Hero Photo</h6>
                  <p className="text-[11px] text-ash mt-1">&ldquo;Training that builds real competence&rdquo; visual.</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('content');
                      setTimeout(() => {
                        const el = document.getElementById('cms-training-hero-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full py-2 bg-[#023625] hover:bg-[#034d35] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Edit3 size={13} className="text-[#B68A35]" />
                    <span>Edit / Replace in CMS</span>
                  </button>
                  {onOpenFaviconModal && (
                    <button
                      type="button"
                      onClick={onOpenFaviconModal}
                      className="w-full py-1.5 border border-border hover:border-primary text-charcoal hover:text-primary text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles size={11} className="text-[#B68A35]" />
                      <span>Branding Studio</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Official Emblem Card */}
              <div className="p-5 border border-border rounded-xl bg-mist/30 text-center space-y-3 flex flex-col items-center justify-between">
                <div className="w-full h-16 rounded-xl bg-white border border-border flex items-center justify-center p-2 shadow-2xs">
                  <img src={officialEmblem} alt="Official Emblem" className="max-h-12 object-contain" />
                </div>
                <div>
                  <h6 className="font-serif font-bold text-sm text-primary">Official YITZAK Emblem</h6>
                  <p className="text-[11px] text-ash mt-1">Institutional shield crest for favicon, web mark, &amp; heraldry.</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="grid grid-cols-2 gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => downloadFileFromUrl(officialEmblem, 'YITZAK-official-emblem.png')}
                      className="py-1.5 border border-border hover:border-primary text-charcoal hover:text-primary text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span>PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSvgFile(getShieldSvgString('#023625'), 'YITZAK-official-emblem.svg')}
                      className="py-1.5 border border-border hover:border-primary text-charcoal hover:text-primary text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span>SVG</span>
                    </button>
                  </div>
                  {onOpenFaviconModal && (
                    <button
                      type="button"
                      onClick={onOpenFaviconModal}
                      className="w-full py-1.5 bg-[#023625] hover:bg-[#034d35] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Sparkles size={11} className="text-[#B68A35]" />
                      <span>Change in Studio</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Accreditation Seal Card */}
              <div className="p-5 border border-border rounded-xl bg-mist/30 text-center space-y-3 flex flex-col items-center justify-between">
                <div className="w-full h-16 rounded-xl bg-[#023625] border border-[#034d35] flex items-center justify-center p-2 shadow-2xs">
                  <img src={accreditationSeal} alt="Accreditation Seal" className="max-h-13 object-contain drop-shadow-xs" />
                </div>
                <div>
                  <h6 className="font-serif font-bold text-sm text-primary">Accreditation &amp; Advisory Seal</h6>
                  <p className="text-[11px] text-ash mt-1">Executive certified gold insignia for certificates &amp; badges.</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <div className="grid grid-cols-2 gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => downloadFileFromUrl(accreditationSeal, 'YITZAK-accreditation-seal.png')}
                      className="py-1.5 border border-border hover:border-primary text-charcoal hover:text-primary text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span>PNG</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSvgFile(getAccreditationSealSvgString(), 'YITZAK-accreditation-seal.svg')}
                      className="py-1.5 border border-border hover:border-primary text-charcoal hover:text-primary text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download size={11} />
                      <span>SVG</span>
                    </button>
                  </div>
                  {onOpenFaviconModal && (
                    <button
                      type="button"
                      onClick={onOpenFaviconModal}
                      className="w-full py-1.5 bg-[#023625] hover:bg-[#034d35] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Sparkles size={11} className="text-[#B68A35]" />
                      <span>Change in Studio</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STAFF ACCESS & WHITELIST */}
      {activeTab === 'whitelist' && (
        <div className="space-y-6 animate-fade-in">
          {/* Administrator Password & Credentials Panel */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#023625]/10 text-[#023625] flex items-center justify-center shrink-0">
                  <Lock size={20} className="text-[#B68A35]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-primary">Administrator Authentication &amp; Password</h4>
                  <p className="text-xs text-ash mt-0.5">Manage portal credentials for Christina Gumpo and authorized institutional administrators (cgumpo@yitzak.co.za / christinavonnidigital@gmail.com)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="px-4 py-2 bg-[#023625] hover:bg-[#034d35] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound size={14} className="text-[#B68A35]" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-mist/50 rounded-xl border border-border/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ash font-bold block mb-1">Status</span>
                <div className="flex items-center gap-2">
                  {isDefaultPassword ? (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-md flex items-center gap-1">
                      <AlertCircle size={13} className="text-amber-600" />
                      Default (123456)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-md flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Custom Secure Password
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-mist/50 rounded-xl border border-border/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ash font-bold block mb-1">Last Updated</span>
                <span className="font-semibold text-slate-800">
                  {passwordLastUpdated 
                    ? new Date(passwordLastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Initial Deployment (Default)'}
                </span>
              </div>

              <div className="p-4 bg-mist/50 rounded-xl border border-border/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-ash font-bold block mb-1">Access Method</span>
                <span className="text-slate-700 leading-relaxed block">
                  Password Login + Real-Time 6-Digit Email Code Fallback
                </span>
              </div>
            </div>
          </div>

          <WhitelistManager />
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userEmail="cgumpo@yitzak.co.za"
        onPasswordChanged={() => {
          setIsDefaultPassword(false);
          setPasswordLastUpdated(new Date().toISOString());
        }}
      />
    </div>
  );
}
