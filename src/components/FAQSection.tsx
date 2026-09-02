import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles } from 'lucide-react';
import AppIcon from './AppIcon';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  iconName: string;
}

interface FAQSectionProps {
  onNavigateToContact?: () => void;
}

export default function FAQSection({ onNavigateToContact }: FAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'faq-streams',
      category: 'Curriculum & Standards',
      iconName: 'school',
      question: 'What is the difference between YITZAK Programmes and FoodChain ID courses?',
      answer: 'YITZAK Programmes are practical training courses developed by our consultants to support compliance implementation, internal auditing skills, and management system maintenance. FoodChain ID Academy courses are standardized auditor and scheme training programs available through our partnership, leading to FoodChain ID issued certificates (such as FSSC 22000, BRCGS, and ISO schemes).'
    },
    {
      id: 'faq-customization',
      category: 'In-House Solutions',
      iconName: 'groups',
      question: 'Can training programs be delivered on-site at our facility?',
      answer: 'Yes. Through our In-House Solutions, we tailor course delivery to your specific operational processes, site layout, and industry sector. Training can be conducted directly at your facility using your team\'s operational workflows and documentation for practical exercises.'
    },
    {
      id: 'faq-accreditation',
      category: 'Certificates & Verification',
      iconName: 'verified',
      question: 'What certificates are issued upon course completion?',
      answer: 'Participants completing Yitzak courses receive an official Yitzak Certificate of Completion and attendance record. For FoodChain ID Academy courses, official accredited certificates are issued directly by FoodChain ID following their standard evaluation and examination procedures.'
    },
    {
      id: 'faq-calendar-booking',
      category: 'Schedules & Registration',
      iconName: 'calendar_month',
      question: 'How do we register for scheduled courses or book an in-house cohort?',
      answer: 'You can check course availability directly online or submit a consultation request for on-site team training. Our team will provide schedule confirmation, venue details, and invoice requirements prior to course commencement.'
    }
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faq-homepage-section" className="py-6 md:py-8 bg-white border-t border-b border-[#E5E5E5] scroll-mt-[80px]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        
        {/* FAQ Header Block */}
        <div className="text-center mb-6 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200 rounded-full mb-3">
            <AppIcon name="help" size={16} color="#B68A35" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1f1f1f]">Knowledge Base</span>
          </div>
          <h2 className="font-serif text-3xl md:text-[36px] text-primary font-bold mb-3">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-xs md:text-sm text-ash leading-relaxed">
            Key information regarding course pathways, on-site delivery, certificate issuance, and registration.
          </p>
          <div className="w-16 h-1 bg-[#B68A35] mx-auto mt-4"></div>
        </div>

        {/* Minimalist Accordion Container */}
        <div id="faq-accordion-container" className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                id={`faq-item-card-${faq.id}`}
                key={faq.id}
                className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'border-[#B68A35] bg-stone-50/70 shadow-2xs' 
                    : 'border-[#E5E5E5] hover:border-[#B68A35]/50 bg-white'
                }`}
              >
                {/* Accordion Trigger Button */}
                <button
                  id={`faq-trigger-${faq.id}`}
                  onClick={() => handleToggle(index)}
                  className="w-full py-3.5 px-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <div className="w-9 h-9 rounded-lg bg-stone-100/90 border border-stone-200 flex items-center justify-center shrink-0 text-[#1f1f1f]">
                      <AppIcon name={faq.iconName} size={20} color="#1f1f1f" />
                    </div>
                    <span className="font-serif text-xs md:text-sm font-bold text-primary hover:text-[#B68A35] transition-colors leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <span 
                    className={`text-[#1f1f1f] transition-transform duration-300 transform shrink-0 ${
                      isExpanded ? 'rotate-180 text-[#B68A35]' : ''
                    }`}
                  >
                    <ChevronDown size={18} />
                  </span>
                </button>

                {/* Collapsible Answer Block */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`faq-collapse-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1 border-t border-[#E5E5E5]/40 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#7d5800] bg-[#B68A35]/10 px-2.5 py-0.5 rounded-full border border-[#B68A35]/20">
                            {faq.category}
                          </span>
                        </div>
                        <p className="font-sans text-xs md:text-[13px] text-ash leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Dynamic CTA inside FAQ Section */}
        <div id="faq-cta-prompt" className="text-center mt-8 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-5 max-w-xl mx-auto text-xs space-y-3">
          <p className="font-sans text-ash leading-relaxed">
            Have questions about course schedules, prerequisites, or corporate team bookings?
          </p>
          <button
            id="faq-contact-redirect-btn"
            onClick={() => {
              if (onNavigateToContact) {
                onNavigateToContact();
              } else {
                const el = document.getElementById('contact-form-section') || document.getElementById('contact') || document.getElementById('portal');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#B68A35] hover:text-primary font-bold transition-colors cursor-pointer underline decoration-dotted underline-offset-4 focus:outline-none"
          >
            <span>Speak with Yitzak</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </section>
  );
}
