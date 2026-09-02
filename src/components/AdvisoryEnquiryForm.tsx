import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  User, 
  Building2, 
  FileText, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ChevronDown,
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { db, auth, getAccessToken } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { dispatchInquiryEmail } from '../lib/emailService';

interface AdvisoryEnquiryFormProps {
  onOpenPrivacy?: () => void;
  prefilledNeed?: string;
  onSuccess?: (refId: string) => void;
}

export const AdvisoryEnquiryForm: React.FC<AdvisoryEnquiryFormProps> = ({
  onOpenPrivacy,
  prefilledNeed = '',
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [serviceFocus, setServiceFocus] = useState('Consulting & Advisory');
  const [needsDescription, setNeedsDescription] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const serviceOptions = [
    'Product & Label Certification',
    'Consulting & Advisory',
    'Professional Training',
    'Certification Preparation',
    'Business Process Implementation',
    'General Enquiry'
  ];

  // Update needs description and service focus when prefilledNeed prop changes
  useEffect(() => {
    if (prefilledNeed) {
      const lower = prefilledNeed.toLowerCase();
      if (lower.includes('product & label') || lower.includes('product and label') || lower.includes('non-gmo') || lower.includes('organic')) {
        setServiceFocus('Product & Label Certification');
      } else if (lower.includes('certification') || lower.includes('brcgs') || lower.includes('fssc') || lower.includes('globalg.a.p')) {
        setServiceFocus('Certification Preparation');
      } else if (lower.includes('training') || lower.includes('course')) {
        setServiceFocus('Professional Training');
      } else if (lower.includes('process') || lower.includes('sop') || lower.includes('workflow')) {
        setServiceFocus('Business Process Implementation');
      }

      setNeedsDescription(prev => {
        if (!prev) return `I would like assistance with: ${prefilledNeed}`;
        if (!prev.includes(prefilledNeed)) return `${prev}\n\nRegarding: ${prefilledNeed}`;
        return prev;
      });
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  }, [prefilledNeed]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !needsDescription.trim()) {
      setError('Please provide your name, work email, and requirements.');
      return;
    }

    if (!agreedToPrivacy) {
      setError('Please confirm acceptance of the privacy policy to proceed.');
      return;
    }

    setLoading(true);
    setError(null);

    const refId = `ADV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const firestoreId = `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        organisation: organisation.trim() || 'Not specified',
        subject: serviceFocus,
        message: needsDescription.trim(),
        source: 'consulting_advisory_page',
        refId,
        userId: auth.currentUser?.uid || null,
        status: 'unread',
        createdAt: new Date().toISOString()
      };

      // 1. Write to Firestore
      try {
        await setDoc(doc(db, 'inquiries', firestoreId), {
          ...payload,
          createdAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.warn('Firestore write fallback: ', firestoreErr);
        await setDoc(doc(db, 'inquiries', firestoreId), payload);
      }

      // 2. Dispatch email notification
      try {
        const token = await getAccessToken().catch(() => null);
        await dispatchInquiryEmail(
          {
            senderName: name.trim(),
            senderEmail: email.trim().toLowerCase(),
            subject: `[Advisory Request] ${serviceFocus} - ${organisation.trim() || name.trim()}`,
            message: `Organisation: ${organisation.trim() || 'N/A'}\nService Requested: ${serviceFocus}\nReference ID: ${refId}\n\nRequirements:\n${needsDescription.trim()}`
          },
          token
        );
      } catch (emailErr) {
        console.warn('Email dispatch notice: ', emailErr);
      }

      setInquiryId(refId);
      setSuccess(true);
      
      // Reset form
      setName('');
      setEmail('');
      setOrganisation('');
      setNeedsDescription('');
      setAgreedToPrivacy(false);

      if (onSuccess) {
        onSuccess(refId);
      }
    } catch (err: any) {
      console.error('Advisory enquiry submission failed:', err);
      setError(err?.message || 'Unable to submit your enquiry at this time. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="request-advisory" className="scroll-mt-[110px] w-full max-w-3xl mx-auto pb-4 sm:pb-0">
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-lg p-5 sm:p-8 md:p-10 relative overflow-hidden">
        {/* Top Decorative Subtle Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#023625] via-[#B68A35] to-[#023625]" />

        <div className="mb-7 sm:mb-8 space-y-2 text-left">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">
            Request Advisory Support
          </h2>
          <p className="font-sans text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
            Submit your enquiry below. We will review your enquiry and respond with next steps to help prepare your organisation.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#023625]/5 border border-[#023625]/20 rounded-xl p-6 sm:p-8 text-center space-y-5"
          >
            <div className="w-14 h-14 rounded-full bg-[#023625] text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle size={28} className="text-[#DFC181]" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-primary">
                Advisory Request Received
              </h3>
              <p className="font-sans text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. We have received your enquiry and will review your requirements to contact you with next steps.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 shadow-2xs">
              <span className="text-stone-400 font-sans">Reference:</span>
              <span className="font-bold text-[#023625]">{inquiryId}</span>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-xs font-bold text-[#B68A35] hover:text-[#9e7528] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Submit another advisory request
              </button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Full Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full bg-[#F9F9F9] border border-stone-200 py-2.5 pl-10 pr-4 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B68A35]/20 focus:border-[#B68A35] transition-all rounded-lg"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. tmoyo@organisation.co.zw"
                    className="w-full bg-[#F9F9F9] border border-stone-200 py-2.5 pl-10 pr-4 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B68A35]/20 focus:border-[#B68A35] transition-all rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Organisation */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                  Organisation / Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    type="text"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    placeholder="e.g. Delta Agribusiness Ltd"
                    className="w-full bg-[#F9F9F9] border border-stone-200 py-2.5 pl-10 pr-4 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B68A35]/20 focus:border-[#B68A35] transition-all rounded-lg"
                  />
                </div>
              </div>

              {/* Service Requested Dropdown (Preselected to Consulting & Advisory, Editable) */}
              <div ref={dropdownRef} className="relative">
                <label 
                  id="advisory-service-label"
                  className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono"
                >
                  Service Requested
                </label>
                <div className="relative">
                  <button
                    type="button"
                    aria-labelledby="advisory-service-label"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsDropdownOpen(false);
                      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (!isDropdownOpen) setIsDropdownOpen(true);
                      }
                    }}
                    className={`w-full bg-[#F9F9F9] border py-2.5 pl-10 pr-10 text-left text-sm font-medium transition-all rounded-lg cursor-pointer flex items-center justify-between ${
                      isDropdownOpen 
                        ? 'bg-white border-[#B68A35] ring-2 ring-[#B68A35]/20 text-primary' 
                        : 'border-stone-200 text-charcoal hover:bg-white hover:border-[#B68A35]/50'
                    }`}
                  >
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
                    <span className="truncate">{serviceFocus}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-stone-400 transition-transform duration-200 pointer-events-none ${isDropdownOpen ? 'rotate-180 text-[#B68A35]' : ''}`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        role="listbox"
                        aria-labelledby="advisory-service-label"
                        initial={{ opacity: 0, y: 4, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.99 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-auto"
                      >
                        {serviceOptions.map((opt) => {
                          const isSelected = serviceFocus === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setServiceFocus(opt);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs font-sans flex items-center justify-between transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#023625]/10 text-[#023625] font-bold' 
                                  : 'text-charcoal hover:bg-[#F9F9F9] hover:text-primary font-medium'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && (
                                <Check size={14} className="text-[#023625]" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Needs Description / Plain Language Label */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                What would you like help with? <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={messageInputRef}
                required
                rows={4}
                value={needsDescription}
                onChange={(e) => setNeedsDescription(e.target.value)}
                placeholder="e.g. Guidance on our upcoming audit, gap assessment for ISO 9001/22000, food safety compliance review, or general advice..."
                className="w-full bg-[#F9F9F9] border border-stone-200 p-3.5 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B68A35]/20 focus:border-[#B68A35] transition-all resize-y rounded-lg font-sans leading-relaxed"
              />
            </div>

            {/* Privacy Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="advisory-privacy-consent"
                type="checkbox"
                required
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-[#023625] focus:ring-[#B68A35] cursor-pointer shrink-0"
              />
              <label htmlFor="advisory-privacy-consent" className="text-xs text-stone-600 leading-relaxed cursor-pointer select-none">
                I agree to the processing of this information to evaluate advisory services in accordance with Yitzak's{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-[#023625] hover:underline font-semibold"
                >
                  Privacy Policy
                </button>
                .{' '}
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Submit Action & Info Footer */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
              <div className="flex items-center gap-2 text-stone-500 text-xs font-sans self-start sm:self-center">
                <ShieldCheck size={14} className="text-[#B68A35] shrink-0" />
                <span>Your information will be handled in accordance with our Privacy Policy</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#023625] hover:bg-[#034d35] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#DFC181]" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Advisory Request</span>
                    <Send size={14} className="text-[#DFC181]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
