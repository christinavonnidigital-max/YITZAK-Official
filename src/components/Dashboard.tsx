import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, LogOut, Trash2, CalendarDays, Plus, User as UserIcon, Loader2, RefreshCw, Sparkles, Check, X, ShieldAlert } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, logout, getAccessToken, OperationType, handleFirestoreError } from '../lib/firebase';
import { Booking } from '../types';
import AdministrativeView from './AdministrativeView';

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

  const isAdminUser = Boolean(
    currentUser.email && (
      currentUser.email.toLowerCase() === 'cgumpo@yitzak.co.za' ||
      currentUser.email === 'admin@yitzak.co.za' || 
      currentUser.email.endsWith('@yitzak.co.za') ||
      currentUser.email.toLowerCase() === 'christinagumpo@gmail.com'
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

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const isGuest = currentUser?.uid?.startsWith('guest_') || currentUser?.isAnonymous;
      let list: Booking[] = [];

      if (isGuest) {
        const localBookings = JSON.parse(localStorage.getItem('yitzak_guest_bookings') || '[]');
        list = localBookings.filter((b: any) => b.userId === currentUser.uid);
      } else {
        const bookingsCol = collection(db, 'bookings');
        let q;
        if (isAdminUser) {
          q = query(bookingsCol);
        } else {
          // Fetch user bookings without orderBy to avoid composite index error on custom fields
          q = query(bookingsCol, where('userId', '==', currentUser.uid));
        }

        const snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...(docSnap.data() as any) } as Booking);
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
      }

      setBookings(list);

      // Fetch referrals as well
      let refsList: any[] = [];
      const localRefs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
      if (!isGuest) {
        try {
          const refCol = collection(db, 'referral_clicks');
          let qRefs;
          if (isAdminUser) {
            qRefs = query(refCol);
          } else {
            qRefs = query(refCol, where('userId', '==', currentUser.uid));
          }
          const refSnapshot = await getDocs(qRefs);
          refSnapshot.forEach(docSnap => {
            refsList.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });

          // Merge local clicks belonging to this user
          const localUserRefs = localRefs.filter((r: any) => r.userId === currentUser.uid);
          localUserRefs.forEach((lr: any) => {
            if (!refsList.some(r => r.id === lr.id)) {
              refsList.push(lr);
            }
          });
        } catch (refErr) {
          console.warn('Could not load referrals from DB, fallback to localStorage:', refErr);
          refsList = localRefs.filter((r: any) => isAdminUser || r.userId === currentUser.uid);
        }
      } else {
        refsList = localRefs.filter((r: any) => r.userId === currentUser.uid);
      }

      // Sort by creation date descending
      refsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReferrals(refsList);
    } catch (err: any) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.LIST, 'bookings');
      } catch (firestoreErr: any) {
        setError(`Failed to retrieve scheduled bookings: ${firestoreErr.message}`);
      }
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
      const isGuest = currentUser?.uid?.startsWith('guest_') || currentUser?.isAnonymous;

      if (isGuest) {
        const localBookings = JSON.parse(localStorage.getItem('yitzak_guest_bookings') || '[]');
        const updated = localBookings.map((b: any) => {
          if (b.id === booking.id) {
            return { ...b, status: 'cancelled', updatedAt: new Date().toISOString() };
          }
          return b;
        });
        localStorage.setItem('yitzak_guest_bookings', JSON.stringify(updated));
        fetchBookings();
      } else {
        const accessToken = await getAccessToken();
        
        // Step 1: Cancel Google Calendar Event if it exists
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
            console.error('Failed to delete Google Calendar Event, proceeding with database cancellation:', calErr);
          }
        }

        // Step 2: Update Firestore status to 'cancelled' (Durable cloud state)
        await updateDoc(doc(db, 'bookings', booking.id), {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        });
        fetchBookings();
      }
    } catch (err: any) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${booking.id}`);
      } catch (firestoreErr: any) {
        setError(`Failed to cancel booking: ${firestoreErr.message}`);
      }
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
    <div id="client_dashboard_section" className="bg-white border border-border p-8 md:p-16 space-y-8">
      {/* Dashboard Top Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
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
          <div>
            <h4 className="font-headline-md text-primary text-md font-bold">{currentUser.displayName}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-body-std text-xs text-ash">{currentUser.email}</span>
              {isAdminUser && (
                <span className="bg-secondary/15 text-secondary text-[9px] font-mono font-bold uppercase px-2 py-0.5 tracking-wider flex items-center gap-0.5">
                  <ShieldAlert size={10} />
                  Administrator
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            className="p-2 text-ash hover:text-primary border border-border hover:border-secondary transition-colors"
            title="Refresh bookings"
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 border border-border hover:border-error text-charcoal hover:text-error px-4 py-4 font-label-btn text-[12px] uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut size={14} />
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
