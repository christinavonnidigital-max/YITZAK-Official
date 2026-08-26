import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  Mail,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Phone,
  ArrowRight,
  ArrowUp,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { db, auth, getAccessToken } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { dispatchQuickChatInquiry } from '../lib/emailService';
import AppIcon from './AppIcon';

interface FloatingChatWidgetProps {
  onOpenBooking?: () => void;
  showBackToTop?: boolean;
  onScrollToTop?: () => void;
}

const QUICK_TOPICS = [
  'BRCGS / FSSC 22000 Training',
  'ISO 22000 & GFSI Audit Prep',
  'HACCP / Food Safety Advisory',
  'Process Implementation Roadmap',
  'General Technical Inquiry'
];

export default function FloatingChatWidget({ onOpenBooking, showBackToTop, onScrollToTop }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnreadPrompt, setHasUnreadPrompt] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus message when a topic is selected
  const handleSelectTopic = (topic: string) => {
    setSelectedTopic(topic);
    if (!message) {
      setMessage(`Hi, I would like to inquire about ${topic}. `);
    }
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnreadPrompt(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide your name, email, and inquiry message.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    const firestoreId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
    const category = selectedTopic || 'Quick Web Inquiry';

    try {
      // 1. Save to Firestore if available
      try {
        const chatDoc = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          organization: organization.trim() || null,
          topic: category,
          message: message.trim(),
          recipient: 'info@yitzak.co.za',
          status: 'new',
          source: 'floating_chat_widget',
          userId: auth.currentUser?.uid || null,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'inquiries', firestoreId), chatDoc);
      } catch (dbErr) {
        console.warn('Firestore quick chat record warning (using fallback):', dbErr);
      }

      // 2. Dispatch Email directly to info@yitzak.co.za (and notifications to partners/admins)
      const token = await getAccessToken().catch(() => null);
      const emailRes = await dispatchQuickChatInquiry(
        {
          senderName: name.trim(),
          senderEmail: email.trim().toLowerCase(),
          organization: organization.trim() || undefined,
          serviceCategory: category,
          message: message.trim(),
        },
        token
      );

      setSuccessData({ id: emailRes.id });
    } catch (err: any) {
      console.error('Quick chat submission error:', err);
      setError(err?.message || 'Unable to deliver message. Please email directly at info@yitzak.co.za');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setOrganization('');
    setSelectedTopic('');
    setMessage('');
    setSuccessData(null);
    setError(null);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 font-sans pointer-events-none">
      {/* Floating Action Cluster (Quiet stack) */}
      <AnimatePresence>
        {!isOpen && (
          <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
            {/* Back to Top Button (Quiet 40px circle, shown only after scroll, stays directly above chat) */}
            {showBackToTop && (
              <motion.button
                key="back-to-top-btn"
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 8 }}
                onClick={onScrollToTop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-[#023625] border border-stone-200 shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer relative group shrink-0"
                aria-label="Back to top"
                title="Back to top"
              >
                <ArrowUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                {/* Tooltip on hover (desktop only) */}
                <span className="hidden sm:block absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#023625] text-white text-[11px] font-sans font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-sm">
                  Back to top
                </span>
              </motion.button>
            )}

            {/* Chat Launcher Row */}
            <div className="flex items-center gap-3">
              {/* Unread Prompt Bubble */}
              {hasUnreadPrompt && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  onClick={handleOpen}
                  className="hidden sm:flex items-center gap-2.5 bg-white text-[#023625] px-3.5 py-2 rounded-full shadow-md border border-[#023625]/15 cursor-pointer hover:border-[#B68A35] transition-all group"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-[#023625]">
                    Need quick advice? <span className="text-[#B68A35] font-bold">Ask info@yitzak.co.za</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHasUnreadPrompt(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                    aria-label="Dismiss message preview"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}

              {/* Main Chat Trigger Button: 52px dark-green circle, white icon, subtle shadow, gold notification dot */}
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative w-[52px] h-[52px] rounded-full bg-[#023625] hover:bg-[#034731] text-white shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer transition-all group"
                aria-label="Open Quick Inquiry Chat"
                title="Chat with us"
              >
                {/* Gold Notification Dot */}
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#DFC181] border-2 border-[#023625] rounded-full z-10" />

                {/* White Icon */}
                <MessageSquare size={20} className="text-white group-hover:scale-105 transition-transform" />

                {/* Tooltip on hover */}
                <span className="absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#023625] text-white text-[11px] font-sans font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-sm">
                  Chat with us
                </span>
              </motion.button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Modal Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto w-[calc(100vw-32px)] sm:w-[380px] max-h-[calc(100vh-5rem)] max-h-[calc(100dvh-5rem)] sm:max-h-[540px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{ boxShadow: '0 20px 40px -15px rgba(2, 54, 37, 0.3), 0 0 1px 1px rgba(0,0,0,0.05)' }}
          >
            {/* Chat Header - Always visible shrink-0 */}
            <div className="bg-[#023625] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#B68A35]/30 shrink-0 relative">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-[#B68A35]/40 flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-[#E6CA85]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-white leading-tight">
                    YITZAK Advisory Desk
                  </h3>
                  <p className="text-[11px] text-[#E6CA85] font-sans flex items-center gap-1.5 mt-0.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    Direct to <span className="underline decoration-[#B68A35]/60 font-semibold">info@yitzak.co.za</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close Chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Content Body */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-gray-50/50 text-sm min-h-0">
              {!successData ? (
                <>
                  {/* Automated Welcome Message */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#023625] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold font-serif">
                      Y
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3 shadow-xs text-gray-800 leading-relaxed text-[12px] max-w-[90%]">
                      <p className="font-semibold text-[#023625] mb-0.5">
                        Welcome to YITZAK Advisory
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Have a question regarding audit preparation, food safety certification, or training schedules? Leave a message below.
                      </p>
                    </div>
                  </div>

                  {/* Topic Selector Chips */}
                  <div className="space-y-1 pt-0.5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">
                      Quick Topics
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleSelectTopic(topic)}
                          className={`text-[11px] px-2 py-1 rounded-md border transition-all cursor-pointer text-left ${
                            selectedTopic === topic
                              ? 'bg-[#023625] text-white border-[#023625] font-semibold'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#B68A35] hover:text-[#023625]'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Inquiry Form */}
                  <form onSubmit={handleSubmit} className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                    <div className="text-[11px] font-bold text-[#023625] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-[#B68A35]" />
                      <span>Send Direct Inquiry</span>
                    </div>

                    {error && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Name */}
                    <div>
                      <label className="block text-[10.5px] font-medium text-gray-600 mb-0.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={13} className="absolute left-2.5 top-2 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#023625] focus:bg-white text-gray-800 transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10.5px] font-medium text-gray-600 mb-0.5">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={13} className="absolute left-2.5 top-2 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.co.za"
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#023625] focus:bg-white text-gray-800 transition-all"
                        />
                      </div>
                    </div>

                    {/* Company (Optional) */}
                    <div>
                      <label className="block text-[10.5px] font-medium text-gray-600 mb-0.5">
                        Company / Facility <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Building size={13} className="absolute left-2.5 top-2 text-gray-400" />
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. AgriProcess Ltd"
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#023625] focus:bg-white text-gray-800 transition-all"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[10.5px] font-medium text-gray-600 mb-0.5">
                        How can we help? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        ref={messageInputRef}
                        required
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your question or request here..."
                        className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#023625] focus:bg-white text-gray-800 resize-none transition-all"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#023625] hover:bg-[#034d35] text-white font-sans font-bold text-xs uppercase tracking-wider py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-98"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Dispatching to info@yitzak.co.za...</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} className="text-[#E6CA85]" />
                          <span>Send Quick Inquiry</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-center space-y-3 my-auto"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#023625]">
                      Inquiry Dispatched
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      Your message has been sent directly to <strong className="text-[#023625]">info@yitzak.co.za</strong>.
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-mono text-gray-600">
                    Ref: <span className="font-bold text-[#023625]">{successData.id}</span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed">
                    Our lead advisors will review your requirements and respond promptly.
                  </p>

                  <div className="pt-1 flex flex-col gap-2">
                    {onOpenBooking && (
                      <button
                        type="button"
                        onClick={() => {
                          handleClose();
                          onOpenBooking();
                        }}
                        className="w-full bg-[#B68A35] hover:bg-[#a0772d] text-white font-sans font-bold text-xs uppercase tracking-wider py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Calendar size={13} />
                        <span>Book 1-on-1 Consultation</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-semibold text-xs py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Footer with Direct Fallbacks - Always visible shrink-0 */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
              <a
                href="mailto:info@yitzak.co.za"
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#023625] font-medium transition-colors"
                title="Email directly"
              >
                <Mail size={12} className="text-[#B68A35]" />
                <span>info@yitzak.co.za</span>
              </a>

              <a
                href="tel:+27102107715"
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#023625] font-medium transition-colors"
                title="Direct phone line"
              >
                <Phone size={12} className="text-[#B68A35]" />
                <span>+27 (0)102107715</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
