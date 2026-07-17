import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, CheckCircle, XCircle, Clock, FileText, Calendar, Mail, User as UserIcon, Loader2 } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, getAccessToken, OperationType, handleFirestoreError } from '../lib/firebase';
import { Booking } from '../types';

interface AdministrativeViewProps {
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => void;
  onOpenBooking: () => void;
}

export default function AdministrativeView({ bookings, loading, onRefresh, onOpenBooking }: AdministrativeViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  // Statistics calculation
  const totalRequests = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  // Filter bookings based on controls
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName.toLowerCase().includes(search.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      booking.pillar.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (bookingId: string, currentEventId: string | undefined, newStatus: 'confirmed' | 'cancelled') => {
    setUpdatingId(bookingId);

    try {
      // If cancelling, try to delete calendar event if it exists
      if (newStatus === 'cancelled' && currentEventId) {
        const accessToken = await getAccessToken();
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

      // Update Firestore document status
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      onRefresh();
    } catch (err: any) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
      } catch (firestoreErr: any) {
        alert(`Administrative override failed: ${firestoreErr.message}`);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Administrative Info alert banner */}
      <div className="bg-primary/5 border-l-4 border-primary p-4 flex items-start gap-4">
        <ShieldAlert className="text-primary flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h5 className="font-headline-md text-sm text-primary font-bold">Administrative Dashboard</h5>
          <p className="font-body-std text-xs text-ash mt-2">
            Viewing complete global consulting database. Access level: <strong>Root Administrator (Verified christinagumpo@gmail.com)</strong>.
          </p>
        </div>
      </div>

      {/* Corporate Dashboard Statistics panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-border bg-surface p-4">
        <div className="bg-white p-4 border border-border text-center">
          <span className="font-label-kicker text-[10px] text-ash uppercase tracking-widest block">Total Bookings</span>
          <span className="font-headline-lg text-primary text-xl font-bold mt-2 block">{totalRequests}</span>
        </div>
        <div className="bg-white p-4 border border-border text-center">
          <span className="font-label-kicker text-[10px] text-secondary uppercase tracking-widest block">Pending Review</span>
          <span className="font-headline-lg text-secondary text-xl font-bold mt-2 block">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 border border-border text-center">
          <span className="font-label-kicker text-[10px] text-primary uppercase tracking-widest block">Approved Sessions</span>
          <span className="font-headline-lg text-primary text-xl font-bold mt-2 block">{confirmedCount}</span>
        </div>
        <div className="bg-white p-4 border border-border text-center">
          <span className="font-label-kicker text-[10px] text-ash uppercase tracking-widest block">Cancelled Cases</span>
          <span className="font-headline-lg text-ash text-xl font-bold mt-2 block">{cancelledCount}</span>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" size={16} />
          <input
            type="text"
            placeholder="Search by client, email, or pillar stream..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-4 py-4 border border-border text-charcoal font-body-std text-xs focus:border-primary outline-none"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-4 border font-label-btn text-[11px] uppercase tracking-wider transition-all ${statusFilter === f ? 'border-primary bg-primary text-on-primary font-bold' : 'border-border text-charcoal hover:border-secondary bg-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <Loader2 className="animate-spin text-primary" size={24} />
            <p className="font-body-std text-xs text-ash">Retrieving secure records...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="border border-dashed border-border p-16 text-center bg-surface">
            <FileText className="mx-auto text-ash mb-2" size={24} />
            <p className="font-body-std text-xs text-primary font-bold">No records matching query found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map(booking => (
              <div
                key={booking.id}
                className={`border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${booking.status === 'cancelled' ? 'border-border bg-surface opacity-60' : 'border-border bg-white shadow-sm'}`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-4">
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 font-bold tracking-wider ${booking.status === 'confirmed' ? 'bg-primary-fixed text-primary' : booking.status === 'cancelled' ? 'bg-error-container text-on-error-container' : 'bg-secondary-fixed text-on-secondary-container'}`}>
                      {booking.status}
                    </span>
                    <span className="font-body-std text-[11px] text-ash font-mono">{booking.id}</span>
                  </div>

                  <h6 className="font-headline-md text-sm text-primary font-bold">{booking.pillar}</h6>

                  <div className="flex flex-wrap gap-8 text-xs text-charcoal">
                    <div className="flex items-center gap-2">
                      <UserIcon size={12} className="text-ash" />
                      <span className="font-bold">{booking.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-ash" />
                      <span>{booking.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-ash" />
                      <span className="font-bold">{booking.date} — {formatTimeSlotSAST(booking.timeSlot)} <span className="font-normal text-ash font-mono text-[10px]">({booking.timeSlot} UTC)</span></span>
                    </div>
                  </div>

                  {booking.notes && (
                    <p className="font-body-std text-xs text-ash bg-surface p-2 border border-border mt-2">
                      <strong>Client Note:</strong> "{booking.notes}"
                    </p>
                  )}
                </div>

                {/* Status Update administrative overrides */}
                <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id!, booking.calendarEventId, 'confirmed')}
                        disabled={updatingId === booking.id}
                        className="flex-1 md:flex-initial bg-primary text-on-primary hover:bg-primary-container px-4 py-4 font-label-btn text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {updatingId === booking.id ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(booking.id!, booking.calendarEventId, 'cancelled')}
                        disabled={updatingId === booking.id}
                        className="flex-1 md:flex-initial border border-border hover:border-error text-charcoal hover:text-error px-4 py-4 font-label-btn text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {updatingId === booking.id ? <Loader2 className="animate-spin" size={12} /> : <XCircle size={12} />}
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id!, booking.calendarEventId, 'cancelled')}
                      disabled={updatingId === booking.id}
                      className="w-full md:w-auto border border-border hover:border-error text-charcoal hover:text-error px-4 py-4 font-label-btn text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {updatingId === booking.id ? <Loader2 className="animate-spin" size={12} /> : <XCircle size={12} />}
                      <span>Revoke & Cancel</span>
                    </button>
                  )}

                  {booking.status === 'cancelled' && (
                    <span className="text-[11px] font-mono font-bold text-ash uppercase p-2 block w-full text-center md:text-right">No actions available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
