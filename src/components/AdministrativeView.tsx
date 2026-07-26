import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle, 
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
  ClipboardList
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, getAccessToken, OperationType, handleFirestoreError } from '../lib/firebase';
import { Booking } from '../types';
import WhitelistManager from './WhitelistManager';
import NewsletterSubscribersManager from './NewsletterSubscribersManager';

interface AdministrativeViewProps {
  bookings: Booking[];
  referrals?: any[];
  loading: boolean;
  onRefresh: () => void;
  onOpenBooking: () => void;
}

export default function AdministrativeView({ 
  bookings, 
  referrals = [], 
  loading, 
  onRefresh, 
  onOpenBooking 
}: AdministrativeViewProps) {
  const [activeTab, setActiveTab] = useState<'consultations' | 'referrals' | 'whitelist' | 'newsletter'>('consultations');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [referralStatusFilter, setReferralStatusFilter] = useState<'all' | 'needs_coordination' | 'click_logged' | 'coordination_complete' | 'cancelled'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
  const refPendingCount = referrals.filter(r => r.status === 'needs_coordination').length;
  const refCompleteCount = referrals.filter(r => r.status === 'coordination_complete').length;
  const refClickOnlyCount = referrals.filter(r => r.status === 'click_logged').length;

  // Filter bookings based on controls
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName.toLowerCase().includes(search.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      booking.pillar.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter referrals based on controls
  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch = 
      ref.userName.toLowerCase().includes(search.toLowerCase()) ||
      ref.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      ref.schemeName.toLowerCase().includes(search.toLowerCase()) ||
      (ref.referralCode && ref.referralCode.toLowerCase().includes(search.toLowerCase())) ||
      (ref.userCompany && ref.userCompany.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = referralStatusFilter === 'all' || ref.status === referralStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (bookingId: string, currentEventId: string | undefined, newStatus: 'confirmed' | 'cancelled') => {
    setUpdatingId(bookingId);

    try {
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

  const handleUpdateReferralStatus = async (referralId: string, newStatus: string) => {
    setUpdatingId(referralId);
    try {
      await updateDoc(doc(db, 'referral_clicks', referralId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Update local storage representation
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
      alert(`Could not update referral status. Proceeding to update local storage view.`);
      
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
      {/* Administrative Info alert banner */}
      <div className="bg-primary/5 border-l-4 border-primary p-4 flex items-start gap-4 rounded-r-xl">
        <ShieldAlert className="text-primary flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h5 className="font-serif text-sm text-primary font-bold">YITZAK Root Administrative Console</h5>
          <p className="text-xs text-ash mt-1">
            Viewing complete global business database. Access level: <strong>Root Administrator (christinagumpo@gmail.com)</strong>.
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => {
            setActiveTab('consultations');
            setSearch('');
          }}
          className={`flex-1 md:flex-initial px-6 py-4 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'consultations' 
              ? 'border-primary text-primary bg-primary/[0.02]' 
              : 'border-transparent text-ash hover:text-primary hover:bg-mist'
          }`}
        >
          <ClipboardList size={14} />
          <span>Consultations ({totalRequests})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('referrals');
            setSearch('');
          }}
          className={`flex-1 md:flex-initial px-6 py-4 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'referrals' 
              ? 'border-primary text-primary bg-primary/[0.02]' 
              : 'border-transparent text-ash hover:text-primary hover:bg-mist'
          }`}
        >
          <Award size={14} />
          <span>Affiliate Outbound Referrals ({totalReferrals})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('whitelist');
            setSearch('');
          }}
          className={`flex-1 md:flex-initial px-6 py-4 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'whitelist' 
              ? 'border-primary text-primary bg-primary/[0.02]' 
              : 'border-transparent text-ash hover:text-primary hover:bg-mist'
          }`}
        >
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Guest Whitelist</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('newsletter');
            setSearch('');
          }}
          className={`flex-1 md:flex-initial px-6 py-4 text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'newsletter' 
              ? 'border-primary text-primary bg-primary/[0.02]' 
              : 'border-transparent text-ash hover:text-primary hover:bg-mist'
          }`}
        >
          <Mail size={14} className="text-[#B68A35]" />
          <span>Newsletter Subscribers</span>
        </button>
      </div>

      {activeTab === 'whitelist' ? (
        <WhitelistManager />
      ) : activeTab === 'newsletter' ? (
        <NewsletterSubscribersManager />
      ) : activeTab === 'consultations' ? (
        <>
          {/* Corporate Dashboard Statistics panel for Bookings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-border bg-surface p-4">
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-ash uppercase tracking-widest block">Total Bookings</span>
              <span className="font-serif text-primary text-xl font-bold mt-2 block">{totalRequests}</span>
            </div>
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-secondary uppercase tracking-widest block">Pending Review</span>
              <span className="font-serif text-secondary text-xl font-bold mt-2 block">{pendingCount}</span>
            </div>
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest block">Approved Sessions</span>
              <span className="font-serif text-primary text-xl font-bold mt-2 block">{confirmedCount}</span>
            </div>
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-ash uppercase tracking-widest block">Cancelled Cases</span>
              <span className="font-serif text-ash text-xl font-bold mt-2 block">{cancelledCount}</span>
            </div>
          </div>

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
                  className={`px-3 py-2 border text-[10px] uppercase tracking-wider font-bold transition-all rounded-lg shrink-0 ${statusFilter === f ? 'border-primary bg-primary text-white' : 'border-border text-charcoal hover:border-secondary bg-white'}`}
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
                <p className="text-xs text-ash">Retrieving secure records...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="border border-dashed border-border p-16 text-center bg-surface rounded-xl">
                <FileText className="mx-auto text-ash mb-2" size={24} />
                <p className="text-xs text-primary font-bold">No consultation records matching query found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredBookings.map(booking => (
                  <div
                    key={booking.id}
                    className={`border p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${booking.status === 'cancelled' ? 'border-border bg-surface opacity-60' : 'border-border bg-white shadow-sm hover:shadow-md'}`}
                  >
                    <div className="space-y-2.5 flex-1 w-full">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-mono uppercase px-2.5 py-0.5 font-bold tracking-wider rounded ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary' : booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-[#B68A35]/15 text-[#B68A35]'}`}>
                          {booking.status}
                        </span>
                        <span className="text-[10px] text-ash font-mono">{booking.id}</span>
                      </div>

                      <h6 className="font-serif text-sm text-primary font-bold">{booking.pillar}</h6>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-charcoal">
                        <div className="flex items-center gap-2">
                          <UserIcon size={13} className="text-ash shrink-0" />
                          <span className="font-bold">{booking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-ash shrink-0" />
                          <span className="truncate">{booking.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-ash shrink-0" />
                          <span className="font-medium">{booking.date} — {formatTimeSlotSAST(booking.timeSlot)}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-xs text-ash bg-[#F9F9F9] p-3 border border-border/80 rounded-lg">
                          <strong>Client Memo:</strong> "{booking.notes}"
                        </p>
                      )}
                    </div>

                    {/* Status Update administrative overrides */}
                    <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 shrink-0">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id!, booking.calendarEventId, 'confirmed')}
                            disabled={updatingId === booking.id}
                            className="flex-1 md:flex-initial bg-primary hover:bg-[#B68A35] text-white px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {updatingId === booking.id ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(booking.id!, booking.calendarEventId, 'cancelled')}
                            disabled={updatingId === booking.id}
                            className="flex-1 md:flex-initial border border-border hover:border-red-600 text-charcoal hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
                          className="w-full md:w-auto border border-border hover:border-red-600 hover:bg-red-50 text-charcoal hover:text-red-600 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {updatingId === booking.id ? <Loader2 className="animate-spin" size={12} /> : <XCircle size={12} />}
                          <span>Cancel Consultation</span>
                        </button>
                      )}

                      {booking.status === 'cancelled' && (
                        <span className="text-[10px] font-mono font-bold text-ash uppercase p-2 block w-full text-center md:text-right">No Actions Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Corporate Dashboard Statistics panel for Referrals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-border bg-surface p-4">
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-ash uppercase tracking-widest block">Total Referrals</span>
              <span className="font-serif text-primary text-xl font-bold mt-2 block">{totalReferrals}</span>
            </div>
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-[#B68A35] uppercase tracking-widest block">Manual Followup Req.</span>
              <span className="font-serif text-[#B68A35] text-xl font-bold mt-2 block">{refPendingCount}</span>
            </div>
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest block">Registered with Partner</span>
              <span className="font-serif text-primary text-xl font-bold mt-2 block">{refCompleteCount}</span>
            </div>
            <div className="bg-white p-4 border border-border text-center">
              <span className="text-[9px] font-mono font-bold text-ash uppercase tracking-widest block">Logged Link Clicks</span>
              <span className="font-serif text-ash text-xl font-bold mt-2 block">{refClickOnlyCount}</span>
            </div>
          </div>

          {/* Referral filters and search bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-border pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" size={16} />
              <input
                type="text"
                placeholder="Search referrals by client name, email, company, code, or course scheme..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border text-charcoal text-xs outline-none focus:border-primary rounded-lg bg-white"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0">
              {[
                { label: 'All', value: 'all' },
                { label: 'Needs Followup', value: 'needs_coordination' },
                { label: 'Registered', value: 'coordination_complete' },
                { label: 'Logged Clicks', value: 'click_logged' },
                { label: 'Deals Cancelled', value: 'cancelled' }
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setReferralStatusFilter(f.value as any)}
                  className={`px-3 py-2 border text-[10px] uppercase tracking-wider font-bold transition-all rounded-lg shrink-0 ${referralStatusFilter === f.value ? 'border-primary bg-primary text-white' : 'border-border text-charcoal hover:border-secondary bg-white'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Referrals table list */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-2">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="text-xs text-ash">Retrieving tracked referrals...</p>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="border border-dashed border-border p-16 text-center bg-surface rounded-xl">
                <Award className="mx-auto text-ash mb-2" size={24} />
                <p className="text-xs text-primary font-bold">No outbound affiliate referrals logged yet</p>
                <p className="text-[11px] text-ash max-w-md mx-auto mt-1">
                  Referral logs will populate as clients click on FoodChain ID Academy or certification schemes from their dashboard or the training pages.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredReferrals.map((ref: any) => (
                  <div
                    key={ref.id}
                    className={`border p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                      ref.status === 'coordination_complete' 
                        ? 'border-[#023625]/20 bg-emerald-50/10' 
                        : ref.status === 'cancelled' 
                          ? 'border-border bg-surface opacity-60' 
                          : 'border-border bg-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-3 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`text-[9px] font-mono uppercase px-2.5 py-0.5 font-bold tracking-wider rounded ${
                          ref.status === 'coordination_complete' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : ref.status === 'needs_coordination' 
                              ? 'bg-amber-100 text-[#B68A35] animate-pulse' 
                              : ref.status === 'cancelled' 
                                ? 'bg-red-50 text-red-600' 
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                          {ref.status === 'needs_coordination' ? 'Manual Followup Req' : ref.status === 'coordination_complete' ? 'Registered & Secured' : ref.status === 'click_logged' ? 'Logged Click Only' : ref.status}
                        </span>
                        
                        <div className="text-xs font-mono font-bold text-[#023625] bg-[#023625]/5 px-2.5 py-0.5 rounded border border-[#023625]/10 flex items-center gap-1">
                          <Sparkles size={10} className="text-[#B68A35]" />
                          <span>Code: {ref.referralCode}</span>
                        </div>
                        
                        <span className="text-[10px] text-ash font-mono">{ref.id}</span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2">
                        <h6 className="font-serif text-sm text-primary font-bold">{ref.schemeName}</h6>
                        <span className="text-[11px] text-ash italic">({new Date(ref.createdAt).toLocaleString()})</span>
                      </div>

                      {/* Client profile card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-charcoal bg-[#F9F9F9] p-3 border border-border/80 rounded-xl">
                        <div className="flex items-center gap-2">
                          <UserIcon size={13} className="text-ash shrink-0" />
                          <div>
                            <span className="text-[9px] uppercase font-mono block text-ash">Client Name</span>
                            <span className="font-bold">{ref.userName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-ash shrink-0" />
                          <div>
                            <span className="text-[9px] uppercase font-mono block text-ash">Email</span>
                            <span className="font-medium truncate block max-w-[150px]">{ref.userEmail}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building size={13} className="text-ash shrink-0" />
                          <div>
                            <span className="text-[9px] uppercase font-mono block text-ash">Company</span>
                            <span className="font-medium">{ref.userCompany || 'Not specified'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-ash shrink-0" />
                          <div>
                            <span className="text-[9px] uppercase font-mono block text-ash">Phone</span>
                            <span className="font-medium font-mono">{ref.userPhone || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Direct target link tracker */}
                      <div className="text-[11px] text-ash flex items-center gap-1 truncate max-w-2xl">
                        <span className="font-bold">Affiliate destination:</span>
                        <a 
                          href={ref.trackingUrl || ref.targetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#B68A35] hover:underline flex items-center gap-0.5 truncate"
                        >
                          {ref.targetUrl} <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    {/* Referral Deal Coordination Management CRM overrides */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 shrink-0">
                      {ref.status === 'needs_coordination' && (
                        <>
                          <button
                            onClick={() => handleUpdateReferralStatus(ref.id, 'coordination_complete')}
                            disabled={updatingId === ref.id}
                            className="bg-primary hover:bg-[#B68A35] text-white px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {updatingId === ref.id ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                            <span>Mark as Deal Secured</span>
                          </button>

                          <button
                            onClick={() => handleUpdateReferralStatus(ref.id, 'cancelled')}
                            disabled={updatingId === ref.id}
                            className="border border-border hover:border-red-600 text-charcoal hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            {updatingId === ref.id ? <Loader2 className="animate-spin" size={12} /> : <XCircle size={12} />}
                            <span>Decline/Lost</span>
                          </button>
                        </>
                      )}

                      {ref.status === 'click_logged' && (
                        <button
                          onClick={() => handleUpdateReferralStatus(ref.id, 'needs_coordination')}
                          disabled={updatingId === ref.id}
                          className="w-full md:w-auto border border-[#B68A35]/30 hover:border-[#B68A35] bg-[#B68A35]/5 text-primary hover:text-white hover:bg-[#B68A35] px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <span>Convert to Manual Followup</span>
                        </button>
                      )}

                      {ref.status === 'coordination_complete' && (
                        <div className="flex flex-col items-end gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 font-bold">
                          <span>Deal secured & tracked!</span>
                          <button
                            onClick={() => handleUpdateReferralStatus(ref.id, 'needs_coordination')}
                            className="text-[9px] text-[#B68A35] hover:underline uppercase block tracking-wider mt-0.5 cursor-pointer"
                          >
                            Re-open coordination
                          </button>
                        </div>
                      )}

                      {ref.status === 'cancelled' && (
                        <button
                          onClick={() => handleUpdateReferralStatus(ref.id, 'needs_coordination')}
                          className="text-[10px] text-[#B68A35] hover:underline font-bold uppercase block tracking-wider text-center cursor-pointer"
                        >
                          Re-open lead
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
