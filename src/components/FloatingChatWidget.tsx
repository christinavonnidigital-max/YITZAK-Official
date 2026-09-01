import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, ArrowUp, Loader2 } from 'lucide-react';

// Lazy-load the chat dialog and its heavy form/firebase logic only when opened by user
const ChatModalBox = lazy(() => import('./ChatModalBox'));

interface FloatingChatWidgetProps {
  onOpenBooking?: () => void;
  showBackToTop?: boolean;
  onScrollToTop?: () => void;
}

export default function FloatingChatWidget({ onOpenBooking, showBackToTop, onScrollToTop }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadPrompt, setHasUnreadPrompt] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnreadPrompt(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 xl:right-8 z-40 font-sans pointer-events-none">
      {/* Floating Action Cluster (Quiet stack) */}
      <AnimatePresence>
        {!isOpen && (
          <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
            {/* Back to Top Button (Quiet 40px circle, shown only on desktop/tablet after scroll, stays directly above chat) */}
            {showBackToTop && (
              <motion.button
                key="back-to-top-btn"
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 8 }}
                onClick={onScrollToTop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex w-10 h-10 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-[#023625] border border-stone-200 shadow-md hover:shadow-lg transition-all items-center justify-center cursor-pointer relative group shrink-0"
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

      {/* Floating Chat Modal Box - Lazily Loaded */}
      <AnimatePresence>
        {isOpen && (
          <Suspense fallback={
            <div className="pointer-events-auto w-[calc(100vw-32px)] sm:w-[380px] h-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#023625]" />
              <span className="text-xs font-medium text-gray-500">Connecting to Advisory Desk...</span>
            </div>
          }>
            <ChatModalBox
              onClose={handleClose}
              onOpenBooking={onOpenBooking}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
