import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, LogOut, Trash2, CalendarDays, Plus, User as UserIcon, Loader2, RefreshCw, Sparkles, Check, X, ShieldAlert } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, logout, getAccessToken, OperationType, handleFirestoreError } from '../lib/firebase';
import { Booking } from '../types';
import { toIsoDate } from '../utils/time';
import AdministrativeView from './AdministrativeView';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onOpenBooking: () => void;
  refreshTrigger: number;
}

export default function Dashboard({ currentUser, onLogout, onOpenBooking, refreshTrigger }: DashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const isAdminUser = currentUser.email === 'christinagumpo@gmail.com';

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
            const data = docSnap.data() as any;
            // Cloud rows use serverTimestamp(); normalize createdAt to an ISO
            // string so the descending sort below and AdministrativeView's
            // `new Date(ref.createdAt)` render a real date rather than NaN/Invalid Date.
            refsList.push({ id: docSnap.id, ...data, createdAt: toIsoDate(data.createdAt) });
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
            onClick={logout}
            className="flex items-center gap-2 border border-border hover:border-error text-charcoal hover:text-error px-4 py-4 font-label-btn text-[12px] uppercase tracking-wider transition-all"
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
        />
      ) : (
        /* Client Personal Dashboard */
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h5 className="font-headline-md text-[18px] text-primary flex items-center gap-2">
              <CalendarDays className="text-secondary" size={20} />
              Your Consulting Engagements
            </h5>
            
            <button
              onClick={onOpenBooking}
              className="bg-primary text-on-primary hover:bg-primary-container px-4 py-4 font-label-btn text-xs uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus size={14} />
              <span>New Request</span>
            </button>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-4 flex items-start gap-2 text-xs">
              <ShieldAlert className="text-error flex-shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="font-body-std text-xs text-ash">Retrieving secure schedule...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="border border-dashed border-border p-32 text-center space-y-4 bg-surface">
              <CalendarDays className="mx-auto text-ash" size={32} />
              <div>
                <p className="font-body-std text-sm text-primary font-bold">No consultations scheduled</p>
                <p className="font-body-std text-xs text-ash mt-2 max-w-sm mx-auto">
                  Schedule your corporate consultation with an expert. Complete calendar synchronization will occur automatically.
                </p>
              </div>
              <button
                onClick={onOpenBooking}
                className="bg-secondary-container text-on-secondary-container hover:bg-gold-hover hover:text-white px-16 py-4 font-label-btn text-xs uppercase tracking-widest transition-all"
              >
                Schedule First Consultation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  className={`border p-4 flex flex-col justify-between transition-all ${booking.status === 'cancelled' ? 'border-border bg-surface opacity-60' : 'border-border bg-white hover:border-secondary shadow-sm'}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-label-kicker text-[10px] text-secondary uppercase tracking-widest block">Stream</span>
                        <h6 className="font-headline-md text-sm text-primary font-bold">{booking.pillar}</h6>
                      </div>
                      <span className={`text-[9px] font-mono uppercase px-4 py-0.5 font-bold tracking-wider ${booking.status === 'confirmed' ? 'bg-primary-fixed text-primary' : booking.status === 'cancelled' ? 'bg-error-container text-on-error-container' : 'bg-secondary-fixed text-on-secondary-container'}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-b border-border py-2">
                      <div className="flex items-center gap-2 text-xs text-charcoal">
                        <Calendar size={14} className="text-ash" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-charcoal">
                        <Clock size={14} className="text-ash mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold">{formatTimeSlotSAST(booking.timeSlot)}</span>
                          <span className="text-ash text-[9px] font-mono">({booking.timeSlot} UTC)</span>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="font-body-std text-xs text-ash line-clamp-2 italic">
                        "{booking.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center pt-2 border-t border-border/40">
                    <div className="flex items-center gap-0.5 text-[10px] text-ash font-mono">
                      <Sparkles size={10} className="text-secondary" />
                      <span>Google Sync Enabled</span>
                    </div>

                    {booking.status !== 'cancelled' && (
                      confirmCancelId === booking.id ? (
                        <div className="flex gap-1 items-center">
                          <span className="text-[9px] font-bold text-error mr-1">Confirm?</span>
                          <button
                            onClick={() => {
                              handleCancelBooking(booking);
                              setConfirmCancelId(null);
                            }}
                            className="bg-error text-white hover:bg-red-700 px-2 py-1 text-[9px] font-mono font-bold uppercase transition-all"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="bg-gray-100 hover:bg-gray-200 border border-border text-charcoal px-2 py-1 text-[9px] font-mono font-bold uppercase transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelId(booking.id || null)}
                          disabled={cancellingId === booking.id}
                          className="text-ash hover:text-error hover:bg-error-container/10 p-2 transition-colors flex items-center gap-1 text-[11px] font-bold font-mono"
                          title="Cancel Engagement"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="animate-spin text-error" size={12} />
                          ) : (
                            <>
                              <X size={12} />
                              <span>Cancel</span>
                            </>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
