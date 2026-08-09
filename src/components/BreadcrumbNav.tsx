import React, { useState } from 'react';
import { Home, ChevronRight, ChevronDown, GraduationCap, ShieldCheck, Award, Sliders, Workflow, Calendar, Mail, FileText } from 'lucide-react';

interface PortfolioCategory {
  id: string;
  label: string;
  title: string;
}

interface BreadcrumbNavProps {
  currentView: 'home' | 'consulting' | 'training' | 'certifications' | 'calendar' | 'contact' | 'process_implementation';
  navigateTo: (view: 'home' | 'consulting' | 'training' | 'certifications' | 'calendar' | 'contact' | 'process_implementation') => void;
  activeSidebarSection?: string;
  setActiveSidebarSection?: (section: string) => void;
  portfolioCategories?: PortfolioCategory[];
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  currentView,
  navigateTo,
  activeSidebarSection = 'food-safety',
  setActiveSidebarSection,
  portfolioCategories = []
}) => {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const activeCategory = portfolioCategories.find(c => c.id === activeSidebarSection);
  const activeCategoryLabel = activeCategory ? activeCategory.label : 'Food Safety';

  return (
    <nav 
      aria-label="Breadcrumb navigation path"
      className="bg-[#023625]/[0.03] border-b border-border/70 py-2.5 px-4 sm:px-8 lg:px-12 transition-all"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 flex-wrap text-xs font-sans text-ash">
        
        {/* Main Breadcrumb Trail */}
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
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
                  onClick={() => navigateTo('consulting')}
                  className="hover:text-[#B68A35] transition-colors font-medium cursor-pointer text-charcoal"
                >
                  Services
                </button>
              </li>
            </>
          )}

          {/* Training & Certifications branch under Capability Building */}
          {['training', 'certifications'].includes(currentView) && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <button
                  onClick={() => navigateTo('training')}
                  className="hover:text-[#B68A35] transition-colors font-medium cursor-pointer text-charcoal flex items-center gap-1"
                >
                  <GraduationCap size={13} className="text-[#B68A35] shrink-0" />
                  <span>Capability Building</span>
                </button>
              </li>
            </>
          )}

          {/* Consulting & Process Implementation branch under Advisory */}
          {['consulting', 'process_implementation'].includes(currentView) && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <button
                  onClick={() => navigateTo('consulting')}
                  className="hover:text-[#B68A35] transition-colors font-medium cursor-pointer text-charcoal flex items-center gap-1"
                >
                  <ShieldCheck size={13} className="text-[#B68A35] shrink-0" />
                  <span>Advisory</span>
                </button>
              </li>
            </>
          )}

          {/* Specific View Leaf Nodes */}
          {currentView === 'training' && (
            <>
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li>
                <button
                  onClick={() => navigateTo('training')}
                  className="font-medium hover:text-[#B68A35] text-charcoal transition-colors cursor-pointer"
                >
                  Professional Training
                </button>
              </li>

              {/* Active Category Selector inside Breadcrumbs */}
              <li className="flex items-center">
                <ChevronRight size={13} className="text-ash/50 shrink-0" />
              </li>
              <li className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="inline-flex items-center gap-1.5 font-serif font-bold text-xs text-[#023625] bg-white border border-[#B68A35]/40 hover:border-[#B68A35] px-2.5 py-1 rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  <span>{activeCategoryLabel}</span>
                  <ChevronDown size={12} className={`text-[#B68A35] transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown for categories */}
                {categoryDropdownOpen && portfolioCategories.length > 0 && (
                  <div 
                    className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-border/80 p-1.5 z-50 space-y-0.5 animate-fadeIn"
                    onMouseLeave={() => setCategoryDropdownOpen(false)}
                  >
                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-ash px-2 py-1 border-b border-border/40 mb-1">
                      Switch Training Discipline
                    </div>
                    {portfolioCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (setActiveSidebarSection) setActiveSidebarSection(cat.id);
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans transition-colors flex items-center justify-between cursor-pointer ${
                          cat.id === activeSidebarSection
                            ? 'bg-[#023625] text-white font-bold'
                            : 'text-charcoal hover:bg-mist'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {cat.id === activeSidebarSection && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B68A35]"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
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
                  <span>Certification Support</span>
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
                  <Sliders size={13} className="text-[#B68A35]" />
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
        </ol>

        {/* Quick Context Tag / Standard Status indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-ash/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GFSI &amp; ISO Aligned Frameworks</span>
        </div>

      </div>
    </nav>
  );
};

export default BreadcrumbNav;
