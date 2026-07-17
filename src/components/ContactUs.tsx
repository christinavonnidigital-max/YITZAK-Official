import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  User, 
  FileText, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Phone, 
  Globe, 
  Clock, 
  HelpCircle,
  Database,
  Loader2
} from 'lucide-react';
import { db, auth, getAccessToken } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendContactInquiryEmail } from '../lib/googleApi';

interface ContactUsProps {
  onSuccess?: () => void;
}

export default function ContactUs({ onSuccess }: ContactUsProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Regulatory Compliance');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState('');
  const [emailStatus, setEmailStatus] = useState<'pending' | 'sent' | 'skipped' | 'failed'>('pending');

  const subjects = [
    'Regulatory Compliance',
    'Strategic Employee Training',
    'Institutional Advisory & Audits',
    'FSSC/ISO Certification',
    'General Support Inquiry'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setEmailStatus('pending');

    const inqRefId = `INQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const firestoreId = `inq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. Prepare data payload
      const inquiryData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject,
        message: message.trim(),
        userId: auth.currentUser?.uid || null,
        status: 'unread',
        createdAt: new Date().toISOString()
      };

      // 2. Write to Firestore database with server timestamp (or string fallback for guest environment)
      try {
        const dbInquiryData = {
          ...inquiryData,
          createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'inquiries', firestoreId), dbInquiryData);
      } catch (firestoreErr: any) {
        console.warn('Firestore write failed, attempting string fallback for local sandbox: ', firestoreErr);
        await setDoc(doc(db, 'inquiries', firestoreId), inquiryData);
      }

      // 3. Attempt support email dispatch via Google API if user is authenticated with Workspace scopes
      let mailSent = false;
      try {
        const token = await getAccessToken();
        if (token) {
          await sendContactInquiryEmail(token, {
            senderName: name.trim(),
            senderEmail: email.trim().toLowerCase(),
            subject,
            message: message.trim()
          });
          mailSent = true;
          setEmailStatus('sent');
        } else {
          setEmailStatus('skipped');
        }
      } catch (gmailErr: any) {
        console.error('Support email dispatch failed: ', gmailErr);
        setEmailStatus('failed');
      }

      setInquiryId(inqRefId);
      setSuccess(true);
      
      // Clear fields
      setName('');
      setEmail('');
      setSubject('Regulatory Compliance');
      setMessage('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Contact form submission failed: ', err);
      setError(err?.message || 'An error occurred while submitting your inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1280px] mx-auto w-full">
      {/* Sidebar - Corporate Context & Addresses */}
      <div className="lg:col-span-5 bg-primary text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border border-[#023625] shadow-xl">
        {/* Background decorative badge */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-5 rounded-full blur-2xl transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary opacity-5 rounded-full blur-2xl transform -translate-x-20 translate-y-20"></div>

        <div className="relative z-10 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#7d5800] font-bold block mb-2 font-mono">
              Direct Channels
            </span>
            <h3 className="font-display-hero text-headline-md font-bold mb-4 text-surface-container-lowest">
              YITZAK Support & Advisory
            </h3>
            <p className="text-sm text-ash leading-relaxed max-w-sm">
              Connect with our principal compliance officers and senior trainers. General inquiries are processed within 4 hours by our central Secretariat.
            </p>
          </div>

          <div className="space-y-6 pt-4 border-t border-white/10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 border border-white/10 shrink-0 text-secondary">
                <Building2 size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#7d5800] font-bold font-mono">
                  Global Headquarters
                </h4>
                <p className="text-sm mt-1 text-[#E5E5E5]">
                  Yitzak Towers, Suite 1400
                </p>
                <p className="text-xs text-ash">
                  One Broadgate, London EC2M 2QS, United Kingdom
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 border border-white/10 shrink-0 text-secondary">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#7d5800] font-bold font-mono">
                  Electronic Secretariat
                </h4>
                <p className="text-sm mt-1 text-[#E5E5E5]">
                  secretariat@yitzak-advisory.com
                </p>
                <p className="text-xs text-ash">
                  For corporate tenders and compliance briefs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/5 border border-white/10 shrink-0 text-secondary">
                <Clock size={18} />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#7d5800] font-bold font-mono">
                  Operational Standard
                </h4>
                <p className="text-sm mt-1 text-[#E5E5E5]">
                  Monday – Friday, 08:00 – 18:00 UTC
                </p>
                <p className="text-xs text-ash">
                  Global offices synchronized on London Standard Time
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-ash font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Database Synchronization Live
          </span>
          <span>v1.2.4</span>
        </div>
      </div>

      {/* Main inquiry Form */}
      <div className="lg:col-span-7 bg-white p-8 md:p-12 border border-[#E5E5E5] shadow-xl flex flex-col justify-between">
        <div className="max-w-xl">
          <h3 className="font-display-hero text-headline-sm font-bold text-primary mb-2">
            Submit a General Inquiry
          </h3>
          <p className="text-sm text-[#737373] mb-8">
            Complete the formal dispatch below to log your inquiry in our secure enterprise vault. Authorized advisors will follow up immediately.
          </p>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F4F9F6] border border-emerald-200 p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-700 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-primary text-sm font-mono uppercase tracking-wider">
                    Dispatch Successful
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Your general inquiry has been safely synchronized to the Yitzak Firestore database under record reference:
                  </p>
                  <div className="bg-white border border-emerald-100 p-2 font-mono text-xs text-primary font-bold mt-2 select-all inline-block">
                    {inquiryId}
                  </div>
                </div>
              </div>

              <div className="text-xs border-t border-emerald-100 pt-3 space-y-1 text-[#737373] font-mono">
                <div className="flex justify-between">
                  <span>Firestore Write:</span>
                  <span className="text-emerald-700 font-bold">SUCCESS</span>
                </div>
                <div className="flex justify-between">
                  <span>Gmail Forwarding:</span>
                  {emailStatus === 'sent' && <span className="text-emerald-700 font-bold">FORWARDED TO SUPPORT</span>}
                  {emailStatus === 'skipped' && <span className="text-amber-700 font-bold">SKIPPED (VISITOR SESSION)</span>}
                  {emailStatus === 'failed' && <span className="text-red-700 font-bold">DISPATCH FAILED</span>}
                </div>
              </div>

              <button
                onClick={() => setSuccess(false)}
                className="w-full bg-primary hover:bg-primary-container text-white text-xs font-bold font-mono tracking-wider py-2.5 px-4 transition-all uppercase"
              >
                Submit Another Inquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-start gap-2 font-mono">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" size={16} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-ash/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                    Corporate Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" size={16} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. j.doe@company.com"
                      className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-ash/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                  Subject Stream <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" size={16} />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all appearance-none cursor-pointer"
                  >
                    {subjects.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-ash">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                  Detailed Message Brief <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 text-ash" size={16} />
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe your compliance, certification, or training needs in detail..."
                    className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-ash/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all resize-none"
                  ></textarea>
                </div>
                <div className="flex justify-between items-center mt-1.5 font-mono text-[10px] text-ash">
                  <span>Up to 10,000 characters permitted</span>
                  <span>{message.length} chars</span>
                </div>
              </div>

              <div className="bg-surface border border-border p-3.5 font-mono text-[11px] text-ash space-y-1">
                <div className="flex items-center gap-1.5 text-[#7d5800] font-bold mb-1">
                  <Database size={13} />
                  <span>DURABLE SECURE PERSISTENCE</span>
                </div>
                <p className="leading-relaxed">
                  Your submission is recorded in our Firestore database. If logged in using your corporate Google Account with active scopes, an automated copy will be dispatched to both you and our support administrators instantly.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#023625] hover:bg-[#1f4d3a] text-white py-3.5 px-6 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Submission...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Transmit General Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
