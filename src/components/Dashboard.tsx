import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, LogOut, Trash2, CalendarDays, Plus, User as UserIcon, Loader2, RefreshCw, Sparkles, Check, X, ShieldAlert, Cloud, CloudOff } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth, googleSignIn, logout, getAccessToken, OperationType, handleFirestoreError } from '../lib/firebase';
import { Booking } from '../types';
import AdministrativeView from './AdministrativeView';
import { dispatchBookingCancellationEmail } from '../lib/emailService';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onOpenBooking: () => void;
  refreshTrigger: number;
  onOpenFaviconModal?: () => void;
}

export default function Dashboard({ currentUser, onLogout, onOpenBooking, refreshTrigger, onOpenFaviconModal }: DashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [isCloudConnecting, setIsCloudConnecting] = useState(false);

  const isAdminUser = Boolean(
    currentUser.email && (
      currentUser.email.toLowerCase() === 'cgumpo@yitzak.co.za' ||
      currentUser.email.toLowerCase() === 'admin@yitzak.co.za' || 
      currentUser.email.toLowerCase().endsWith('@yitzak.co.za') ||
      currentUser.email.toLowerCase() === 'christinagumpo@gmail.com' ||
      currentUser.email.toLowerCase() === 'christinavonnidigital@gmail.com'
    )
  );

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

  const handleConnectCloudSync = async () => {
    setIsCloudConnecting(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        await fetchBookings();
      }
    } catch (err: any) {
      console.warn('Google Cloud Auth link note:', err);
    } finally {
      setIsCloudConnecting(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const isFirebaseAuthUser = Boolean(auth.currentUser);
      let list: Booking[] = [];

      // 1. Load local consultation requests and guest bookings from storage
      const localConsultations: any[] = JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]');
      const localGuestBookings: any[] = JSON.parse(localStorage.getItem('yitzak_guest_bookings') || '[]');

      const normalizedLocalList: Booking[] = [
        ...localConsultations.map(c => ({
          id: c.id || c.bookingRef || `local_${Math.random()}`,
          userId: c.userId || currentUser.uid,
          userName: c.userName || c.clientName || 'Client',
          userEmail: c.userEmail || c.clientEmail || '',
          date: c.date || (c.createdAt ? String(c.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10)),
          timeSlot: c.timeSlot || '09:00 - 10:00',
          pillar: c.pillar || c.pillarTitle || 'Consulting & Advisory',
          notes: c.notes || '',
          status: c.status || 'pending',
          scheduledVia: c.scheduledVia || 'Direct Request',
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        } as Booking)),
        ...localGuestBookings.map(g => ({
          ...g,
          id: g.id || `guest_${Math.random()}`,
        } as Booking))
      ];

      // 2. If authenticated with Firebase Auth, safely fetch from Firestore cloud database
      if (isFirebaseAuthUser) {
        try {
          const bookingsCol = collection(db, 'bookings');
          let q;
          if (isAdminUser) {
            q = query(bookingsCol);
          } else {
            q = query(bookingsCol, where('userId', '==', auth.currentUser!.uid));
          }

          const snapshot = await getDocs(q);
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) } as Booking);
          });
        } catch (dbErr: any) {
          console.warn('Firestore cloud bookings sync note:', dbErr);
          // If not a permission rejection, report through error handler
          if (dbErr?.code !== 'permission-denied') {
            try {
              handleFirestoreError(dbErr, OperationType.LIST, 'bookings');
            } catch (fe) {
              console.warn('Handled firestore error:', fe);
            }
          }
        }
      }

      // 3. Merge local items that are not already present from Firestore
      normalizedLocalList.forEach(localItem => {
        const localEmail = (localItem?.userEmail || '').toLowerCase();
        const currentEmail = (currentUser?.email || '').toLowerCase();
        const alreadyExists = list.some(
          b => b.id === localItem.id ||
          (b.date === localItem.date && b.timeSlot === localItem.timeSlot && (b?.userEmail || '').toLowerCase() === localEmail)
        );
        if (!alreadyExists) {
          if (isAdminUser || localItem.userId === currentUser.uid || (currentEmail && localEmail === currentEmail)) {
            list.push(localItem);
          }
        }
      });

      // Sort in-memory to prevent missing composite index error
      list.sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA !== dateB) {
          return dateA.localeCompare(dateB);
        }
        const slotA = a.timeSlot || '';
        const slotB = b.timeSlot || '';
        return slotA.localeCompare(slotB);
      });

      setBookings(list);

      // 4. Fetch referrals as well
      let refsList: any[] = [];
      const localRefs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
      
      if (isFirebaseAuthUser) {
        try {
          const refCol = collection(db, 'referral_clicks');
          let qRefs;
          if (isAdminUser) {
            qRefs = query(refCol);
          } else {
            qRefs = query(refCol, where('userId', '==', auth.currentUser!.uid));
          }
          const refSnapshot = await getDocs(qRefs);
          refSnapshot.forEach(docSnap => {
            refsList.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
        } catch (refErr) {
          console.warn('Could not load referrals from DB, fallback to local cache:', refErr);
        }
      }

      // Merge local clicks
      localRefs.forEach((lr: any) => {
        if (!refsList.some(r => r.id === lr.id)) {
          if (isAdminUser || lr.userId === currentUser.uid) {
            refsList.push(lr);
          }
        }
      });

      // Sort by creation date descending
      refsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReferrals(refsList);
    } catch (err: any) {
      console.warn('fetchBookings handling:', err);
      setError(null); // Ensure fallback gracefully without blocking dashboard UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser, refreshTrigger]);

  const handleCancelBooking = async (booking: Booking) => {
    if (!booking.id) return;
    
    setCancellingId(booking.id);
    setError(null);

    try {
      const isFirebaseAuthUser = Boolean(auth.currentUser);

      // Update in local consultation requests
      const localConsultations = JSON.parse(localStorage.getItem('yitzak_consultation_requests') || '[]');
      const updatedConsultations = localConsultations.map((b: any) => {
        if (b.id === booking.id || b.bookingRef === booking.id) {
          return { ...b, status: 'cancelled', updatedAt: new Date().toISOString() };
        }
        return b;
      });
      localStorage.setItem('yitzak_consultation_requests', JSON.stringify(updatedConsultations));

      // Update in local guest bookings
      const localGuestBookings = JSON.parse(localStorage.getItem('yitzak_guest_bookings') || '[]');
      const updatedGuests = localGuestBookings.map((b: any) => {
        if (b.id === booking.id) {
          return { ...b, status: 'cancelled', updatedAt: new Date().toISOString() };
        }
        return b;
      });
      localStorage.setItem('yitzak_guest_bookings', JSON.stringify(updatedGuests));

      if (isFirebaseAuthUser) {
        const accessToken = await getAccessToken();
        
        // Cancel Google Calendar Event if it exists
        if (accessToken && booking.calendarEventId) {
          try {
            await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events/${booking.calendarEventId}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          } catch (calErr) {
            console.error('Failed to delete Google Calendar Event:', calErr);
          }
        }

        // Update Firestore status to 'cancelled'
        try {
          await updateDoc(doc(db, 'bookings', booking.id), {
            status: 'cancelled',
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn('Firestore cancel booking write note:', dbErr);
        }
      }

      // Dispatch Cancellation Notification Email to Client & Advisory Team
      if (booking.userEmail) {
        try {
          const accessToken = await getAccessToken().catch(() => null);
          await dispatchBookingCancellationEmail({
            to: booking.userEmail,
            recipientName: booking.userName || 'Valued Client',
            date: booking.date || 'Scheduled Date',
            timeSlot: booking.timeSlot || 'Scheduled Time',
            pillarName: booking.pillar || 'Professional Advisory & Compliance',
            notes: booking.notes
          }, accessToken);
        } catch (mailErr) {
          console.warn('Cancellation notification email dispatch note:', mailErr);
        }
      }

      await fetchBookings();
    } catch (err: any) {
      console.error(err);
      setError(`Failed to cancel booking: ${err.message || String(err)}`);
    } finally {
      setCancellingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    try {
      sessionStorage.removeItem('yitzak_portal_user');
      sessionStorage.removeItem('yitzak_portal_code');
      localStorage.removeItem('yitzak_portal_user');
    } catch (_) {}
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div id="client_dashboard_section" className="bg-white border border-border p-3.5 sm:p-6 md:p-12 lg:p-16 space-y-6 sm:space-y-8 rounded-xl sm:rounded-2xl shadow-xs">
      {/* Dashboard Top Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 border-b border-border pb-4 sm:pb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-primary/10 text-primary font-bold text-base sm:text-lg">
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt="Avatar" 
                loading="lazy"
                decoding="async"
                width={48}
                height={48}
                referrerPolicy="no-referrer" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span>{currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'G'}</span>
            )}
          </div>
          <div className="min-w-0 truncate">
            <h4 className="font-headline-md text-primary text-sm sm:text-base font-bold truncate">{currentUser.displayName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="font-body-std text-xs text-ash truncate">{currentUser.email}</span>
              {isAdminUser && (
                <span className="bg-secondary/15 text-secondary text-[9px] font-mono font-bold uppercase px-2 py-0.5 tracking-wider inline-flex items-center gap-0.5 shrink-0 rounded">
                  <ShieldAlert size={10} />
                  <span>Admin</span>
                </span>
              )}
              {auth.currentUser ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-semibold px-2 py-0.5 inline-flex items-center gap-1 shrink-0 rounded">
                  <Cloud size={10} className="text-emerald-600" />
                  <span>Cloud Sync Active</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectCloudSync}
                  disabled={isCloudConnecting}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[9px] font-mono font-semibold px-2 py-0.5 inline-flex items-center gap-1 shrink-0 rounded cursor-pointer transition-colors"
                  title="Click to connect Google account for real-time Cloud Firestore synchronization"
                >
                  {isCloudConnecting ? (
                    <Loader2 size={10} className="animate-spin text-amber-700" />
                  ) : (
                    <CloudOff size={10} className="text-amber-700" />
                  )}
                  <span>{isCloudConnecting ? 'Connecting...' : 'Connect Cloud Sync'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0 pt-1 sm:pt-0">
          <button
            onClick={fetchBookings}
            className="p-2 sm:p-2.5 text-ash hover:text-primary border border-border hover:border-secondary transition-colors rounded-lg cursor-pointer"
            title="Refresh bookings"
            aria-label="Refresh bookings"
          >
            <RefreshCw size={15} />
          </button>
          
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 border border-border hover:border-error text-charcoal hover:text-error px-3.5 py-2 font-label-btn text-xs uppercase tracking-wider transition-all cursor-pointer rounded-lg"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin specific dashboard overlay */}
      {isAdminUser ? (
        <AdministrativeView 
          bookings={bookings} 
          referrals={referrals}
          loading={loading} 
          onRefresh={fetchBookings} 
          onOpenBooking={onOpenBooking} 
          onOpenFaviconModal={onOpenFaviconModal}
        />
      ) : (
        /* Access Restricted message if logged in with non-admin account */
        <div className="border border-red-200 bg-red-50/50 p-12 text-center rounded-2xl space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-2">
            <h5 className="font-serif text-lg font-bold text-red-900">Administrative Access Required</h5>
            <p className="text-xs text-red-800 leading-relaxed">
              This console is strictly designated for YITZAK Content Management and Administration. Your current account ({currentUser.email}) does not hold administrative clearance.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-6 py-2.5 bg-primary text-white hover:bg-[#034d35] rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <LogOut size={14} />
              <span>Sign Out &amp; Switch Account</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
