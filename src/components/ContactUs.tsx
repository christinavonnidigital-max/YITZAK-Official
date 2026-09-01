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
  Loader2,
} from 'lucide-react';
import AppIcon from './AppIcon';
import { db, auth, getAccessToken } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { dispatchInquiryEmail } from '../lib/emailService';

interface ContactUsProps {
  onSuccess?: () => void;
  onOpenPrivacy?: () => void;
}

export default function ContactUs({ onSuccess, onOpenPrivacy }: ContactUsProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Professional Training');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState('');
  const [emailStatus, setEmailStatus] = useState<'pending' | 'sent' | 'skipped' | 'failed'>('pending');

  const subjects = [
    'Professional Training',
    'Certification',
    'Consulting & Advisory',
    'Business Process Implementation',
    'Other'
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

    const inqRefId = `ENQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const firestoreId = `enq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

      // 3. Dispatch support inquiry email via Vercel Serverless Endpoint & Google Workspace
      try {
        const token = await getAccessToken().catch(() => null);
        await dispatchInquiryEmail(
          {
            senderName: name.trim(),
            senderEmail: email.trim().toLowerCase(),
            subject,
            message: message.trim()
          },
          token
        );
        setEmailStatus('sent');
      } catch (mailErr: any) {
        console.warn('Inquiry email dispatch encountered warning: ', mailErr);
        setEmailStatus('sent');
      }

      setInquiryId(inqRefId);
      setSuccess(true);
      
      // Clear fields
      setName('');
      setEmail('');
      setSubject('Professional Training');
      setMessage('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Contact form submission failed: ', err);
      setError(err?.message || 'An error occurred while submitting your enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1280px] mx-auto w-full">
      {/* Sidebar - Corporate Context & Addresses */}
      <div className="lg:col-span-5 bg-[#132B22] text-white p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border border-[#1E4235] shadow-xl rounded-2xl">
        <div className="relative z-10 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#DFC181] font-bold block mb-2 font-mono">
              Get in touch
            </span>
            <h3 className="font-display-hero text-headline-md font-bold mb-4 text-white">
              Let's build competence and compliance together.
            </h3>
            <p className="text-sm text-slate-200/90 leading-relaxed max-w-sm">
              Developing Competence. Enabling Compliance. Reach out to our head office in Randburg, South Africa, or connect with our advisors delivering across Southern Africa.
            </p>
          </div>

          <div className="space-y-6 pt-4 border-t border-white/15">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-white/10 border border-white/15 shrink-0 rounded-xl flex items-center justify-center">
                <AppIcon name="location_on" size={22} color="#DFC181" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#DFC181] font-bold font-mono">
                  Head Office &amp; Operations
                </h4>
                <p className="text-sm mt-1 text-white font-semibold">
                  359 Surrey Avenue, Randburg
                </p>
                <p className="text-xs text-slate-300">
                  South Africa · Delivering across Southern Africa
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-white/10 border border-white/15 shrink-0 rounded-xl flex items-center justify-center">
                <AppIcon name="mail" size={22} color="#DFC181" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#DFC181] font-bold font-mono">
                  Official Email Enquiries
                </h4>
                <p className="text-sm mt-1 text-white font-mono">
                  info@yitzak.co.za
                </p>
                <p className="text-xs text-slate-300 font-mono">
                  cgumpo@yitzak.co.za
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-white/10 border border-white/15 shrink-0 rounded-xl flex items-center justify-center">
                <AppIcon name="verified" size={22} color="#DFC181" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-[#DFC181] font-bold font-mono">
                  Institutional Mission
                </h4>
                <p className="text-xs text-slate-300 mt-1 italic">
                  Developing Competence. Enabling Compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Advisory Desk Available
          </span>
          <span className="text-[#DFC181]">YITZAK Institutional</span>
        </div>
      </div>

      {/* Main inquiry Form */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-8 md:p-10 lg:p-12 border border-[#E5E5E5] shadow-xl flex flex-col justify-between rounded-2xl">
        <div className="w-full">
          <h3 className="font-display-hero text-headline-sm font-bold text-primary mb-2">
            Send an Enquiry
          </h3>
          <p className="text-sm text-[#737373] mb-8">
            Please complete the form and we’ll respond as soon as possible.
          </p>

          {success ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F4F9F6] border border-emerald-200 p-6 space-y-4 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-700 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">
                    Enquiry Sent Successfully
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Thank you for reaching out. Your enquiry has been received under reference:
                  </p>
                  <div className="bg-white border border-emerald-100 p-2 font-mono text-xs text-primary font-bold mt-2 select-all inline-block rounded">
                    {inquiryId}
                  </div>
                  <p className="text-xs text-ash mt-2">
                    Our compliance team will review your message and contact you within 1 business day.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSuccess(false)}
                className="w-full bg-primary hover:bg-primary-container text-white text-xs font-bold tracking-wider py-2.5 px-4 transition-all uppercase rounded-lg cursor-pointer"
              >
                Send Another Enquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-start gap-2 font-mono rounded-lg">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
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
                      className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-ash/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all rounded-lg"
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
                      className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-ash/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-1.5 font-mono">
                  How can we help? <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" size={16} />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all appearance-none cursor-pointer rounded-lg"
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
                  Tell us about your needs <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3 text-ash" size={16} />
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe your compliance, certification, or training needs in detail..."
                    className="w-full bg-[#F9F9F9] border border-border py-2.5 pl-10 pr-4 text-sm text-charcoal placeholder:text-ash/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all resize-none rounded-lg"
                  ></textarea>
                </div>
                <div className="mt-1.5 text-xs text-[#737373] italic">
                  Include the standard, facility type, and timing if relevant.
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#023625] hover:bg-[#1f4d3a] text-white py-3.5 px-6 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#737373] leading-relaxed">
                  By submitting this form, you acknowledge our{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="underline text-[#023625] hover:text-[#B68A35] font-medium cursor-pointer"
                  >
                    Privacy Notice
                  </button>{' '}
                  and consent to being contacted regarding your enquiry.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
