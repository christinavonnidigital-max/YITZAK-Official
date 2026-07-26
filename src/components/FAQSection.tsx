import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  GraduationCap, 
  Award, 
  Users, 
  ShieldCheck, 
  Clock, 
  Calendar 
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      id: 'faq-streams',
      category: 'Curriculum & Standards',
      icon: <GraduationCap size={16} className="text-[#B68A35]" />,
      question: 'What is the difference between YITZAK Curricula and FoodChain ID courses?',
      answer: 'YITZAK Curricula consists of proprietary, custom-engineered training modules designed by our senior consultants to target specific high-complexity operations, internal audits, and regional leadership goals. FoodChain ID courses are internationally recognized, standardized certification programs delivered through our exclusive official partnership, leading to accredited regulatory compliance certificates (e.g., FSSC 22000, BRCGS, SQF) directly recognized by global retail and audit consortia.'
    },
    {
      id: 'faq-customization',
      category: 'In-House Solutions',
      icon: <Users size={16} className="text-[#B68A35]" />,
      question: 'Can the training programs be customized for our specific facility and sector?',
      answer: 'Yes. Under our "In-House Solutions" stream, we routinely perform pre-training consultations to adapt our syllabi to your unique plant layout, machinery types, products, and historic compliance challenges. We can incorporate your internal Standard Operating Procedures (SOPs) into case studies and deliver instruction in both classroom and practical on-site environments.'
    },
    {
      id: 'faq-accreditation',
      category: 'Certification & Validity',
      icon: <Award size={16} className="text-[#B68A35]" />,
      question: 'Are the certificates internationally valid, and how is competence verified?',
      answer: 'Absolutely. For partnered GFSI and ISO programs, official certificates are issued directly by governing bodies like FoodChain ID or relevant certification authorities. For independent YITZAK modules, candidates undergo structured written and practical evaluations. Upon successful completion, they receive a formal YITZAK Certificate of Competency, complete with uniquely registered tracking numbers and CEU credits verifiable by key industry stakeholders.'
    },
    {
      id: 'faq-consulting',
      category: 'Audit & Consulting',
      icon: <ShieldCheck size={16} className="text-[#B68A35]" />,
      question: 'Does YITZAK provide real-time assistance during a live third-party audit?',
      answer: 'While regulatory guidelines prohibit training institutions from acting as active auditees, YITZAK provides extensive "Pre-Audit Verification" and "Mock Audit" services. We prepare your staff through simulated audit pressure, perform comprehensive gap analyses, and help organize documentation. If requested, our senior advisors can remain on-site in a passive advisory observer role to help interpret auditor technical findings.'
    },
    {
      id: 'faq-calculator',
      category: 'ROI & Tools',
      icon: <Clock size={16} className="text-[#B68A35]" />,
      question: 'How accurate is the Compliance & ROI Calculator, and how should we use its results?',
      answer: 'Our proprietary calculator uses a multivariable algorithm based on standard industrial lead times, site scaling factors, and statistical audit failure rates. It serves as an excellent executive planning tool to gauge baseline resource allocation. However, we highly recommend scheduling a 1-on-1 expert validation session to convert these mathematical estimations into a fully customized, audit-proof project execution plan.'
    },
    {
      id: 'faq-calendar-booking',
      category: 'Schedules & Registration',
      icon: <Calendar size={16} className="text-[#B68A35]" />,
      question: 'What happens if we miss a scheduled training day or virtual session?',
      answer: 'For our Virtual Instructor-Led and Blended learning formats, we provide secure access to high-definition session recordings, shared resource centers, and offline tutor support for up to 30 days post-course. If an attendee misses a significant portion of an accredited syllabus, they can be rescheduled into the next active monthly cohort free of charge, subject to seat availability.'
    }
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faq-homepage-section" className="py-16 md:py-24 bg-white border-t border-b border-[#E5E5E5] scroll-mt-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        
        {/* FAQ Header Block */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-antique-gold/10 border border-antique-gold/20 rounded-full mb-4">
            <Sparkles size={13} className="text-[#B68A35]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B68A35]">Knowledge Base</span>
          </div>
          <h2 className="font-serif text-3xl md:text-[40px] text-primary font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-xs md:text-sm text-ash leading-relaxed">
            Quick, detailed answers regarding our accreditation standards, customized delivery formats, certification validity, and corporate evaluation frameworks.
          </p>
          <div className="w-16 h-1 bg-[#B68A35] mx-auto mt-6"></div>
        </div>

        {/* Minimalist Accordion Container */}
        <div id="faq-accordion-container" className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                id={`faq-item-card-${faq.id}`}
                key={faq.id}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'border-[#B68A35] bg-antique-gold/5 shadow-xs' 
                    : 'border-[#E5E5E5] hover:border-antique-gold/45 bg-white'
                }`}
              >
                {/* Accordion Trigger Button */}
                <button
                  id={`faq-trigger-${faq.id}`}
                  onClick={() => handleToggle(index)}
                  className="w-full py-4.5 px-6 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="p-1.5 bg-antique-gold/10 rounded-lg shrink-0">
                      {faq.icon}
                    </span>
                    <span className="font-serif text-xs md:text-sm font-bold text-primary hover:text-[#B68A35] transition-colors leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <span 
                    className={`text-[#B68A35] transition-transform duration-300 transform shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown size={16} />
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
                      <div className="px-6 pb-5 pt-1 border-t border-[#E5E5E5]/40 space-y-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#B68A35] bg-[#B68A35]/10 px-2 py-0.5 rounded">
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
        <div id="faq-cta-prompt" className="text-center mt-12 bg-[#F9F9F9] border border-[#E5E5E5] rounded-2xl p-6 max-w-xl mx-auto text-xs space-y-4">
          <p className="font-sans text-ash leading-relaxed">
            Have a highly specialized question about ISO standards or local audit requirements not covered here?
          </p>
          <button
            id="faq-contact-redirect-btn"
            onClick={() => {
              const el = document.getElementById('contact-form-section') || document.getElementById('contact') || document.getElementById('portal');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                // If element is not found, open generic inquiry
                const contactBtn = document.querySelector('[onClick*="contact"]');
                if (contactBtn instanceof HTMLButtonElement) {
                  contactBtn.click();
                }
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#B68A35] hover:text-primary font-bold transition-colors cursor-pointer underline decoration-dotted underline-offset-4 focus:outline-none"
          >
            <span>Speak directly with our Academic Registrar</span>
            <span>→</span>
          </button>
        </div>

      </div>
    </section>
  );
}
