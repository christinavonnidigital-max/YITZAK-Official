import React from 'react';
import { Home, ChevronRight, GraduationCap, ShieldCheck, Award, Headphones, Workflow, Calendar, Mail, FileText, Lock, Shield } from 'lucide-react';
import { AppView } from '../lib/routes';
import AppIcon from './AppIcon';

interface PortfolioCategory {
  id: string;
  label: string;
  title: string;
}

interface BreadcrumbNavProps {
  currentView: AppView;
  navigateTo: (view: AppView) => void;
  activeSidebarSection?: string;
  setActiveSidebarSection?: (section: string) => void;
  portfolioCategories?: PortfolioCategory[];
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  currentView,
  navigateTo,
}) => {

  return (
    <nav 
      aria-label="Breadcrumb navigation path"
      className="bg-[#023625]/[0.03] border-b border-border/70 py-2 sm:py-2.5 px-4 sm:px-8 lg:px-12 transition-all"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 flex-wrap text-xs font-sans text-ash">
        
        {/* Mobile Compact Single-Line Breadcrumb: Services / [Sub-page] */}
        <div className="sm:hidden flex items-center gap-1.5 text-[11.5px] font-sans">
          {['consulting', 'process_implementation', 'training', 'certifications'].includes(currentView) ? (
            <>
              <button
                onClick={() => {
                  navigateTo('home');
                  setTimeout(() => {
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="text-charcoal hover:text-[#B68A35] font-medium transition-colors cursor-pointer shrink-0"
              >
                Services
              </button>
              <span className="text-ash/60 shrink-0">/</span>
            </>
          ) : (
            <>
              <button
                onClick={() => navigateTo('home')}
                className="text-charcoal hover:text-[#B68A35] font-medium transition-colors cursor-pointer shrink-0"
              >
                Home
              </button>
              <span className="text-ash/60 shrink-0">/</span>
            </>
          )}
          <span className="font-semibold text-[#023625] truncate">
            {currentView === 'training' && 'Professional Training'}
            {currentView === 'certifications' && 'Certification Preparation'}
            {currentView === 'consulting' && 'Consulting & Advisory'}
            {currentView === 'process_implementation' && 'Business Process Implementation'}
            {currentView === 'calendar' && 'Course Availability'}
            {currentView === 'knowledge' && 'Knowledge Centre'}
            {currentView === 'contact' && 'Contact & Advisory Desk'}
            {currentView === 'privacy' && 'Privacy Notice'}
            {currentView === 'home' && 'Institutional Overview'}
          </span>
        </div>

        {/* Desktop Full Breadcrumb Trail */}
        <ol className="hidden sm:flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Home Node */}
          <li>
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-1.5 text-charcoal hover:text-[#B68A35] transition-colors font-medium cursor-pointer group"
              title="Return to Yitzak Home Overview"
            >
              <Home size={13} className="text-[#023625] group-hover:text-[#B68A35] transition-colors shrink-0" />
              <span className="font-serif font-bold text-xs text-[#023625] group-hover:text-[#B68A35]">Home</span>
            </button>
          </li>

          {/* Breadcrumb path according to currentView */}
          {currentView === 'home' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#B68A35] bg-[#B68A35]/10 px-2 py-0.5 rounded-full border border-[#B68A35]/20">
                  Institutional Overview
                </span>
              </li>
            </>
          )}

          {['consulting', 'process_implementation', 'training', 'certifications'].includes(currentView) && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <button
                  onClick={() => {
                    navigateTo('home');
                    setTimeout(() => {
                      const el = document.getElementById('services');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="hover:text-[#B68A35] transition-colors font-medium cursor-pointer text-charcoal"
                >
                  Services
                </button>
              </li>
            </>
          )}

          {/* Training */}
          {currentView === 'training' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-[#B68A35]" />
                  <span>Professional Training</span>
                </span>
              </li>
            </>
          )}

          {currentView === 'certifications' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <Award size={13} className="text-[#B68A35]" />
                  <span>Certification Preparation</span>
                </span>
              </li>
            </>
          )}

          {currentView === 'consulting' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <Headphones size={13} className="text-[#B68A35]" />
                  <span>Consulting &amp; Advisory</span>
                </span>
              </li>
            </>
          )}

          {currentView === 'process_implementation' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <Workflow size={13} className="text-[#B68A35]" />
                  <span>Business Process Implementation</span>
                </span>
              </li>
            </>
          )}

          {currentView === 'calendar' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#B68A35]" />
                  <span>Training &amp; Booking Calendar</span>
                </span>
              </li>
            </>
          )}

          {currentView === 'knowledge' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <FileText size={13} className="text-[#B68A35]" />
                  <span>Knowledge Centre</span>
                </span>
              </li>
            </>
          )}

          {currentView === 'contact' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <Mail size={13} className="text-[#B68A35]" />
                  <span>Contact &amp; Advisory Desk</span>
                </span>
              </li>
            </>
          )}

          {currentView === 'privacy' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <span className="font-serif font-bold text-xs text-[#023625] bg-white border border-border px-2.5 py-1 rounded-lg shadow-2xs inline-flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#B68A35]" />
                  <span>Privacy Notice</span>
                </span>
              </li>
            </>
          )}
        </ol>

      </div>
    </nav>
  );
};

export default BreadcrumbNav;
