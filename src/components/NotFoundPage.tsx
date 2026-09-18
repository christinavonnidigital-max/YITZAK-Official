import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Calendar, 
  Award, 
  BookOpen, 
  Headphones, 
  ArrowRight, 
  Compass, 
  AlertCircle,
  Shield,
  FileQuestion,
  Sparkles
} from 'lucide-react';
import type { AppView } from '../lib/routes';

interface NotFoundPageProps {
  onNavigate: (view: AppView, elementId?: string) => void;
  attemptedPath?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate, attemptedPath }) => {
  const currentPath = attemptedPath || (typeof window !== 'undefined' ? window.location.pathname : '');
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    {
      title: '2026 Training Calendar',
      desc: 'Scheduled ISO, HACCP, FSSC & Lead Auditor course dates across Southern Africa.',
      view: 'calendar' as AppView,
      icon: Calendar,
      badge: 'Live Schedules'
    },
    {
      title: 'Certification Preparation',
      desc: 'Gap assessments and advisory for ISO 9001, 14001, 45001, 22000, and BRCGS.',
      view: 'certifications' as AppView,
      icon: Award,
      badge: 'Standards'
    },
    {
      title: 'Technical Knowledge Centre',
      desc: 'Free downloadable whitepapers, standard transition guides, and checklists.',
      view: 'knowledge' as AppView,
      icon: BookOpen,
      badge: 'Free Guides'
    },
    {
      title: 'Management Consulting & Advisory',
      desc: 'SOP mapping, governance frameworks, and internal audit support.',
      view: 'consulting' as AppView,
      icon: Headphones,
      badge: 'Consultancy'
    }
  ];

  const filteredLinks = searchQuery.trim()
    ? quickLinks.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickLinks;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    if (query.includes('calendar') || query.includes('date') || query.includes('schedule')) {
      onNavigate('calendar');
    } else if (query.includes('train') || query.includes('course') || query.includes('auditor')) {
      onNavigate('training');
    } else if (query.includes('cert') || query.includes('iso') || query.includes('brc') || query.includes('fssc')) {
      onNavigate('certifications');
    } else if (query.includes('whitepaper') || query.includes('guide') || query.includes('know')) {
      onNavigate('knowledge');
    } else if (query.includes('contact') || query.includes('quote') || query.includes('book')) {
      onNavigate('contact');
    } else {
      onNavigate('calendar');
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F9FAF8] flex flex-col justify-center py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Top Institutional Badge */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#023625]/10 border border-[#023625]/20 text-[#023625] text-xs font-semibold tracking-wider uppercase">
            <AlertCircle size={14} className="text-[#B68A35]" />
            <span>404 HTTP Error &bull; Resource Not Located</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#023625] tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
              The compliance standard, course syllabus, or advisory URL you requested is not available or has been updated in our 2026 schedule.
            </p>
          </div>

          {/* Requested URL info chip */}
          {currentPath && currentPath !== '/' && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-gray-100 border border-gray-200 text-xs text-gray-500 font-mono max-w-full overflow-hidden text-ellipsis">
              <FileQuestion size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">Requested: {currentPath}</span>
            </div>
          )}
        </div>

        {/* Search Helper */}
        <div className="mt-8 max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400 pointer-events-none" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standards (e.g., ISO 9001, FSSC 22000, Training, Audits)..."
              className="w-full pl-11 pr-28 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#023625] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-[#023625] hover:bg-[#022B1E] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Search</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* Direct Destination Cards */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-500 flex items-center gap-2">
              <Compass size={14} className="text-[#B68A35]" />
              <span>Recommended Yitzak Directories</span>
            </h2>
            <span className="text-xs text-gray-400">Select an area to continue</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => onNavigate(item.view)}
                  className="group text-left p-5 bg-white hover:bg-emerald-50/40 rounded-xl border border-gray-200 hover:border-[#023625]/30 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-[#023625]/5 group-hover:bg-[#023625] text-[#023625] group-hover:text-white flex items-center justify-center transition-colors">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600 group-hover:bg-[#023625]/10 group-hover:text-[#023625]">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-gray-900 group-hover:text-[#023625] text-base transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-sans leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1 text-xs font-semibold text-[#023625] group-hover:text-[#B68A35] transition-colors">
                    <span>Explore Section</span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-[#023625] hover:bg-[#022B1E] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Home size={16} />
            <span>Return to Homepage</span>
          </button>

          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Headphones size={16} className="text-[#B68A35]" />
            <span>Contact Advisory Desk</span>
          </button>
        </div>

        {/* Institutional Contact Bar */}
        <div className="mt-12 bg-white rounded-xl border border-gray-200 p-4 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Shield size={14} className="text-[#023625]" />
            <span>Yitzak Consulting (Pty) Ltd</span>
          </div>
          <span className="hidden sm:inline text-gray-300">&bull;</span>
          <span>Johannesburg, Gauteng &amp; Harare</span>
          <span className="hidden sm:inline text-gray-300">&bull;</span>
          <a href="mailto:info@yitzak.co.za" className="text-[#023625] hover:underline font-medium">
            info@yitzak.co.za
          </a>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
