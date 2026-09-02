import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Layers, 
  FileCheck2, 
  Clock, 
  Award,
  Sparkles,
  Printer
} from 'lucide-react';
import { SchemeItem } from '../data/schemes';

interface SchemeDetailsModalProps {
  scheme: SchemeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAskAboutScheme: (inquiryNote: string) => void;
}

export default function SchemeDetailsModal({
  scheme,
  isOpen,
  onClose,
  onAskAboutScheme
}: SchemeDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !scheme) return null;

  return (
    <AnimatePresence>
      <div 
        id="scheme-details-modal-overlay"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-[#023625]/60 backdrop-blur-xs overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white rounded-t-3xl sm:rounded-2xl border border-[#E5E5E5] shadow-2xl max-w-3xl w-full h-[94vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden text-on-surface my-0 sm:my-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scheme-modal-title"
        >
          {/* Mobile Sheet Grab Handle */}
          <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-white">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Modal Header */}
          <div className="p-4 sm:p-6 md:p-7 border-b border-[#F0F0F0] bg-white flex items-start justify-between gap-4 sticky top-0 z-10">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#FAF7F0] text-[#7a5a1f] border border-[#B68A35]/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  {scheme.category}
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  <span>{scheme.badge}</span>
                </span>
              </div>
              <h2 id="scheme-modal-title" className="font-serif text-xl sm:text-2xl md:text-3xl text-primary font-bold truncate">
                {scheme.title}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-on-surface-variant line-clamp-2">
                {scheme.shortDescription}
              </p>
            </div>

            <button
              id="close-scheme-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-ash hover:text-primary hover:bg-[#F5F5F5] transition-colors cursor-pointer shrink-0"
              aria-label="Close details"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-on-surface leading-relaxed flex-1">
            
            {/* Accreditation Boundary Notice */}
            <div className="bg-[#FAF7F0] border border-[#B68A35]/30 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#B68A35] shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-[#023625] uppercase tracking-wider font-mono">Yitzak Advisory &amp; Preparation Route</span>
                <p className="text-on-surface-variant">
                  {scheme.accreditationNote}
                </p>
              </div>
            </div>

            {/* Scheme Overview */}
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <FileCheck2 size={16} className="text-[#B68A35]" />
                <span>Scheme Overview &amp; Compliance Requirements</span>
              </h3>
              <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {scheme.overview}
              </p>
              
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] font-bold block mb-1.5">
                  Covered Standards &amp; Modules:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.keyPoints.map((point, idx) => (
                    <span key={idx} className="text-xs bg-[#F7F7F7] text-primary border border-[#E8E8E8] px-2.5 py-1 rounded-md font-medium">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Sectors */}
            <div className="space-y-2.5 border-t border-[#F0F0F0] pt-5">
              <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <Building2 size={16} className="text-[#B68A35]" />
                <span>Common Facility Types</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface-variant">
                {scheme.targetIndustries.map((industry, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#FBFBFB] border border-[#F0F0F0] p-2.5 rounded-lg">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{industry}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Yitzak's Advisory Scope */}
            <div className="space-y-2.5 border-t border-[#F0F0F0] pt-5">
              <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <Layers size={16} className="text-[#B68A35]" />
                <span>How Yitzak Prepares Your Team &amp; Facility</span>
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-on-surface-variant">
                {scheme.yitzakRole.map((role, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#023625]/10 text-primary font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Phase Roadmap */}
            <div className="space-y-3 border-t border-[#F0F0F0] pt-5">
              <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                <Clock size={16} className="text-[#B68A35]" />
                <span>Structured Preparation Pathway</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scheme.preparationPhases.map((phase, idx) => (
                  <div key={idx} className="bg-[#FAF7F0] border border-[#B68A35]/20 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold text-[#7a5a1f]">
                        {phase.phase}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B68A35]" />
                    </div>
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-primary">
                      {phase.title}
                    </h4>
                    <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                      {phase.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer / Primary CTA */}
          <div className="p-4 sm:p-5 md:p-6 border-t border-[#F0F0F0] bg-[#FDFDFD] flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
            <div className="text-xs text-ash text-center sm:text-left">
              Speak with Yitzak to scope requirements for this scheme.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="scheme-modal-close-btn"
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-border text-xs font-sans font-bold text-primary hover:bg-mist transition-colors cursor-pointer text-center"
              >
                Close
              </button>
              
              <button
                id="scheme-modal-ask-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onAskAboutScheme(scheme.inquiryNote);
                }}
                className="w-1/2 sm:w-auto bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-2 active:scale-95 text-center"
              >
                <span>Ask About This Scheme</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
