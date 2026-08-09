import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, ShieldCheck, ArrowRight, Loader2, X, Sparkles, Building, Mail, User as UserIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface OutboundBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  schemeName: string;
  currentUser: User | null;
  triggerNotification: (msg: string) => void;
}

export default function OutboundBridgeModal({
  isOpen,
  onClose,
  targetUrl,
  schemeName,
  currentUser,
  triggerNotification
}: OutboundBridgeModalProps) {
  const [loading, setLoading] = useState(false);
  const [coordinateEnrollment, setCoordinateEnrollment] = useState(true);
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [referralId, setReferralId] = useState('');

  // Generate a premium co-branded partner referral tracking code
  useEffect(() => {
    if (isOpen) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const emailPrefix = currentUser?.email 
        ? currentUser.email.split('@')[0].substring(0, 4).toUpperCase()
        : 'GST';
      setReferralId(`YTZ-FCID-${emailPrefix}-${randomSuffix}`);
      setLoading(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleProceed = async () => {
    setLoading(true);

    const isGuest = currentUser?.uid?.startsWith('guest_') || currentUser?.isAnonymous;
    const clientName = currentUser?.displayName || 'Guest User';
    const clientEmail = currentUser?.email || 'guest@yitzak.co.za';

    // Construct enriched tracking URL with UTM parameters
    const utmUrl = new URL(targetUrl);
    utmUrl.searchParams.set('utm_source', 'yitzak');
    utmUrl.searchParams.set('utm_medium', 'partner_portal_referral');
    utmUrl.searchParams.set('utm_campaign', 'yitzak_partner_deal');
    utmUrl.searchParams.set('utm_term', referralId);

    const logId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const logData = {
      id: logId,
      referralCode: referralId,
      schemeName,
      targetUrl: targetUrl,
      trackingUrl: utmUrl.toString(),
      userId: currentUser?.uid || 'guest_click',
      userName: clientName,
      userEmail: clientEmail,
      userCompany: clientCompany || 'Not Specified',
      userPhone: clientPhone || 'Not Specified',
      coordinateEnrollment,
      status: coordinateEnrollment ? 'needs_coordination' : 'click_logged',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Log Click to Cloud Database
      if (!isGuest) {
        try {
          const docRef = doc(collection(db, 'referral_clicks'), logId);
          await setDoc(docRef, {
            ...logData,
            createdAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn('Could not write click log to cloud Firestore, storing locally:', dbErr);
          // Fallback string write
          const docRef = doc(collection(db, 'referral_clicks'), logId);
          await setDoc(docRef, logData);
        }
      }

      // 2. Local Storage trail (so both guest and user clicks are permanently stored on client machine)
      const localRefs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
      localRefs.push(logData);
      localStorage.setItem('yitzak_referral_clicks', JSON.stringify(localRefs));

      // Trigger notifications and close
      if (coordinateEnrollment) {
        triggerNotification(`Referral Locked: ${referralId}. YITZAK advisory will coordinate with FoodChain ID on your behalf.`);
      } else {
        triggerNotification(`Outbound referral tracked. Partner link activated with referral code: ${referralId}.`);
      }

      // Open in new tab securely
      window.open(utmUrl.toString(), '_blank', 'noopener,noreferrer');
      onClose();
    } catch (err: any) {
      console.error('Outbound tracking failed: ', err);
      // Even if database fails, we proceed so client is not blocked!
      window.open(utmUrl.toString(), '_blank', 'noopener,noreferrer');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#021811]/80 backdrop-blur-sm"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-white w-full max-w-lg border border-[#E5E5E5] rounded-2xl shadow-2xl overflow-hidden z-10 text-charcoal font-sans"
        >
          {/* Accent header pattern */}
          <div className="bg-[#023625] text-white p-6 relative overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
              title="Close modal"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl">
                <ShieldCheck className="text-[#B68A35]" size={24} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#B68A35] font-bold">
                  Yitzak Accredited Partner Gateway
                </span>
                <h3 className="font-serif text-lg font-bold">Accredited Training &amp; Certification Bridge</h3>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#B68A35] bg-[#B68A35]/10 px-2.5 py-1 rounded inline-block">
                Accredited Partner: FoodChain ID Academy
              </span>
              <p className="text-xs text-[#555555] leading-relaxed">
                You are visiting our accredited partner, <strong>FoodChain ID</strong>. 
                To ensure your organisation receives preferential Yitzak partner rates and dedicated corporate support, an official partner benefit code has been generated for your session.
              </p>
            </div>

            {/* Referral code display */}
            <div className="bg-surface border border-dashed border-[#B68A35]/30 p-4 rounded-xl text-center space-y-1.5 relative overflow-hidden">
              <span className="text-[10px] uppercase font-mono tracking-widest text-ash font-bold">
                Your Yitzak Partner Benefit Code
              </span>
              <div className="font-mono text-lg font-bold text-[#023625] tracking-wider select-all cursor-copy">
                {referralId || 'GENERATING...'}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#B68A35] font-sans font-bold">
                <Sparkles size={11} className="animate-pulse" />
                <span>Automatically attached to outbound registration link</span>
              </div>
            </div>

            {/* Lead capture form */}
            <div className="border border-[#E5E5E5] p-4 rounded-xl space-y-4 bg-[#F9F9F9]">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="coordinate-enrollment"
                  checked={coordinateEnrollment}
                  onChange={(e) => setCoordinateEnrollment(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[#023625] border-[#D1D1D1] rounded focus:ring-[#023625] cursor-pointer"
                />
                <label htmlFor="coordinate-enrollment" className="text-xs text-primary font-bold leading-normal cursor-pointer">
                  Coordinate this enrolment with Yitzak Advisory (Recommended)
                  <span className="block text-[11px] text-[#555555] font-normal mt-0.5">
                    Our compliance team will assist with logging your request with FoodChain ID, confirming corporate group pricing, and handling streamlined administrative invoicing.
                  </span>
                </label>
              </div>

              {coordinateEnrollment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2 border-t border-[#E5E5E5]"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-mono font-bold tracking-wider text-ash block mb-1">Company Name</label>
                      <div className="relative">
                        <Building size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
                        <input
                          type="text"
                          value={clientCompany}
                          onChange={(e) => setClientCompany(e.target.value)}
                          placeholder="e.g. Acme Corp"
                          className="w-full p-2 pl-8 border border-[#E5E5E5] bg-white text-xs outline-none focus:border-[#023625] rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono font-bold tracking-wider text-ash block mb-1">Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="e.g. +44 20 7946 0192"
                          className="w-full p-2 border border-[#E5E5E5] bg-white text-xs outline-none focus:border-[#023625] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-6 border-t border-[#E5E5E5] bg-surface flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 border border-[#E5E5E5] text-ash hover:text-primary text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-mist transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={loading}
              className="flex-1 bg-[#023625] text-white hover:bg-[#B68A35] py-3 text-xs uppercase font-bold tracking-widest transition-all cursor-pointer rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Tracking referral...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Partner Site</span>
                  <ExternalLink size={14} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
