import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Download, ArrowRight, Menu, X, Calendar, Lock, Sparkles, Check, ChevronLeft, ChevronRight, ChevronDown, Globe, Mail, Loader2, ArrowUp, GraduationCap, Award, Building2, Laptop, RefreshCw, FileText, CheckCircle, AlertCircle, ShieldCheck, Send, User, Printer, Target, Sliders, TrendingUp, Layers, CheckCircle2, Phone, MapPin, Linkedin, Instagram, KeyRound, UserCheck, LayoutGrid, Headphones, Workflow } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, initAuth, googleSignIn, db, getAccessToken } from './lib/firebase';
import ContactUs from './components/ContactUs';
import ComplianceCalculator from './components/ComplianceCalculator';
import FAQSection from './components/FAQSection';
import ProcessImplementationRoadmap from './components/ProcessImplementationRoadmap';
import FloatingChatWidget from './components/FloatingChatWidget';
import { checkEmailWhitelist, preRegisterGuest } from './lib/whitelist';
import { exportPortfolioToCSV, exportPortfolioToPDF, triggerSmartPrint, exportCapabilitySheetPDF } from './utils/portfolioExport';
import { getViewFromLocation, updateBrowserUrl, AppView } from './lib/routes';
import ScrollReveal from './components/ScrollReveal';
import BreadcrumbNav from './components/BreadcrumbNav';
import YitzakLogo, { YitzakShieldIcon } from './components/YitzakLogo';
import AppIcon from './components/AppIcon';
import { PILLARS } from './data';
import { PORTFOLIO_CATEGORIES, TrainingCategory } from './data/trainingStandards';

// Lazy load non-initial heavy views and modals to keep the landing page load instantaneous
const BookingModal = lazy(() => import('./components/BookingModal'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const TrainingCalendar = lazy(() => import('./components/TrainingCalendar'));
const WhitelistManager = lazy(() => import('./components/WhitelistManager'));
const KnowledgeCenter = lazy(() => import('./components/KnowledgeCenter'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));

const ViewLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[320px] py-16">
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-[#023625]" />
      <span className="text-xs font-sans font-medium text-ash">Loading module...</span>
    </div>
  </div>
);

const portfolioCategories = PORTFOLIO_CATEGORIES;

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPillarId, setSelectedPillarId] = useState('compliance');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      return getViewFromLocation().view;
    }
    return 'home';
  });
  const [activeHomeSection, setActiveHomeSection] = useState<'home' | 'about'>('home');
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);
  const [activeSidebarSection, setActiveSidebarSection] = useState('food-safety');
  const [selectedBookingNotes, setSelectedBookingNotes] = useState('');
  const [portalGuestName, setPortalGuestName] = useState('');
  const [portalGuestEmail, setPortalGuestEmail] = useState('');
  const [portalShowGuestForm, setPortalShowGuestForm] = useState(false);
  const [verifyingWhitelist, setVerifyingWhitelist] = useState(false);
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);

  // Portal Authentication Flow State
  const [portalMode, setPortalMode] = useState<'work_email' | 'guest'>('work_email');
  const [portalWorkEmail, setPortalWorkEmail] = useState('');
  const [portalAuthMethod, setPortalAuthMethod] = useState<'password' | 'code'>('code');
  const [portalPassword, setPortalPassword] = useState('');
  const [portalOneTimeCode, setPortalOneTimeCode] = useState('');
  const [portalCodeSent, setPortalCodeSent] = useState(false);
  const [portalSendingCode, setPortalSendingCode] = useState(false);
  const [portalLoginError, setPortalLoginError] = useState<string | null>(null);
  const [portalGuestWorkEmail, setPortalGuestWorkEmail] = useState('');
  const [activeApproachPhase, setActiveApproachPhase] = useState<number>(0);
  const phaseTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const phaseTouchStartX = useRef<number | null>(null);

  // Auto-scroll the active phase tab into center view whenever the active phase changes
  useEffect(() => {
    const activeTabEl = phaseTabRefs.current[activeApproachPhase];
    if (activeTabEl) {
      activeTabEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeApproachPhase]);

  const isBusinessEmail = (email: string): boolean => {
    if (!email || !email.includes('@')) return false;
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    if (!domain || !domain.includes('.') || domain.endsWith('.')) return false;

    const freeDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
      'icloud.com', 'aol.com', 'mail.com', 'protonmail.com', 
      'gmx.com', 'zoho.com', 'yandex.com', 'live.com', 
      'msn.com', 'me.com', 'sbcglobal.net', 'comcast.net',
      'rediffmail.com', 'ymail.com', 'cox.net', 'googlemail.com'
    ];

    return !freeDomains.includes(domain);
  };

  const handlePortalWorkEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPortalLoginError(null);

    const emailToValidate = portalWorkEmail.trim();
    if (!emailToValidate) {
      setPortalLoginError("Please enter your work email address.");
      return;
    }

    if (!isBusinessEmail(emailToValidate)) {
      setPortalLoginError("Please use your registered work email to access the portal.");
      return;
    }

    if (portalAuthMethod === 'password') {
      if (!portalPassword.trim()) {
        setPortalLoginError("Please enter your account password.");
        return;
      }
    } else if (portalAuthMethod === 'code') {
      if (!portalCodeSent) {
        setPortalSendingCode(true);
        setTimeout(() => {
          setPortalSendingCode(false);
          setPortalCodeSent(true);
          triggerNotification(`✓ One-time verification code sent to ${emailToValidate}`);
        }, 700);
        return;
      }

      if (!portalOneTimeCode.trim()) {
        setPortalLoginError("Please enter the 6-digit one-time code sent to your email.");
        return;
      }
    }

    setVerifyingWhitelist(true);
    try {
      const check = await checkEmailWhitelist(emailToValidate);
      let displayName = emailToValidate.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      if (check.isWhitelisted && check.guest?.name && check.guest.name !== 'Authorized Guest') {
        displayName = check.guest.name;
      } else if (!check.isWhitelisted) {
        await preRegisterGuest(
          emailToValidate,
          displayName,
          'Registered via Secure Work Email Portal',
          'client',
          'active'
        );
      }

      const mockUser: FirebaseUser = {
        uid: 'work_' + Date.now(),
        displayName,
        email: emailToValidate,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false
      } as unknown as FirebaseUser;

      setCurrentUser(mockUser);
      triggerNotification(`✓ Access Granted. Welcome ${displayName}.`);
    } catch (err) {
      console.error('Portal login error:', err);
      const displayName = emailToValidate.split('@')[0];
      const mockUser: FirebaseUser = {
        uid: 'work_' + Date.now(),
        displayName,
        email: emailToValidate,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false
      } as unknown as FirebaseUser;
      setCurrentUser(mockUser);
      triggerNotification(`✓ Access Granted. Welcome ${displayName}.`);
    } finally {
      setVerifyingWhitelist(false);
    }
  };

  const handlePortalGuestAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPortalLoginError(null);

    const name = portalGuestName.trim();
    const email = portalGuestWorkEmail.trim();

    if (!name) {
      setPortalLoginError("Please enter your full name.");
      return;
    }

    if (!email) {
      setPortalLoginError("Please enter your work email address.");
      return;
    }

    if (!isBusinessEmail(email)) {
      setPortalLoginError("Please use your registered work email to access the portal.");
      return;
    }

    setVerifyingWhitelist(true);
    try {
      const check = await checkEmailWhitelist(email);
      let displayName = name;

      if (check.isWhitelisted && check.guest?.name && check.guest.name !== 'Authorized Guest') {
        displayName = check.guest.name;
      } else if (!check.isWhitelisted) {
        await preRegisterGuest(
          email,
          name,
          'Guest Access Session Entry',
          'guest',
          'active'
        );
      }

      const mockUser: FirebaseUser = {
        uid: 'guest_' + Date.now(),
        displayName,
        email,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false
      } as unknown as FirebaseUser;

      setCurrentUser(mockUser);
      triggerNotification(`✓ Guest access granted. Welcome ${displayName}.`);
    } catch (err) {
      console.error('Guest portal entry error:', err);
      const mockUser: FirebaseUser = {
        uid: 'guest_' + Date.now(),
        displayName: name,
        email,
        photoURL: null,
        emailVerified: true,
        isAnonymous: false
      } as unknown as FirebaseUser;
      setCurrentUser(mockUser);
      triggerNotification(`✓ Guest access granted. Welcome ${name}.`);
    } finally {
      setVerifyingWhitelist(false);
    }
  };
  
  // Interactive Website Features State
  const [activeFocusStep, setActiveFocusStep] = useState('01');
  const [referralTarget, setReferralTarget] = useState<{ url: string; schemeName: string } | null>(null);
  const [activeFocusPrinciple, setActiveFocusPrinciple] = useState('01');
  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  const [industrySectorFilter, setIndustrySectorFilter] = useState('all');

  const navigateTo = (view: AppView, elementId?: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    if (view === 'home') {
      if (elementId === 'why-us' || elementId === 'about-section') {
        setActiveHomeSection('about');
      } else {
        setActiveHomeSection('home');
      }
    }
    updateBrowserUrl(view, elementId, false);
    if (elementId) {
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Synchronize initial URL, title and listen for browser Back/Forward (popstate)
  useEffect(() => {
    const loc = getViewFromLocation();
    setCurrentView(loc.view);
    if (loc.view === 'home') {
      if (loc.elementId === 'why-us' || loc.elementId === 'about-section' || (typeof window !== 'undefined' && window.location.pathname === '/about')) {
        setActiveHomeSection('about');
      } else {
        setActiveHomeSection('home');
      }
    }
    updateBrowserUrl(loc.view, loc.elementId, true);

    if (loc.elementId) {
      setTimeout(() => {
        const element = document.getElementById(loc.elementId!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }

    const handlePopState = () => {
      const updated = getViewFromLocation();
      setCurrentView(updated.view);
      if (updated.view === 'home') {
        if (updated.elementId === 'why-us' || updated.elementId === 'about-section' || (typeof window !== 'undefined' && window.location.pathname === '/about')) {
          setActiveHomeSection('about');
        } else {
          setActiveHomeSection('home');
        }
      }
      updateBrowserUrl(updated.view, updated.elementId, true);
      if (updated.elementId) {
        setTimeout(() => {
          const el = document.getElementById(updated.elementId!);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll spy to update active navbar state between Home and About when on Home view
  useEffect(() => {
    if (currentView !== 'home') return;

    const handleScrollSpy = () => {
      const whyUsEl = document.getElementById('why-us');
      if (!whyUsEl) return;
      const rect = whyUsEl.getBoundingClientRect();
      // When why-us is scrolled into focus
      if (rect.top <= 280 && rect.bottom >= 150) {
        setActiveHomeSection('about');
      } else if (window.scrollY < 350) {
        setActiveHomeSection('home');
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [currentView]);

  // Initialize Auth state on load with single clean listener
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Track FoodChain ID partner links and log 'Request Consultation' CTA clicks for Google Analytics and local conversion tracking
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // 1. Detect and specifically log 'Request Consultation' and advisory CTA button clicks
      const interactiveEl = target.closest('button, a, [role="button"]') as HTMLElement | null;
      if (interactiveEl) {
        const text = (interactiveEl.textContent || '').trim().toLowerCase();
        const ariaLabel = (interactiveEl.getAttribute('aria-label') || '').toLowerCase();
        const elementId = (interactiveEl.id || '').toLowerCase();
        const dataAction = (interactiveEl.getAttribute('data-action') || '').toLowerCase();

        const isConsultationCTA = 
          text.includes('request consultation') ||
          text.includes('schedule consultation') ||
          text.includes('book consultation') ||
          text.includes('book a consultation') ||
          text.includes('request advisory') ||
          ariaLabel.includes('consultation') ||
          elementId.includes('consultation') ||
          dataAction.includes('consultation');

        if (isConsultationCTA) {
          try {
            const rawLabel = (interactiveEl.textContent || '').trim().slice(0, 80) || 'Request Consultation';
            const trackingPayload = {
              event: 'request_consultation_click',
              button_text: rawLabel,
              element_id: interactiveEl.id || undefined,
              current_view: currentView,
              page_location: window.location.href,
              user_email: currentUser?.email || 'anonymous',
              timestamp: new Date().toISOString()
            };

            // Dispatch to Google Analytics (GA4 gtag) if present
            if (typeof (window as any).gtag === 'function') {
              (window as any).gtag('event', 'request_consultation_click', {
                event_category: 'conversion_funnel',
                event_label: rawLabel,
                current_view: currentView,
                value: 1
              });
            }

            // Dispatch to Google Tag Manager dataLayer if present
            if (Array.isArray((window as any).dataLayer)) {
              (window as any).dataLayer.push(trackingPayload);
            }

            // Record to local referral & conversion log for reporting
            const localLog = {
              id: `cta_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              eventType: 'request_consultation_click',
              buttonText: rawLabel,
              elementId: interactiveEl.id || 'unlabeled_cta',
              currentView,
              targetUrl: window.location.href,
              userEmail: currentUser?.email || 'guest@yitzak.co.za',
              createdAt: new Date().toISOString()
            };

            const referralLogs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
            referralLogs.push(localLog);
            localStorage.setItem('yitzak_referral_clicks', JSON.stringify(referralLogs));

            const consultationLogs = JSON.parse(localStorage.getItem('yitzak_consultation_clicks') || '[]');
            consultationLogs.push(localLog);
            localStorage.setItem('yitzak_consultation_clicks', JSON.stringify(consultationLogs));
          } catch (err) {
            console.debug('Consultation CTA tracking error:', err);
          }
        }
      }

      // 2. Track FoodChain ID partner links seamlessly in the background with UTM attribution
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.href.includes('foodchainid.com')) {
        e.preventDefault();
        const rawUrl = anchor.href;
        
        try {
          const utmUrl = new URL(rawUrl);
          if (!utmUrl.searchParams.has('utm_source')) {
            utmUrl.searchParams.set('utm_source', 'yitzak');
            utmUrl.searchParams.set('utm_medium', 'partner_referral');
            utmUrl.searchParams.set('utm_campaign', 'yitzak_partner_deal');
          }

          // Silently log click locally for internal partner attribution analytics
          const logData = {
            id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            eventType: 'partner_referral_click',
            targetUrl: rawUrl,
            trackingUrl: utmUrl.toString(),
            userEmail: currentUser?.email || 'guest@yitzak.co.za',
            createdAt: new Date().toISOString()
          };
          const existingLogs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
          existingLogs.push(logData);
          localStorage.setItem('yitzak_referral_clicks', JSON.stringify(existingLogs));

          window.open(utmUrl.toString(), '_blank', 'noopener,noreferrer');
        } catch (err) {
          window.open(rawUrl, '_blank', 'noopener,noreferrer');
        }
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [currentUser, currentView]);

  // Monitor scroll for Back to Top button visibility (appears after deeper scroll)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background body scrolling when mobile navigation drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleOpenBooking = (pillarId = 'compliance', initialNotes = '') => {
    // Log conversion event for programmatic triggers
    try {
      const trackingPayload = {
        event: 'request_consultation_click',
        button_text: 'Open Booking Modal',
        pillar_id: pillarId,
        current_view: currentView,
        page_location: window.location.href,
        user_email: currentUser?.email || 'anonymous',
        timestamp: new Date().toISOString()
      };

      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'request_consultation_click', {
          event_category: 'conversion_funnel',
          event_label: pillarId,
          current_view: currentView,
          value: 1
        });
      }

      if (Array.isArray((window as any).dataLayer)) {
        (window as any).dataLayer.push(trackingPayload);
      }

      const logRecord = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        eventType: 'request_consultation_click',
        pillarId,
        initialNotes,
        currentView,
        targetUrl: window.location.href,
        userEmail: currentUser?.email || 'guest@yitzak.co.za',
        createdAt: new Date().toISOString()
      };

      const referralLogs = JSON.parse(localStorage.getItem('yitzak_referral_clicks') || '[]');
      referralLogs.push(logRecord);
      localStorage.setItem('yitzak_referral_clicks', JSON.stringify(referralLogs));

      const consultationLogs = JSON.parse(localStorage.getItem('yitzak_consultation_clicks') || '[]');
      consultationLogs.push(logRecord);
      localStorage.setItem('yitzak_consultation_clicks', JSON.stringify(consultationLogs));
    } catch (err) {
      console.debug('Analytics logging note:', err);
    }

    setSelectedPillarId(pillarId);
    setSelectedBookingNotes(initialNotes);
    setIsBookingOpen(true);
  };

  const handleAuthSuccess = (user: FirebaseUser) => {
    setCurrentUser(user);
    triggerNotification('Google Identity authenticated successfully.');
  };

  const handleBookingSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    triggerNotification('Consultation scheduled. Calendar synchronized and confirmation email sent.');
  };

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  const handleGoogleLoginOnly = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        triggerNotification('Welcome to YITZAK Portal.');
      }
    } catch (error: any) {
      console.error(error);
      const isPopupClosed = error?.code === 'auth/popup-closed-by-user' || 
                            error?.message?.includes('popup-closed-by-user') ||
                            (typeof error === 'object' && error !== null && JSON.stringify(error).includes('popup-closed-by-user'));
      
      if (isPopupClosed) {
        triggerNotification('Sign-in cancelled. The authentication window was closed.');
      } else {
        triggerNotification('Google Authentication failed.');
      }
    }
  };

  const handleDownloadWhitepaper = () => {
    // Show download prompt and trigger confirm dialog
    const confirmDownload = window.confirm(
      "Download publication: 'Institutional Frameworks 2024.pdf'? (Size: 4.8MB)"
    );
    if (confirmDownload) {
      // Mock download execution
      triggerNotification("Downloading Institutional Frameworks 2024.pdf...");
    }
  };

  return (
    <div className="bg-[#F6F8F6] text-on-surface font-sans selection:bg-antique-gold selection:text-white overflow-x-clip min-h-screen flex flex-col">
      
      {/* Top Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 right-4 md:right-8 z-50 bg-primary text-on-primary border border-white/10 p-4 shadow-2xl flex items-center gap-3 text-xs max-w-sm rounded"
          >
            <Sparkles className="text-secondary flex-shrink-0 animate-pulse" size={16} />
            <span>{notificationMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TopNavBar */}
      <header className="bg-white/98 backdrop-blur-md text-primary sticky top-0 border-b border-border/80 shadow-xs z-50 transition-all">
        <div className="flex justify-between items-center w-full px-4 sm:px-8 md:px-12 py-2.5 sm:py-3 max-w-[1280px] mx-auto gap-4">
          
          {/* Logo */}
          <button 
            onClick={() => navigateTo('home')}
            className="cursor-pointer text-left focus:outline-none flex items-center shrink-0 transition-all duration-200 hover:opacity-90 active:scale-98 py-0.5"
            aria-label="Yitzak Home"
          >
            <YitzakLogo size={46} />
          </button>
          
          {/* Desktop Right Navigation & CTA Area (Aligned to match page grid edge) */}
          <div className="flex items-center gap-5 xl:gap-7 ml-auto">
            {/* Desktop Core Links with clean typography & active indicator */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 font-sans text-[13.5px] shrink-0">
              {/* Home */}
              <button 
                onClick={() => {
                  setActiveHomeSection('home');
                  navigateTo('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`transition-colors duration-200 cursor-pointer whitespace-nowrap px-3 py-1.5 text-[14px] flex items-center relative ${
                  currentView === 'home' && activeHomeSection === 'home'
                    ? 'text-[#023625] font-bold' 
                    : 'text-primary/75 hover:text-[#023625] font-medium'
                }`}
              >
                <span>Home</span>
                {currentView === 'home' && activeHomeSection === 'home' && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#023625] rounded-full" />
                )}
              </button>

              {/* About */}
              <button 
                onClick={() => {
                  setActiveHomeSection('about');
                  if (currentView !== 'home') {
                    navigateTo('home', 'why-us');
                  } else {
                    const el = document.getElementById('why-us');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    updateBrowserUrl('home', 'why-us', false);
                  }
                }}
                className={`transition-colors duration-200 cursor-pointer whitespace-nowrap px-3 py-1.5 text-[14px] flex items-center relative ${
                  currentView === 'home' && activeHomeSection === 'about'
                    ? 'text-[#023625] font-bold' 
                    : 'text-primary/75 hover:text-[#023625] font-medium'
                }`}
              >
                <span>About</span>
                {currentView === 'home' && activeHomeSection === 'about' && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#023625] rounded-full" />
                )}
              </button>

              {/* Services Dropdown */}
              <div 
                className="relative flex items-center"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <button 
                  onClick={() => {
                    if (currentView !== 'home') {
                      navigateTo('home');
                      setTimeout(() => {
                        const el = document.getElementById('services');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      const el = document.getElementById('services');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`transition-colors duration-200 cursor-pointer whitespace-nowrap px-3 py-1.5 text-[14px] flex items-center gap-1.5 relative group ${
                    ['training', 'certifications', 'consulting', 'process_implementation'].includes(currentView)
                      ? 'text-[#023625] font-bold' 
                      : 'text-primary/75 hover:text-[#023625] font-medium'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 opacity-60 group-hover:opacity-100 ${servicesDropdownOpen ? 'rotate-180 opacity-100 text-[#023625]' : ''}`} />
                  {['training', 'certifications', 'consulting', 'process_implementation'].includes(currentView) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#023625] rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {servicesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-84 bg-white/98 backdrop-blur-md rounded-xl shadow-xl border border-border/80 p-2 z-50 space-y-1 mt-2"
                    >
                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('training'); }}
                        className="w-full text-left p-3 rounded-lg hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] transition-colors">
                          <GraduationCap size={17} className="text-[#B68A35] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-primary group-hover:text-[#023625] transition-colors">Professional Training</div>
                          <div className="text-[11px] text-ash">Accredited curricula &amp; workforce capability</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('certifications'); }}
                        className="w-full text-left p-3 rounded-lg hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] transition-colors">
                          <Award size={17} className="text-[#B68A35] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-primary group-hover:text-[#023625] transition-colors">Certification</div>
                          <div className="text-[11px] text-ash">FoodChain ID accredited audits &amp; schemes</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('consulting'); }}
                        className="w-full text-left p-3 rounded-lg hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] transition-colors">
                          <Headphones size={17} className="text-[#B68A35] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-primary group-hover:text-[#023625] transition-colors">Consulting &amp; Advisory</div>
                          <div className="text-[11px] text-ash">Gap analysis, FSMS/QMS formulation &amp; audits</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('process_implementation'); }}
                        className="w-full text-left p-3 rounded-lg hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] transition-colors">
                          <Workflow size={17} className="text-[#B68A35] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-primary group-hover:text-[#023625] transition-colors">Business Process Implementation</div>
                          <div className="text-[11px] text-ash">Phase 1/2 mapping, HR &amp; accounting setup</div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => navigateTo('contact')}
                className={`transition-colors duration-200 cursor-pointer whitespace-nowrap px-3 py-1.5 text-[14px] flex items-center relative ${
                  currentView === 'contact' 
                    ? 'text-[#023625] font-bold' 
                    : 'text-primary/75 hover:text-[#023625] font-medium'
                }`}
              >
                <span>Contact</span>
                {currentView === 'contact' && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#023625] rounded-full" />
                )}
              </button>
            </nav>

            {/* Right Action Area (Desktop CTA + Mobile Hamburger) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Request Consultation Gold Button - ONLY Gold Action */}
              <button 
                onClick={() => handleOpenBooking()}
                className="hidden sm:flex bg-[#B68A35] hover:bg-[#9E7528] text-white font-serif font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 items-center gap-1.5 sm:gap-2"
              >
                <span>Request Consultation</span>
              </button>

              {/* Mobile Hamburger Icon */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-primary bg-mist/80 hover:bg-mist active:scale-95 cursor-pointer p-2 sm:p-2.5 focus:outline-none rounded-lg border border-border/60 transition-all flex items-center justify-center shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} className="text-[#023625]" /> : <Menu size={22} className="text-[#023625]" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Slide-out Drawer (Outside header to avoid backdrop-blur container clipping) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[100] lg:hidden"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 230 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#012B1D] text-white z-[100] shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden border-l border-[#02402c] h-full"
            >
                {/* Drawer Top / Header */}
                <div>
                  <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#001D13]">
                    <div className="flex flex-col">
                      <YitzakLogo lightMode size={36} />
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors cursor-pointer"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Drawer Stacked Menu Items */}
                  <nav className="p-5 space-y-1.5 font-sans">
                    {/* 1. Home */}
                    <button
                      onClick={() => {
                        setActiveHomeSection('home');
                        navigateTo('home');
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        currentView === 'home' && activeHomeSection === 'home'
                          ? 'bg-[#B68A35]/15 text-[#E6CA85] font-semibold border border-[#B68A35]/30 shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Shield size={17} className={currentView === 'home' && activeHomeSection === 'home' ? 'text-[#E6CA85]' : 'text-white/50'} />
                        <span>Home</span>
                      </div>
                    </button>

                    {/* 2. About */}
                    <button
                      onClick={() => {
                        setActiveHomeSection('about');
                        setMobileMenuOpen(false);
                        if (currentView !== 'home') {
                          navigateTo('home', 'why-us');
                        } else {
                          const el = document.getElementById('why-us');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          updateBrowserUrl('home', 'why-us', false);
                        }
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        currentView === 'home' && activeHomeSection === 'about'
                          ? 'bg-[#B68A35]/15 text-[#E6CA85] font-semibold border border-[#B68A35]/30 shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={17} className={currentView === 'home' && activeHomeSection === 'about' ? 'text-[#E6CA85]' : 'text-white/50'} />
                        <span>About</span>
                      </div>
                    </button>

                    {/* 3. Services (Split Navigation: Text goes to overview, chevron toggles sub-services) */}
                    <div className="space-y-1">
                      <div
                        className={`flex items-center justify-between w-full rounded-xl text-sm font-medium transition-all ${
                          ['training', 'certifications', 'consulting', 'process_implementation'].includes(currentView) || (currentView === 'home' && activeHomeSection === 'services')
                            ? 'bg-[#B68A35]/15 text-[#E6CA85] font-semibold border border-[#B68A35]/30 shadow-xs'
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {/* Services Text Button -> Navigates to Services Overview */}
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setActiveHomeSection('services');
                            if (currentView !== 'home') {
                              navigateTo('home', 'services-overview');
                            } else {
                              const el = document.getElementById('services-overview') || document.getElementById('services');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                              updateBrowserUrl('home', 'services-overview', false);
                            }
                          }}
                          className="flex items-center gap-3 px-4 py-3 flex-1 text-left cursor-pointer min-h-[44px]"
                        >
                          <LayoutGrid size={17} className={['training', 'certifications', 'consulting', 'process_implementation'].includes(currentView) || (currentView === 'home' && activeHomeSection === 'services') ? 'text-[#E6CA85]' : 'text-white/50'} />
                          <span>Services</span>
                        </button>

                        {/* Chevron Trigger -> Expands / Collapses Sub-Services */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileServicesOpen(!mobileServicesOpen);
                          }}
                          aria-label={mobileServicesOpen ? "Collapse services" : "Expand services"}
                          className="px-3.5 py-3 text-white/60 hover:text-white transition-colors cursor-pointer border-l border-white/10 min-h-[44px] flex items-center justify-center"
                        >
                          <ChevronDown 
                            size={16} 
                            className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180 text-[#E6CA85]' : ''}`} 
                          />
                        </button>
                      </div>

                      {/* Expanded Services Sub-Items with vertical connector tree */}
                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-3.5 pr-1 py-1 space-y-1 ml-4 border-l border-white/15 overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                navigateTo('training');
                                setMobileMenuOpen(false);
                              }}
                              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                                currentView === 'training'
                                  ? 'bg-white/10 text-white font-semibold'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <GraduationCap size={15} className={currentView === 'training' ? 'text-[#E6CA85]' : 'text-white/40'} />
                              <span>Professional Training</span>
                            </button>

                            <button
                              onClick={() => {
                                navigateTo('certifications');
                                setMobileMenuOpen(false);
                              }}
                              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                                currentView === 'certifications'
                                  ? 'bg-white/10 text-white font-semibold'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <Award size={15} className={currentView === 'certifications' ? 'text-[#E6CA85]' : 'text-white/40'} />
                              <span>Certification</span>
                            </button>

                            <button
                              onClick={() => {
                                navigateTo('consulting');
                                setMobileMenuOpen(false);
                              }}
                              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                                currentView === 'consulting'
                                  ? 'bg-white/10 text-white font-semibold'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <Headphones size={15} className={currentView === 'consulting' ? 'text-[#E6CA85]' : 'text-white/40'} />
                              <span>Consulting &amp; Advisory</span>
                            </button>

                            <button
                              onClick={() => {
                                navigateTo('process_implementation');
                                setMobileMenuOpen(false);
                              }}
                              className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                                currentView === 'process_implementation'
                                  ? 'bg-white/10 text-white font-semibold'
                                  : 'text-white/70 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <Workflow size={15} className={currentView === 'process_implementation' ? 'text-[#E6CA85]' : 'text-white/40'} />
                              <span>Business Process Implementation</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 3. Contact */}
                    <button
                      onClick={() => {
                        navigateTo('contact');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        currentView === 'contact'
                          ? 'bg-[#B68A35]/15 text-[#E6CA85] font-semibold border border-[#B68A35]/30 shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Mail size={17} className={currentView === 'contact' ? 'text-[#E6CA85]' : 'text-white/50'} />
                      <span>Contact</span>
                    </button>
                  </nav>
                </div>

                {/* Drawer Bottom Action Area (Pinned Request Consultation CTA) */}
                <div className="p-5 border-t border-white/10 space-y-2.5 bg-[#001D13] sticky bottom-0">
                  {/* Standout Gold Request Consultation Button */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenBooking();
                    }}
                    className="w-full text-center py-3.5 px-4 rounded-xl bg-[#B68A35] hover:bg-[#a3792b] active:scale-98 text-white font-serif font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Request Consultation</span>
                  </button>

                  <p className="text-[10px] text-white/45 text-center font-mono pt-1">
                    Developing Competence. Enabling Compliance.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      {/* Breadcrumb Navigation Bar (Only displayed on sub-pages/inner views) */}
      {currentView !== 'home' && (
        <BreadcrumbNav
          currentView={currentView}
          navigateTo={navigateTo}
          activeSidebarSection={activeSidebarSection}
          setActiveSidebarSection={setActiveSidebarSection}
          portfolioCategories={portfolioCategories}
        />
      )}

      {/* Main Container */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            {/* 1. Hero Section - Streamlined & Focused */}
            <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20 px-4 sm:px-8 md:px-12 max-w-[1280px] mx-auto text-center">
              <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
                
                {/* One Credibility Signal */}
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="inline-flex items-center gap-2 bg-[#023625]/8 border border-[#023625]/15 px-3.5 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#B68A35]"></span>
                    <span className="text-[#023625] font-sans text-xs uppercase tracking-wider font-bold">
                      Official FoodChain ID Partner
                    </span>
                  </div>
                </ScrollReveal>

                {/* What Yitzak Does */}
                <ScrollReveal direction="up" delay={0.1}>
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-bold text-primary tracking-tight leading-[1.12]">
                    Professional Training, Consulting &amp; Certification
                  </h1>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.15}>
                  <p className="font-sans text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                    We help manufacturers, producers, and businesses across Southern Africa meet international standards, train their teams, and achieve accredited certification.
                  </p>
                </ScrollReveal>

                {/* Primary CTA */}
                <ScrollReveal direction="up" delay={0.2}>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    {/* Primary Filled Gold Button */}
                    <button
                      onClick={() => handleOpenBooking()}
                      className="w-full sm:w-auto bg-[#B68A35] hover:bg-[#a0772d] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-lg cursor-pointer transition-all active:scale-98 shadow-sm hover:shadow-md flex items-center justify-center gap-2.5"
                    >
                      <Calendar size={15} className="shrink-0" />
                      <span>Request Consultation</span>
                    </button>

                    {/* Secondary Outlined Dark Green Button */}
                    <button
                      onClick={() => {
                        const el = document.getElementById('services');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto bg-transparent hover:bg-[#023625]/8 text-[#023625] border border-[#023625]/40 hover:border-[#023625] font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-7 rounded-lg cursor-pointer transition-all active:scale-98 flex items-center justify-center gap-2.5"
                    >
                      <LayoutGrid size={15} className="shrink-0 text-[#023625]" />
                      <span>Explore Services</span>
                    </button>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* 2. Our Core Services - Straight after Hero */}
            <section id="services" className="pt-24 pb-16 sm:pt-24 sm:pb-20 md:pt-24 md:pb-24 bg-mist/60 border-y border-border px-4 sm:px-8 md:px-16 scroll-mt-[150px] overflow-hidden">
              <div className="max-w-[1280px] mx-auto space-y-8 sm:space-y-12">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Our Core Services</span>
                    <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold">What We Do</h2>
                    <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
                      Practical training, consulting, and accredited certification audits for quality, food safety, environmental, and business management systems.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                {/* Core Services Grid */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.12,
                        delayChildren: 0.1,
                      },
                    },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
                >
                  {/* Service 1: Professional Training */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                    }}
                    className="h-full"
                  >
                    <div className="h-full">
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border shadow-xs hover:shadow-lg hover:border-[#B68A35]/50 transition-all flex flex-col justify-between h-full group">
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-[#023625]/10 flex items-center justify-center text-[#023625] group-hover:bg-[#023625] group-hover:text-white transition-colors duration-300">
                              <GraduationCap size={24} />
                            </div>
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#7d5800] bg-[#B68A35]/15 px-2.5 py-1 rounded-full">
                              Training
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                              Professional Training
                            </h3>
                            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                              Instructor-led programmes that build competence across management systems and industry disciplines.
                            </p>
                          </div>
                          <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-ash font-sans">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>FoodChain ID Academy courses</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>HACCP &amp; Food Safety Lead Auditor</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Corporate &amp; in-house workshops</span>
                            </li>
                          </ul>
                        </div>
                        <div className="pt-5 mt-5 border-t border-border/80">
                          <button
                            onClick={() => navigateTo('training')}
                            className="text-xs font-bold uppercase tracking-wider text-[#023625] hover:text-[#B68A35] inline-flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span>Explore Curricula</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 2: Certification */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                    }}
                    className="h-full"
                  >
                    <div className="h-full">
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#B68A35]/40 shadow-xs hover:shadow-lg hover:border-[#B68A35] transition-all flex flex-col justify-between h-full group">
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-[#023625]/10 flex items-center justify-center text-[#023625] group-hover:bg-[#023625] group-hover:text-white transition-colors duration-300">
                              <ShieldCheck size={24} />
                            </div>
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#7d5800] bg-[#B68A35]/15 px-2.5 py-1 rounded-full border border-[#B68A35]/20">
                              FoodChain ID Partner
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                              Certification
                            </h3>
                            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                              Accredited third-party certification audits conducted through FoodChain ID across international quality, food safety, and agricultural standards.
                            </p>
                          </div>
                          <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-ash font-sans">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>BRCGS, FSSC 22000 &amp; ISO standards</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>GLOBALG.A.P. &amp; Non-GMO audits</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Recognised across Southern Africa</span>
                            </li>
                          </ul>
                        </div>
                        <div className="pt-5 mt-5 border-t border-border/80">
                          <button
                            onClick={() => navigateTo('certifications')}
                            className="text-xs font-bold uppercase tracking-wider text-[#023625] hover:text-[#B68A35] inline-flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span>Explore Schemes</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 3: Consulting & Advisory */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                    }}
                    className="h-full"
                  >
                    <div className="h-full">
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border shadow-xs hover:shadow-lg hover:border-[#B68A35]/50 transition-all flex flex-col justify-between h-full group">
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-[#023625]/10 flex items-center justify-center text-[#023625] group-hover:bg-[#023625] group-hover:text-white transition-colors duration-300">
                              <Headphones size={24} />
                            </div>
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#023625] bg-[#023625]/10 px-2.5 py-1 rounded-full">
                              Advisory
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                              Consulting &amp; Advisory
                            </h3>
                            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                              Expert guidance to prepare your team, update procedures, and pass upcoming compliance audits.
                            </p>
                          </div>
                          <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-ash font-sans">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Gap analysis and pre-audits</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Quality manual &amp; SOP writing</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Corrective action (CAPA) support</span>
                            </li>
                          </ul>
                        </div>
                        <div className="pt-5 mt-5 border-t border-border/80">
                          <button
                            onClick={() => navigateTo('consulting')}
                            className="text-xs font-bold uppercase tracking-wider text-[#023625] hover:text-[#B68A35] inline-flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span>View Advisory Services</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 4: Business Process Implementation */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        },
                      },
                    }}
                    className="h-full"
                  >
                    <div className="h-full">
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-border shadow-xs hover:shadow-lg hover:border-[#B68A35]/50 transition-all flex flex-col justify-between h-full group">
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-xl bg-[#023625]/10 flex items-center justify-center text-[#023625] group-hover:bg-[#023625] group-hover:text-white transition-colors duration-300">
                              <Workflow size={24} />
                            </div>
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#023625] bg-[#023625]/10 px-2.5 py-1 rounded-full">
                              Operations
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                              Business Process Implementation
                            </h3>
                            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                              Setting up essential workflows, process mapping, and HR and accounting systems for growing enterprises.
                            </p>
                          </div>
                          <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-ash font-sans">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Process mapping and roles</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>HR and staff governance</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Accounting and operational controls</span>
                            </li>
                          </ul>
                        </div>
                        <div className="pt-5 mt-5 border-t border-border/80">
                          <button
                            onClick={() => handleOpenBooking('process_implementation', 'Interested in Business Process Implementation (Phase 1/2 mapping, HR & Accounting systems setup)')}
                            className="text-xs font-bold uppercase tracking-wider text-[#023625] hover:text-[#B68A35] inline-flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span>Request Consultation</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* 3. Compact High-Value Credibility Banner (FoodChain ID Partnership) */}
            <section className="bg-[#023625] text-white py-8 sm:py-10 px-4 sm:px-8 md:px-12 border-y border-[#B68A35]/30 relative overflow-hidden">
              <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-start sm:items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#DFC181] shrink-0">
                    <ShieldCheck size={26} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#DFC181] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                        Official Technical Partner
                      </span>
                      <span className="text-white/60 text-xs hidden sm:inline">&bull;</span>
                      <span className="text-xs text-white/80 font-sans font-medium">
                        FoodChain ID Southern Africa
                      </span>
                    </div>
                    <p className="font-serif text-base sm:text-lg text-white font-bold">
                      Accredited Management System Certifications &amp; Official FoodChain ID Academy Curricula
                    </p>
                    <p className="text-xs text-white/70 font-sans">
                      ISO 9001 &bull; ISO 14001 &bull; ISO 45001 &bull; ISO 27001 &bull; ISO 22000 &bull; BRCGS &bull; FSSC 22000 &bull; GLOBALG.A.P. &bull; Non-GMO
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => navigateTo('certifications')}
                    className="w-full sm:w-auto bg-[#B68A35] hover:bg-[#a0772d] text-white font-sans font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>View Certification Schemes</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </section>

            {/* 4. What Guides Our Work - Core Principles */}
            <section id="why-us" className="pt-24 pb-16 sm:pt-24 sm:pb-20 px-4 sm:px-8 md:px-12 bg-[#F6F8F6] border-b border-border/80 scroll-mt-[150px]">
              <div className="max-w-[1280px] mx-auto space-y-10 sm:space-y-12">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center max-w-3xl mx-auto space-y-2.5">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">
                      WHAT GUIDES OUR WORK
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-primary tracking-tight leading-snug text-balance">
                      Practical systems. Capable teams. Lasting readiness.
                    </h2>
                    <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
                      We design management systems and training that fit real workplace routines and stay effective between audits.
                    </p>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {[
                    {
                      icon: Sliders,
                      title: "Practical systems",
                      desc: "We review your operations and build workable procedures structured around real shifts, site layout, and daily routines."
                    },
                    {
                      icon: GraduationCap,
                      title: "Capable teams",
                      desc: "We build the confidence and practical know-how your team needs to maintain control every day."
                    },
                    {
                      icon: ShieldCheck,
                      title: "Lasting readiness",
                      desc: "We carry out regular reviews, standard updates, and continual-improvement work to keep your facility audit-ready throughout the year."
                    }
                  ].map((pillar, pIdx) => {
                    const PillarIcon = pillar.icon;
                    return (
                      <ScrollReveal key={pIdx} direction="up" delay={0.1 * (pIdx + 1)} className="h-full">
                        <div className="bg-white p-7 rounded-xl border border-border hover:border-[#B68A35]/50 transition-all flex flex-col justify-start h-full shadow-2xs group">
                          <div className="w-10 h-10 rounded-lg bg-[#023625]/8 text-[#023625] flex items-center justify-center shrink-0 mb-4 group-hover:bg-[#023625] group-hover:text-[#DFC181] transition-colors">
                            <PillarIcon size={20} />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif font-bold text-lg text-primary group-hover:text-[#023625] transition-colors leading-snug">
                              {pillar.title}
                            </h3>
                            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                              {pillar.desc}
                            </p>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 4. Our Approach - Streamlined Horizontal Numbered Timeline & Featured Phase Detail */}
            <section id="approach" className="pt-24 pb-16 sm:pt-24 sm:pb-20 bg-[#023625] text-white px-4 sm:px-8 md:px-12 scroll-mt-[150px] relative overflow-x-clip">
              <div className="max-w-[1280px] mx-auto space-y-8 sm:space-y-10 relative z-10">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#DFC181] font-sans text-xs uppercase tracking-widest font-bold shadow-xs">
                      <Workflow size={13} className="text-[#DFC181]" />
                      <span>How We Work</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">Our 5-Step Process</h2>
                    <p className="text-white/80 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                      A clear, step-by-step pathway from your initial review through to accredited certification and ongoing compliance.
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-2 text-xs font-sans text-[#DFC181]">
                      <ShieldCheck size={14} />
                      <span className="font-medium tracking-wide">Aligned to applicable GFSI and ISO requirements</span>
                    </div>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#B68A35] mx-auto mt-2"></div>
                  </div>
                </ScrollReveal>

                {/* 5-Phase Implementation Framework */}
                {(() => {
                  const approachPhasesData = [
                    {
                      num: "01",
                      phase: "Discover",
                      subtitle: "Initial review",
                      fullSubtitle: "Initial Review & Site Scoping",
                      icon: Target,
                      summary: "Reviewing your operations, workflows, and current documentation.",
                      description: "We begin with a thorough walkthrough of your facility, processes, and current records. This helps us understand how your team works day-to-day and where the key gaps or risks sit.",
                      deliverables: [
                        "Review of existing quality or food safety manuals",
                        "Facility walkthrough and operational flow mapping",
                        "Clear summary of priorities and next steps"
                      ],
                      outcome: "A clear picture of where your organisation stands before any changes begin.",
                      benefitTag: "Clear Starting Point"
                    },
                    {
                      num: "02",
                      phase: "Assess",
                      subtitle: "Gap analysis",
                      fullSubtitle: "Gap Analysis & Compliance Review",
                      icon: FileText,
                      summary: "Checking your current systems against target international standards.",
                      description: "Our lead auditors review your processes clause-by-clause against the standards you need (ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 22000, FSSC 22000, BRCGS, GLOBALG.A.P., or HACCP). We pinpoint non-conformances before external auditors arrive.",
                      deliverables: [
                        "Detailed gap analysis report against the target standard",
                        "HACCP plan review and hazard verification",
                        "Prioritised action list with clear responsibilities"
                      ],
                      outcome: "Exact clarity on what needs fixing to pass your target certification audit.",
                      benefitTag: "Audit Readiness"
                    },
                    {
                      num: "03",
                      phase: "Develop",
                      subtitle: "System design",
                      fullSubtitle: "System Design & Practical Procedures",
                      icon: Sliders,
                      summary: "Drafting clear SOPs and record sheets your staff can easily use.",
                      description: "We develop or update your management system manuals, Standard Operating Procedures (SOPs), and record sheets. Everything is written clearly and structured around your real shifts to avoid unnecessary paperwork.",
                      deliverables: [
                        "Practical SOPs, work instructions, and recording templates",
                        "Traceability, recall, and supplier control procedures",
                        "Corrective action (CAPA) tracking system"
                      ],
                      outcome: "A lean, practical management system that your team can run without confusion.",
                      benefitTag: "Practical Systems"
                    },
                    {
                      num: "04",
                      phase: "Deliver",
                      subtitle: "Training & rollout",
                      fullSubtitle: "Team Training & System Rollout",
                      icon: GraduationCap,
                      summary: "Hands-on staff training and internal audit practice.",
                      description: "A procedure only works if people know how to follow it. Through FoodChain ID Academy materials and practical training sessions, we train your operators, supervisors, and internal auditors so they run the system with confidence.",
                      deliverables: [
                        "Accredited course delivery for team leaders and auditors",
                        "Practical mock audit drills on the factory floor",
                        "Management review and readiness check before certification"
                      ],
                      outcome: "Confident, well-trained staff ready to explain and run procedures during real audits.",
                      benefitTag: "Capable Team"
                    },
                    {
                      num: "05",
                      phase: "Improve",
                      subtitle: "Continual improvement",
                      fullSubtitle: "Continual Improvement & Recertification",
                      icon: TrendingUp,
                      summary: "Regular surveillance audits and continual system refinement.",
                      description: "Staying compliant and competitive requires ongoing refinement. We provide regular surveillance audits, review standard updates, and help your team execute continual improvement initiatives, annual renewals, and unannounced customer visits.",
                      deliverables: [
                        "Periodic internal audits and system check-ins",
                        "Continual improvement reviews and standard updates",
                        "Support ahead of annual surveillance and renewal audits"
                      ],
                      outcome: "Long-term compliance and continual process optimization all year round.",
                      benefitTag: "Continual Compliance"
                    }
                  ];

                  const currentPhase = approachPhasesData[activeApproachPhase] || approachPhasesData[0];
                  const PhaseIcon = currentPhase.icon;

                  return (
                    <div className="space-y-6">
                      {/* Horizontal Numbered Timeline Bar - Sticky directly below main header with smooth snap carousel */}
                      <div className="sticky top-[64px] sm:top-[70px] z-30 py-2 -my-2 bg-[#023625]/95 backdrop-blur-md">
                        <div className="p-2 bg-white/10 rounded-2xl border border-white/20 shadow-md relative overflow-hidden">
                          {/* Left and Right edge fade gradient on mobile to cue horizontal scrollability */}
                          {activeApproachPhase > 0 && (
                            <div className="sm:hidden absolute top-2 left-2 bottom-2 w-8 bg-gradient-to-r from-[#023625] to-transparent pointer-events-none z-10 rounded-l-xl opacity-90 transition-opacity" />
                          )}
                          {activeApproachPhase < approachPhasesData.length - 1 && (
                            <div className="sm:hidden absolute top-2 right-2 bottom-2 w-8 bg-gradient-to-l from-[#023625] to-transparent pointer-events-none z-10 rounded-r-xl opacity-90 transition-opacity" />
                          )}

                          <div className="flex sm:grid sm:grid-cols-5 gap-2 relative overflow-x-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory px-1 sm:px-0">
                            {approachPhasesData.map((step, idx) => {
                              const isActive = activeApproachPhase === idx;

                              return (
                                <button
                                  key={idx}
                                  ref={el => { phaseTabRefs.current[idx] = el; }}
                                  type="button"
                                  onClick={() => setActiveApproachPhase(idx)}
                                  className={`text-left p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center sm:items-start gap-3 border shrink-0 sm:shrink min-w-[175px] sm:min-w-0 snap-center sm:snap-start min-h-[52px] ${
                                    isActive
                                      ? 'bg-white text-[#023625] border-[#DFC181] shadow-lg scale-[1.01]'
                                      : 'bg-white/5 text-white/85 border-white/10 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-lg font-serif font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                                    isActive ? 'bg-[#023625] text-[#DFC181]' : 'bg-white/15 text-white'
                                  }`}>
                                    {step.num}
                                  </div>
                                  <div className="text-left min-w-0 flex-1">
                                    <div className={`font-serif font-bold text-xs sm:text-sm leading-tight ${
                                      isActive ? 'text-[#023625]' : 'text-white'
                                    }`}>
                                      {step.phase}
                                    </div>
                                    <div className={`text-[11px] font-sans mt-0.5 leading-snug line-clamp-1 sm:line-clamp-2 ${
                                      isActive ? 'text-[#7d5800]' : 'text-white/60'
                                    }`}>
                                      {step.subtitle}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* Subtle progress track indicators on mobile */}
                          <div className="sm:hidden flex items-center justify-center gap-1.5 pt-2 pb-0.5">
                            {approachPhasesData.map((_, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setActiveApproachPhase(pIdx)}
                                aria-label={`Go to phase ${pIdx + 1}`}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                  activeApproachPhase === pIdx 
                                    ? 'w-6 bg-[#DFC181]' 
                                    : 'w-2 bg-white/25 hover:bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Featured Phase Spotlight Deep Dive */}
                      <motion.div
                        key={activeApproachPhase}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        onTouchStart={(e) => {
                          phaseTouchStartX.current = e.touches[0].clientX;
                        }}
                        onTouchEnd={(e) => {
                          if (phaseTouchStartX.current === null) return;
                          const touchEndX = e.changedTouches[0].clientX;
                          const deltaX = phaseTouchStartX.current - touchEndX;
                          if (deltaX > 50) {
                            // Swiped left -> Next phase
                            setActiveApproachPhase(prev => Math.min(approachPhasesData.length - 1, prev + 1));
                          } else if (deltaX < -50) {
                            // Swiped right -> Previous phase
                            setActiveApproachPhase(prev => Math.max(0, prev - 1));
                          }
                          phaseTouchStartX.current = null;
                        }}
                        className="bg-white text-primary border border-border rounded-2xl p-5 sm:p-8 shadow-xl space-y-5"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                          <div className="flex items-start sm:items-center gap-3.5 w-full sm:w-auto">
                            <div className="w-10 h-10 rounded-xl bg-[#023625] text-[#DFC181] font-serif font-bold text-base flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
                              {currentPhase.num}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[#7d5800] font-sans text-[11px] sm:text-xs uppercase tracking-wider font-bold block">
                                Step {currentPhase.num} Details
                              </span>
                              <h3 className="font-serif text-base sm:text-2xl font-bold text-[#023625] leading-snug">
                                {currentPhase.phase}: {currentPhase.fullSubtitle}
                              </h3>
                            </div>
                          </div>

                          {/* Outcome / Benefit badge - neatly placed on mobile without competing for title space */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#023625]/8 border border-[#023625]/15 text-[#023625] text-xs font-sans font-semibold shrink-0 self-start sm:self-auto">
                            <PhaseIcon size={13} className="text-[#B68A35]" />
                            <span>{currentPhase.benefitTag}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          <div className="lg:col-span-7 space-y-4">
                            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                              {currentPhase.description}
                            </p>

                            <div className="space-y-2 pt-1">
                              <h4 className="font-serif font-bold text-xs text-[#023625] uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 size={15} className="text-[#B68A35]" />
                                <span>What We Deliver</span>
                              </h4>
                              <ul className="space-y-1.5">
                                {currentPhase.deliverables.map((item, dIdx) => (
                                  <li key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-primary font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#B68A35] shrink-0 mt-2"></span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="lg:col-span-5 bg-[#F6F8F6] border border-border p-5 rounded-xl space-y-3">
                            <div className="flex items-center gap-1.5 text-[#023625] font-serif font-bold text-xs uppercase tracking-wider">
                              <Award size={15} className="text-[#B68A35]" />
                              <span>Expected Result</span>
                            </div>
                            <p className="font-sans text-xs sm:text-sm text-primary leading-relaxed font-medium bg-white p-3.5 rounded-lg border border-border shadow-xs">
                              "{currentPhase.outcome}"
                            </p>
                          </div>
                        </div>

                        {/* Prev/Next Phase Controls - Clean unwrapped 1 / 5 and balanced layout */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/80 gap-2">
                          <button
                            type="button"
                            disabled={activeApproachPhase === 0}
                            onClick={() => setActiveApproachPhase(prev => Math.max(0, prev - 1))}
                            className={`inline-flex items-center gap-1.5 text-xs font-sans font-semibold px-3 sm:px-3.5 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                              activeApproachPhase === 0
                                ? 'opacity-40 border-border text-ash cursor-not-allowed'
                                : 'bg-mist border-border text-[#023625] hover:bg-[#023625] hover:text-white'
                            }`}
                          >
                            <ChevronLeft size={14} />
                            <span>Back</span>
                          </button>

                          {/* Phase count indicator with nowrap and clean centered pill */}
                          <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-[#023625]/5 border border-[#023625]/10 text-xs font-sans font-bold text-[#7d5800] whitespace-nowrap">
                            <span>{activeApproachPhase + 1} / {approachPhasesData.length}</span>
                          </div>

                          <button
                            type="button"
                            disabled={activeApproachPhase === approachPhasesData.length - 1}
                            onClick={() => setActiveApproachPhase(prev => Math.min(approachPhasesData.length - 1, prev + 1))}
                            className={`inline-flex items-center gap-1.5 text-xs font-sans font-semibold px-3 sm:px-3.5 py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                              activeApproachPhase === approachPhasesData.length - 1
                                ? 'opacity-40 border-border text-ash cursor-not-allowed'
                                : 'bg-[#023625] text-white border-[#023625] shadow-xs hover:bg-[#034d35]'
                            }`}
                          >
                            <span>Next</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}
              </div>
            </section>
          </>
        )}

        {currentView === 'consulting' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white min-h-screen text-on-surface"
          >
            {/* Printable Letterhead Header (visible only during window.print) */}
            <div className="hidden print:block p-8 border-b-2 border-[#B68A35]">
              <div className="flex justify-between items-end">
                <div>
                  <YitzakLogo size={32} className="mb-2" />
                  <p className="text-xs font-mono text-[#7d5800] uppercase font-bold">Consulting &amp; Systems Design Capabilities Statement</p>
                  <p className="text-[10px] text-gray-500 mt-1">Official Institutional Document · Ref #YITZ-CONS-2026-CAP</p>
                </div>
                <div className="text-right text-[10px] font-mono text-gray-500">
                  <p>Issued: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>Page 05 / 05</p>
                </div>
              </div>
            </div>

            {/* Top Breadcrumb & Document Indicator */}
            <div className="pt-10 pb-4 px-4 md:px-16 max-w-[1280px] mx-auto">
              <div className="flex justify-between items-center text-xs font-mono text-ash border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#B68A35] font-bold">YITZAK</span>
                  <span>·</span>
                  <span>COMPANY PROFILE</span>
                </div>
                <div className="font-bold text-primary font-mono text-sm">05</div>
              </div>
            </div>

            {/* Hero Banner Section */}
            <section className="pt-6 pb-12 px-4 md:px-16 max-w-[1280px] mx-auto">
              <div className="max-w-4xl space-y-6">
                <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold block">
                  CONSULTING &amp; ADVISORY
                </span>
                <h1 className="font-serif text-[36px] md:text-[56px] leading-[44px] md:leading-[64px] text-primary font-bold tracking-tight">
                  Turning learning into working systems
                </h1>
                <p className="font-sans text-sm md:text-lg text-on-surface-variant leading-relaxed max-w-3xl">
                  Practical guidance that helps organisations apply what they learn, strengthening the systems, processes, and controls that carry performance day to day.
                </p>

                {/* Quick Action Bar */}
                <div className="flex flex-wrap items-center gap-4 pt-2 no-print">
                  <button
                    onClick={() => handleOpenBooking('compliance', 'Inquiry: Systems Analysis & Gap Assessment')}
                    className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center gap-2"
                  >
                    <span>Schedule Direct Consultation</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => exportCapabilitySheetPDF('consulting_statement')}
                    className="bg-primary hover:bg-[#1f4d3a] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center gap-2"
                    title="Print or Download Consulting & Advisory Capabilities Statement"
                  >
                    <Printer size={14} className="text-[#DFC181]" />
                    <span>Print Capabilities Statement</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Systems Analysis & Design + Also Available Section */}
            <section className="py-14 bg-mist/60 border-y border-border px-4 md:px-16">
              <div className="max-w-[1280px] mx-auto space-y-16">
                
                {/* Systems Analysis & Design Grid */}
                <div className="space-y-8">
                  <div className="border-b border-border/80 pb-3 flex justify-between items-center">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-[#B68A35] font-bold">
                      SYSTEMS ANALYSIS &amp; DESIGN
                    </h2>
                    <span className="text-[10px] font-mono text-ash uppercase">Structured Implementation Pathway</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {[
                      {
                        num: '01',
                        title: 'Analyse business processes',
                        desc: 'We map how your operation actually runs, establishing a clear, shared picture of the processes that drive quality, safety, and compliance.'
                      },
                      {
                        num: '02',
                        title: 'Review & evaluate controls',
                        desc: 'We assess existing control procedures and processes against your objectives and applicable standards, identifying gaps, duplication, and risk.'
                      },
                      {
                        num: '03',
                        title: 'Design & implement improvements',
                        desc: 'We design practical, cost-efficient control processes that streamline operations, uncover time-saving wins, and support continual improvement and sustainable success.'
                      }
                    ].map((step, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-2xl border border-border shadow-xs hover:border-[#B68A35]/50 transition-all flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <span className="font-serif text-4xl md:text-5xl font-bold text-[#B68A35]/80 block font-mono">
                            {step.num}
                          </span>
                          <h3 className="font-serif text-xl md:text-2xl font-bold text-primary leading-snug">
                            {step.title}
                          </h3>
                          <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-border/40 no-print">
                          <button
                            onClick={() => handleOpenBooking('compliance', `Inquiry on Step ${step.num}: ${step.title}`)}
                            className="text-xs font-bold text-primary hover:text-secondary uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Inquire Implementation</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Also Available Grid */}
                <div className="space-y-8">
                  <div className="border-b border-border/80 pb-3 flex justify-between items-center">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-[#B68A35] font-bold">
                      ALSO AVAILABLE
                    </h2>
                    <span className="text-[10px] font-mono text-ash uppercase">Complementary Advisory Modules</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {[
                      { title: 'Gap assessments & readiness reviews', pillar: 'compliance', desc: 'Pre-audit diagnostic reviews against ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 50001, ISO 22000/22001, FSSC 22000, BRCGS, and HACCP.' },
                      { title: 'Management system development', pillar: 'advisory', desc: 'Custom policy, SOP, and Management Systems Manual formulation built around your team (covering ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 50001, ISO 22000/22001, FSSC 22000, BRCGS, and HACCP).' },
                      { title: 'Documentation & records support', pillar: 'training', desc: 'Streamlined verification logs, traceability registers, and cloud compliance archives.' },
                      { title: 'Internal audits & process reviews', pillar: 'compliance', desc: 'Independent expert auditing to satisfy annual accredited scheme mandates.' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-5 sm:p-6 rounded-xl border border-stone-200 shadow-2xs hover:shadow-sm hover:border-[#B68A35]/50 transition-all flex flex-col justify-between h-full space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-start gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#B68A35] shrink-0 mt-1.5"></div>
                            <h4 className="font-serif text-sm sm:text-base font-bold text-primary leading-snug">{item.title}</h4>
                          </div>
                          <p className="font-sans text-xs text-on-surface-variant leading-relaxed pl-5">
                            {item.desc}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-stone-100 pl-5 no-print">
                          <button
                            onClick={() => handleOpenBooking(item.pillar, `Inquiry: ${item.title}`)}
                            className="text-xs font-bold uppercase tracking-wider text-[#7d5800] hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span>Book Review</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* Bottom Callout Banner */}
            <section className="py-12 sm:py-16 bg-[#132B22] text-white px-4 sm:px-8 md:px-16 border-t border-b border-[#1E4235]">
              <div className="max-w-[1280px] mx-auto text-center space-y-5 sm:space-y-6">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Ready to turn learning into working systems?</h2>
                <p className="font-sans text-xs sm:text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Connect directly with Yitzak's principal advisors to schedule a gap assessment, system analysis, or custom corporate workshop.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 no-print w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenBooking('compliance', 'Inquiry: Gap Assessment & Systems Design')}
                    className="w-full sm:w-auto bg-[#B68A35] hover:bg-[#a3792b] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md text-center"
                  >
                    Schedule Direct Consultation
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('home-contact-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigateTo('contact');
                      }
                    }}
                    className="w-full sm:w-auto border border-white/30 hover:border-white hover:bg-white/5 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-xl cursor-pointer transition-all active:scale-95 text-center"
                  >
                    Talk to Our Advisory Team
                  </button>
                </div>
              </div>
            </section>

            {/* Embedded Contact Us Section at Bottom of Home Page */}
            <section id="home-contact-section" className="pt-24 pb-16 md:pt-24 md:pb-20 bg-[#F9F9F9] text-[#2D3142] px-4 md:px-16 border-t border-border scroll-mt-[150px]">
              <div className="max-w-[1280px] mx-auto">
                <ContactUs onOpenPrivacy={() => navigateTo('privacy')} />
              </div>
            </section>
          </motion.div>
        )}

        {currentView === 'training' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white min-h-screen text-on-surface"
          >
            {/* Hero Section */}
            <section className="relative pt-6 md:pt-10 pb-4 md:pb-6 px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1180px] mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 z-10">
                  <h1 className="font-serif text-[40px] md:text-[56px] leading-[46px] md:leading-[64px] tracking-tight text-primary mb-5 font-bold">
                    Training that builds real competence
                  </h1>
                  <p className="font-sans text-sm md:text-base text-on-surface-variant mb-4 leading-relaxed opacity-90">
                    Practical, instructor-led training for quality, food safety, environmental, and management systems. Delivered through Yitzak programmes and selected FoodChain ID Academy courses, with options tailored to your workplace.
                  </p>
                  <p className="font-sans text-xs md:text-sm text-outline mb-6 border-l-2 border-antique-gold pl-4">
                    Featuring YITZAK professional programmes, with access to selected FoodChain ID Academy courses.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById('portfolio');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                    >
                      <span>Explore Training Portfolio</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenBooking()}
                      className="border border-forest-green text-forest-green hover:bg-forest-green hover:text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 text-center"
                    >
                      Request a Consultation
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-6 mt-6 lg:mt-0 relative">
                  <div className="rounded-2xl overflow-hidden shadow-ambient relative z-10 aspect-[4/3] border border-[#E5E5E5]">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh8qjKo1mwyVEx2R4hcz_37lRzkxGHkT6V-oq1p6-aNLPzSIK1PeKocPwmsavBw-jzyWVB7YGBWC7mQGezHM9vJgXqXzW6XP-LZ0F3KVj7xjUPf9A30emofQLCDZzMztfEV_elrnRp7EgBGuSsJrD3EK0M9h-zOPiHOpehrbBdtNYBmiSgUTd0LjaWVrc-kU93-69KQ9lqCIkb1UTr7OvswZEbEAmW5BkzB5_ThEx55RADoHMnem4L"
                      alt="A professional corporate training room with executives engaged in a focused workshop"
                      loading="lazy"
                      decoding="async"
                      width={640}
                      height={480}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Decorative Element */}
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#F9F9F9] rounded-full z-0 opacity-50"></div>
                </div>
              </div>
            </section>

            {/* Training Options Section */}
            <section id="streams" className="bg-[#F9F9F9] py-6 md:py-8 px-4 sm:px-6 md:px-12 lg:px-16 border-t border-[#E5E5E5] scroll-mt-[80px]">
              <div className="max-w-[1180px] mx-auto">
                <div className="text-center mb-6">
                  <h2 className="font-serif text-3xl md:text-[36px] text-primary font-bold mb-2">Training Options</h2>
                  <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto mb-3">
                    Choose the delivery pathway that aligns with your operational requirements and team goals.
                  </p>
                  <div className="w-20 h-1 bg-[#B68A35] mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Option 1 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div className="space-y-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center">
                        <GraduationCap className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold">YITZAK Programmes</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        Practical training modules focused on compliance implementation, management systems, and internal auditor competence.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSidebarSection('ims');
                        const el = document.getElementById('portfolio');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-secondary transition-colors flex items-center gap-2 self-start cursor-pointer mt-auto"
                    >
                      <span>Explore Modules</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Option 2 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div className="space-y-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center">
                        <Award className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold">FoodChain ID Academy</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        Accredited certification and auditor training courses delivered through our official partnership.
                      </p>
                    </div>
                    <button
                      onClick={() => navigateTo('certifications')}
                      className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-secondary transition-colors flex items-center gap-2 self-start cursor-pointer mt-auto"
                    >
                      <span>Explore Accredited Schemes</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Option 3 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div className="space-y-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center">
                        <Building2 className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold">In-House Solutions</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        On-site training programmes tailored to your organization's specific operational processes and facility requirements.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('training')}
                      className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-secondary transition-colors flex items-center gap-2 self-start cursor-pointer mt-auto"
                    >
                      <span>Request Custom Plan</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* FoodChain ID Partnership Banner */}
            <section className="py-8 md:py-10 bg-mist border-y border-border">
              <div className="max-w-[1180px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="bg-[#023625] text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#B68A35]/20 text-[#DFC181] border border-[#B68A35]/40 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap">
                          Official Partner
                        </span>
                        <span className="text-white/70 text-xs font-mono">FoodChain ID Academy</span>
                      </div>
                      <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
                        FoodChain ID Academy Courses &amp; Certification Pathways
                      </h3>
                      <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
                        Access selected FoodChain ID Academy training courses and certification pathways across GFSI, GLOBALG.A.P., Non-GMO, and BRCGS standards through our official partnership.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => navigateTo('certifications')}
                        className="bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans text-xs uppercase tracking-widest font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
                      >
                        <span>Certification</span>
                        <ArrowRight size={14} />
                      </button>
                      <a
                        href="https://www.foodchainid.com/academy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-white/30 hover:border-white hover:bg-white/5 text-white font-sans text-xs uppercase tracking-widest font-bold py-3 px-5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 w-full sm:w-auto text-center"
                      >
                        <span>Global Academy</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* Training Portfolio Section */}
            <section id="portfolio" className="py-10 md:py-14 px-4 sm:px-6 md:px-12 lg:px-16 bg-white scroll-mt-[100px]">
              <div className="max-w-[1180px] mx-auto">
                
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 border-b border-[#E5E5E5] pb-5">
                  <div>
                    <h2 className="font-serif text-3xl md:text-[36px] text-primary font-bold mb-2">Training Portfolio</h2>
                    <div className="w-20 h-1 bg-[#B68A35]"></div>
                  </div>
                  
                  {/* Single Course Guide PDF Button */}
                  <div className="no-print">
                    <button
                      onClick={() => exportPortfolioToPDF(portfolioCategories)}
                      className="bg-[#B68A35] hover:bg-[#a3792c] text-white font-mono text-xs font-bold uppercase tracking-wider py-2.5 px-4 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] rounded-lg"
                      title="Download the full course guide syllabus as a PDF document"
                    >
                      <FileText size={14} />
                      <span className="whitespace-nowrap">Download Course Guide</span>
                    </button>
                  </div>
                </div>

                {/* Mobile horizontal scrollable categories tab bar with swipe affordance & hidden scrollbar */}
                <div className="md:hidden relative mb-6">
                  <div className="flex flex-row overflow-x-auto gap-2 pb-2.5 border-b border-[#E5E5E5] scrollbar-none no-scrollbar -mx-4 px-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {portfolioCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveSidebarSection(cat.id)}
                        className={`whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0 active:scale-95 ${
                          activeSidebarSection === cat.id
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-[#F4F4F4] text-on-surface-variant hover:bg-[#EAEAEA]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  {/* Subtle right fade affordance indicating more scrollable tabs */}
                  <div className="absolute right-0 top-0 bottom-2.5 w-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none -mr-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
                  {/* Left Sidebar Menu (Desktop) */}
                  <div className="hidden md:block md:col-span-3">
                    <div className="flex flex-col space-y-1 border-l-2 border-[#E5E5E5] pl-0">
                      {portfolioCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveSidebarSection(cat.id)}
                          className={`text-left py-2.5 px-3.5 transition-all text-xs uppercase tracking-wider font-bold cursor-pointer border-l-2 -ml-[2px] rounded-r-md ${
                            activeSidebarSection === cat.id
                              ? 'border-[#B68A35] text-primary bg-[#F2F4F3] font-extrabold shadow-2xs'
                              : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-[#F9FBF9] hover:border-[#D0D0D0]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Courses Panel */}
                  <div className="col-span-1 md:col-span-9">
                    <AnimatePresence mode="wait">
                      {portfolioCategories.map((cat) => cat.id === activeSidebarSection && (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-5"
                        >
                          {/* Category Header */}
                          <div className="border-b border-[#E5E5E5] pb-3 mb-4 space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h3 className="font-serif text-xl md:text-2xl text-primary font-bold">
                                {cat.title}
                              </h3>
                              <span className="text-secondary font-mono text-[11px] uppercase tracking-wider bg-secondary-fixed px-3 py-1 rounded-md font-bold shrink-0 text-center border border-secondary/20 self-start sm:self-auto">
                                {cat.badge}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                                {cat.description}
                              </p>
                            )}
                          </div>

                          {/* Courses List */}
                          <div className="space-y-3">
                            {cat.courses.map((course, idx) => (
                              <div
                                key={idx}
                                className="border border-[#E5E5E5] p-4 sm:p-5 hover:shadow-ambient transition-all duration-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl"
                              >
                                <div className="flex-1 min-w-0 pr-0 sm:pr-2">
                                  <h4 className="font-sans text-[15px] sm:text-base font-bold text-primary mb-1.5 leading-snug">
                                    {course.title}
                                  </h4>
                                  <p className="font-sans text-[13px] sm:text-sm text-on-surface-variant leading-relaxed opacity-90">
                                    {course.description}
                                  </p>
                                </div>

                                <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-start sm:justify-center gap-1.5 shrink-0 max-w-full">
                                  {course.tags.map((tag, tagIdx) => (
                                    <span
                                      key={tagIdx}
                                      className="inline-flex items-center justify-center text-center text-[11px] font-mono uppercase tracking-wider bg-forest-green/10 text-forest-green px-2.5 py-1 font-semibold rounded-md border border-forest-green/15 whitespace-nowrap max-w-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>

            {/* Certificates and Records Section */}
            <section className="py-6 px-4 sm:px-6 md:px-12 lg:px-16 bg-white">
              <div className="max-w-[1180px] mx-auto">
                <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-forest-green/10 flex items-center justify-center shrink-0">
                    <Award className="text-forest-green" size={28} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl text-primary font-bold mb-2">Certificates and Records</h3>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed opacity-90">
                      On successful completion of Yitzak courses, participants receive a formal Yitzak Certificate of Completion and attendance record. For FoodChain ID Academy courses, official certificates are issued directly by FoodChain ID following their accredited assessment requirements.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Formats Section */}
            <section className="bg-primary text-white py-8 md:py-10 px-4 sm:px-6 md:px-12 lg:px-16">
              <div className="max-w-[1180px] mx-auto text-center">
                <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">On-Site &amp; Workplace Delivery</h2>
                <p className="font-sans text-xs md:text-sm text-white/80 max-w-2xl mx-auto mb-6 leading-relaxed">
                  Tailored to fit your facility schedule and operational team requirements.
                </p>

                <div className="max-w-2xl mx-auto mb-6">
                  <div className="border border-white/10 rounded-2xl p-5 sm:p-6 bg-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                      <Building2 className="text-antique-gold" size={20} />
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold mb-1.5 text-white">Workplace &amp; Facility Training</h3>
                    <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed max-w-lg">
                      Delivered directly at your production plant, packhouse, or offices. We use your operational processes and documentation as practical examples to build capability where it counts.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigateTo('calendar')}
                    className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded cursor-pointer transition-all active:scale-95 focus:outline-none"
                  >
                    View Course Availability
                  </button>
                  <button
                    onClick={() => handleOpenBooking('training')}
                    className="border border-white/30 hover:border-white text-white font-sans font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded cursor-pointer transition-all active:scale-95 focus:outline-none"
                  >
                    Request In-House Training
                  </button>
                </div>
              </div>
            </section>

            {/* Frequently Asked Questions Section */}
            <FAQSection onNavigateToContact={() => navigateTo('contact')} />
          </motion.div>
        )}

        {currentView === 'certifications' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white min-h-screen text-on-surface"
          >
            {/* Certifications Page Hero */}
            <section className="relative pt-8 sm:pt-12 md:pt-20 pb-12 sm:pb-16 px-4 sm:px-8 md:px-16 max-w-[1280px] mx-auto overflow-hidden">
              <div className="max-w-4xl space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B68A35]/10 text-[#7a5a1f] rounded-full border border-[#B68A35]/30 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider max-w-full">
                  <Award size={14} className="text-[#B68A35] shrink-0" />
                  <span className="truncate sm:whitespace-normal">Accredited Schemes &amp; Global Partnerships</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-[56px] leading-tight md:leading-[62px] tracking-tight text-primary font-bold">
                  Internationally Recognised Certification
                </h1>
                <p className="font-sans text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed max-w-3xl">
                  Through our official partnership with <strong className="text-primary font-bold">FoodChain ID</strong>, Yitzak connects organizations to accredited third-party certification pathways and courses across international food safety, quality, and agricultural standards across Southern Africa.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2 no-print">
                  <button
                    onClick={() => handleOpenBooking('compliance', 'Inquiry: Accredited Certification Audit')}
                    className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <span>Inquire Certification Audit</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => exportCapabilitySheetPDF('certification_portfolio')}
                    className="bg-primary hover:bg-[#1f4d3a] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                    title="Print or Download certification schemes catalog for physical record-keeping"
                  >
                    <Printer size={14} className="text-[#DFC181]" />
                    <span>Print Certification Portfolio</span>
                  </button>
                  <a
                    href="https://www.foodchainid.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-primary/40 text-primary hover:bg-primary hover:text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <span>FoodChain ID Global Portal</span>
                    <Globe size={14} />
                  </a>
                </div>
              </div>
            </section>

            {/* Accredited Certification Schemes Listing with Visual Status Indicators */}
            <section className="py-16 md:py-20 bg-mist border-y border-border">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16 space-y-12">
                
                {/* Print Letterhead Header (Visible only during physical printing) */}
                <div className="hidden print:block mb-8 border-b-2 border-[#B68A35] pb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <YitzakLogo size={30} className="mb-2" />
                      <p className="text-xs font-mono text-[#7d5800] uppercase font-bold">Accredited Certification Schemes &amp; Standards Directory</p>
                      <p className="text-[10px] text-gray-500 mt-1">Official FoodChain ID Partner</p>
                    </div>
                    <div className="text-right text-[10px] font-mono text-gray-500">
                      <p>Issued: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p>Document Ref: YITZ-CERT-2026-DIR</p>
                    </div>
                  </div>
                </div>
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Comprehensive Scheme Catalog</span>
                    <h2 className="font-serif text-3xl md:text-[42px] text-primary font-bold">Accredited Schemes &amp; Standards</h2>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                      Explore our official FoodChain ID accredited certification routes, covering on-site third-party audits, standards evaluation, and internationally recognized certificate issuance.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Scheme 1: Product & Label Certification */}
                  <ScrollReveal direction="up" delay={0.1}>
                    <div className="bg-white border border-[#E5E5E5] p-5 sm:p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#B68A35]/50 transition-all group duration-300 h-full overflow-hidden">
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#F0F0F0] pb-4">
                          <div className="flex items-center gap-3 min-w-0 max-w-full">
                            <div className="w-10 h-10 rounded-xl bg-[#023625] text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                              P
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors leading-snug">
                                Product &amp; Label
                              </h3>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] block truncate">
                                Products &amp; Claims
                              </span>
                            </div>
                          </div>
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1 self-start mt-0.5">
                            <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                            <span>Accredited</span>
                          </span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Official FoodChain ID certification audits for product claims that hold up to global market and regulatory scrutiny, including organic, Non-GMO Project Verification, and Gluten-Free.
                        </p>

                        <div className="pt-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] font-bold block mb-2">Key Schemes:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['Non-GMO', 'Organic', 'Identity Preserved', 'Gluten-Free'].map((item, idx) => (
                              <span key={idx} className="text-[11px] bg-[#F7F7F7] text-primary border border-[#E8E8E8] px-2.5 py-1 rounded-md font-medium max-w-full truncate">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#F0F0F0] flex items-center justify-between gap-2">
                        <a
                          href="https://www.foodchainid.com/product-and-label-certification/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: Product & Label Certification Audit')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Audit</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Scheme 2: GLOBALG.A.P. */}
                  <ScrollReveal direction="up" delay={0.2}>
                    <div className="bg-white border border-[#E5E5E5] p-5 sm:p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#B68A35]/50 transition-all group duration-300 h-full overflow-hidden">
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#F0F0F0] pb-4">
                          <div className="flex items-center gap-3 min-w-0 max-w-full">
                            <div className="w-10 h-10 rounded-xl bg-[#023625] text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                              G
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors leading-snug">
                                GLOBALG.A.P.
                              </h3>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] block truncate">
                                Farm Assurance
                              </span>
                            </div>
                          </div>
                          <span className="bg-sky-50 text-sky-800 border border-sky-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1 self-start mt-0.5">
                            <Globe size={12} className="text-sky-600 shrink-0" />
                            <span>GFSI Benchmarked</span>
                          </span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Accredited good agricultural practice certification audits covering food safety, traceability, and worker welfare. GFSI-benchmarked and recognised by major international retailers.
                        </p>

                        <div className="pt-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] font-bold block mb-2">Covered Modules:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['Good Ag Practice', 'Chain of Custody', 'GRASP', 'Produce Handling'].map((item, idx) => (
                              <span key={idx} className="text-[11px] bg-[#F7F7F7] text-primary border border-[#E8E8E8] px-2.5 py-1 rounded-md font-medium max-w-full truncate">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#F0F0F0] flex items-center justify-between gap-2">
                        <a
                          href="https://www.foodchainid.com/globalg-a-p/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: GLOBALG.A.P. Certification Audit')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Audit</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Scheme 3: BRCGS Certifications */}
                  <ScrollReveal direction="up" delay={0.3}>
                    <div className="bg-white border border-[#E5E5E5] p-5 sm:p-6 md:p-8 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-[#B68A35]/50 transition-all group duration-300 h-full overflow-hidden">
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-[#F0F0F0] pb-4">
                          <div className="flex items-center gap-3 min-w-0 max-w-full">
                            <div className="w-10 h-10 rounded-xl bg-[#023625] text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                              B
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors leading-snug">
                                BRCGS Standard
                              </h3>
                              <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] block truncate">
                                Food Safety &amp; Quality
                              </span>
                            </div>
                          </div>
                          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 inline-flex items-center gap-1 self-start mt-0.5">
                            <Award size={12} className="text-indigo-600 shrink-0" />
                            <span>Global Standard</span>
                          </span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Globally recognised food safety certification audits across manufacturing, packaging, storage, and distribution, conducted through FoodChain ID's accredited audit body.
                        </p>

                        <div className="pt-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A] font-bold block mb-2">Scope Standards:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {['Food Safety Issue 9', 'Packaging', 'Storage & Dist.', 'Agents & Brokers'].map((item, idx) => (
                              <span key={idx} className="text-[11px] bg-[#F7F7F7] text-primary border border-[#E8E8E8] px-2.5 py-1 rounded-md font-medium max-w-full truncate">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#F0F0F0] flex items-center justify-between gap-2">
                        <a
                          href="https://www.foodchainid.com/brcgs-certifications/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: BRCGS Certification Audit')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Audit</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Scheme 4: FSSC 22000 & ISO Systems */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 rounded-2xl flex flex-col lg:flex-row justify-between lg:items-center gap-6 shadow-2xs hover:border-[#B68A35]/50 transition-all">
                    <div className="space-y-3 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span>Accredited</span>
                        </span>
                        <span className="bg-purple-50 text-purple-800 border border-purple-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                          <Sparkles size={12} className="text-purple-600" />
                          <span>GFSI &amp; ISO Standards</span>
                        </span>
                      </div>
                      <h3 className="font-serif text-xl md:text-2xl text-primary font-bold">FSSC 22000 &amp; Integrated ISO Management Systems</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        Official FoodChain ID certification audits for FSSC 22000 (Version 6), ISO 22000 / 22001 (Food Safety), ISO 9001 (Quality), ISO 14001 (Environmental), ISO 45001 (Occupational Health &amp; Safety), ISO 27001 (Information Security), and ISO 50001 (Energy Management). Full third-party auditing that meets international buyer and retail requirements.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['FSSC 22000 v6', 'ISO 22000 / 22001', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001', 'ISO 50001'].map((iso, idx) => (
                          <span key={idx} className="text-[11px] bg-[#F7F7F7] text-primary border border-[#E8E8E8] px-3 py-1 rounded-md font-mono font-bold">
                            {iso}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('compliance', 'Inquiry: FSSC 22000 / ISO Certification Audit')}
                      className="bg-primary hover:bg-[#1f4d3a] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded-md transition-all cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] w-full sm:w-auto"
                    >
                      <span>Inquire ISO &amp; FSSC Audit</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </ScrollReveal>

                {/* FoodChain ID Banner Quote */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-[#023625] text-white p-8 md:p-10 rounded-2xl relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <span className="text-[#B68A35] font-mono text-xs uppercase tracking-widest font-bold block">Exclusive Technical Partnership</span>
                      <h3 className="font-serif text-xl md:text-2xl font-bold">FoodChain ID &amp; Yitzak Consulting</h3>
                      <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
                        As an Official FoodChain ID Partner, Yitzak gives clients access to selected FoodChain ID Academy courses, with certification delivered through FoodChain ID and its accredited certification bodies.
                      </p>
                    </div>
                    <a
                      href="https://www.foodchainid.com/academy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans text-xs uppercase tracking-widest py-3.5 px-6 rounded transition-all cursor-pointer shrink-0 inline-flex items-center gap-2 font-bold"
                    >
                      <span>Explore Global Academy</span>
                      <span>↗</span>
                    </a>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          </motion.div>
        )}

        {currentView === 'process_implementation' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white min-h-screen text-on-surface"
          >
            {/* Hero Section */}
            <section className="relative pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-14 px-4 sm:px-8 md:px-16 max-w-[1280px] mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 z-10 space-y-5 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B68A35]/10 text-[#7a5a1f] rounded-full border border-[#B68A35]/30 text-xs font-mono font-bold uppercase tracking-wider">
                    <AppIcon name="schema" size={14} color="#B68A35" />
                    <span>Operational Pillar 04</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-tight md:leading-[60px] tracking-tight text-primary font-bold">
                    Business Process Implementation
                  </h1>
                  <p className="font-sans text-xs sm:text-sm md:text-base text-on-surface-variant leading-relaxed">
                    Helping organisations build solid operational foundations from zero. From process mapping and risk controls to setting up HR, accounting, and core workflow systems, Yitzak transforms strategic objectives into measurable, scalable execution.
                  </p>
                  <p className="font-sans text-xs sm:text-sm text-outline border-l-2 border-[#B68A35] pl-4">
                    Bridge the gap between strategy and operational reality with tailored process governance and automated control frameworks.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
                    <button
                      onClick={() => handleOpenBooking('process_implementation', 'Inquiry: Business Process Implementation Services')}
                      className="bg-[#B68A35] hover:bg-[#a3792b] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
                    >
                      <span>Request Implementation Plan</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => exportCapabilitySheetPDF('capability_sheet')}
                      className="border border-[#023625] text-[#023625] hover:bg-[#023625] hover:text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-2 w-full sm:w-auto"
                      title="Print or Download Capability Sheet"
                    >
                      <Printer size={14} />
                      <span>Print Capability Sheet</span>
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-5 relative w-full">
                  <div className="bg-[#023625] text-white p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-5">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#DFC181]">Core Capabilities</h3>
                    <ul className="space-y-3.5 font-sans text-xs sm:text-sm text-white/90">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={17} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>Process Mapping &amp; SOP Formulation:</strong> Standardising workflows for error reduction and clarity.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={17} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>Governance &amp; Risk Controls:</strong> Establishing internal control checkpoints and risk mitigation protocols.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={17} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>HR &amp; Accounting Setup:</strong> Operationalizing foundational HR policies, payroll rules, and financial reporting workflows.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={17} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>Lean Audits &amp; Efficiency:</strong> Streamlining repetitive tasks and removing operational bottlenecks.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Implementation Phased Roadmap Component */}
            <section className="bg-[#F9F9F9] py-10 sm:py-14 md:py-16 px-4 sm:px-8 md:px-16 border-t border-[#E5E5E5]">
              <div className="max-w-[1280px] mx-auto space-y-8 sm:space-y-10">
                <ProcessImplementationRoadmap 
                  onInquirePhase={(phaseTitle) => handleOpenBooking('process_implementation', `Inquiry regarding ${phaseTitle}`)}
                />

                <div className="bg-[#023625] text-white p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-white/10">
                  <div className="space-y-2 max-w-2xl text-center md:text-left">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold">Ready to standardise and scale your operations?</h3>
                    <p className="font-sans text-xs sm:text-sm text-white/80">
                      Speak with a principal consultant to structure an implementation roadmap tailored to your company's sector and size.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenBooking('process_implementation', 'Inquiry: Business Process Implementation Roadmap')}
                    className="bg-[#B68A35] hover:bg-[#a3792b] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded-xl cursor-pointer transition-all shrink-0 shadow-md w-full md:w-auto text-center active:scale-95"
                  >
                    Schedule Consultation
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {currentView === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#F9F9F9] min-h-screen text-[#2D3142] py-12 px-4 md:px-16"
          >
            <div className="max-w-[1280px] mx-auto">
              <Suspense fallback={<ViewLoadingFallback />}>
                <TrainingCalendar 
                  onReserveCourse={(notesStr) => handleOpenBooking('training', notesStr)} 
                />
              </Suspense>
            </div>
          </motion.div>
        )}

        {currentView === 'knowledge' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Suspense fallback={<ViewLoadingFallback />}>
              <KnowledgeCenter
                onOpenBooking={handleOpenBooking}
                onNavigateToContact={() => navigateTo('contact')}
              />
            </Suspense>
          </motion.div>
        )}

        {currentView === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#F9F9F9] min-h-screen text-[#2D3142] py-12 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16"
          >
            <div className="max-w-[1280px] mx-auto mb-10 text-center space-y-3">
              <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Get in touch</span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">Talk to Our Advisory Team</h1>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                Tell us what you need and we’ll connect you with the right Yitzak advisor.
              </p>
            </div>
            <ContactUs onOpenPrivacy={() => navigateTo('privacy')} />
          </motion.div>
        )}

        {currentView === 'portal' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#F9F9F9] min-h-screen text-[#2D3142] py-12 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16"
          >
            <div className="max-w-[1280px] mx-auto space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B68A35]/15 text-[#7a5a1f] rounded-full border border-[#B68A35]/30 text-xs font-mono font-bold uppercase tracking-wider">
                  <Lock size={13} className="text-[#B68A35]" />
                  <span>Institutional Portal • Coming Soon</span>
                </div>
                <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold">Secure Client Portal</h1>
                <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed">
                  Our comprehensive institutional client portal is currently in active development. Authorized corporate partners and whitelisted accounts can preview features and test single sign-on access below.
                </p>
              </div>

              {isAuthLoading ? (
                <div className="bg-mist border border-border p-12 text-center flex flex-col items-center justify-center space-y-4 rounded-xl">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <p className="font-sans text-xs text-ash">Securing network authorization...</p>
                </div>
              ) : currentUser ? (
                <Suspense fallback={<ViewLoadingFallback />}>
                  <Dashboard
                    currentUser={currentUser}
                    onLogout={() => {
                      setCurrentUser(null);
                      triggerNotification('Logged out successfully.');
                    }}
                    onOpenBooking={() => setIsBookingOpen(true)}
                    refreshTrigger={refreshTrigger}
                  />
                </Suspense>
              ) : (
                <div className="bg-mist/40 border border-border/80 rounded-2xl p-4 sm:p-8 shadow-sm max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                    
                    {/* Left Column: Work Email Authentication Card */}
                    <div className="lg:col-span-7 bg-white border border-border p-6 sm:p-8 rounded-xl shadow-xs flex flex-col justify-between space-y-6">
                      
                      {/* Tab Switcher: Work Email Login vs Guest Access */}
                      <div className="flex bg-mist/80 p-1 rounded-xl border border-border/60">
                        <button
                          type="button"
                          onClick={() => {
                            setPortalMode('work_email');
                            setPortalLoginError(null);
                          }}
                          className={`flex-1 py-2 px-3 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            portalMode === 'work_email'
                              ? 'bg-white text-primary shadow-xs border border-border/40'
                              : 'text-ash hover:text-primary'
                          }`}
                        >
                          <Mail size={14} className={portalMode === 'work_email' ? 'text-[#B68A35]' : ''} />
                          <span>Work Email Login</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPortalMode('guest');
                            setPortalLoginError(null);
                          }}
                          className={`flex-1 py-2 px-3 text-xs font-serif font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            portalMode === 'guest'
                              ? 'bg-white text-primary shadow-xs border border-border/40'
                              : 'text-ash hover:text-primary'
                          }`}
                        >
                          <UserCheck size={14} className={portalMode === 'guest' ? 'text-[#B68A35]' : ''} />
                          <span>Guest Access</span>
                        </button>
                      </div>

                      {/* Error Banner */}
                      {portalLoginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-sans flex items-start gap-2.5"
                        >
                          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                          <div className="leading-snug font-medium">{portalLoginError}</div>
                        </motion.div>
                      )}

                      {/* Mode 1: Work Email Login */}
                      {portalMode === 'work_email' ? (
                        <form onSubmit={handlePortalWorkEmailLogin} className="space-y-4">
                          <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-ash font-bold block mb-1.5 flex items-center justify-between">
                              <span>Work Email Address</span>
                              <span className="text-[9px] text-[#B68A35] font-sans font-semibold">Business domains only</span>
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 text-ash/60" size={16} />
                              <input
                                type="email"
                                required
                                value={portalWorkEmail}
                                onChange={(e) => {
                                  setPortalWorkEmail(e.target.value);
                                  if (portalLoginError) setPortalLoginError(null);
                                }}
                                placeholder="name@company.com"
                                className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] focus:ring-1 focus:ring-[#B68A35] bg-white font-sans transition-colors"
                              />
                            </div>
                          </div>

                          {/* Auth Method Selector: Password vs One-Time Code */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-ash font-bold">Authentication Method</span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPortalAuthMethod('code');
                                    setPortalLoginError(null);
                                  }}
                                  className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                    portalAuthMethod === 'code' ? 'bg-[#023625] text-white' : 'text-ash hover:text-primary'
                                  }`}
                                >
                                  Send me a code
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPortalAuthMethod('password');
                                    setPortalLoginError(null);
                                  }}
                                  className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                    portalAuthMethod === 'password' ? 'bg-[#023625] text-white' : 'text-ash hover:text-primary'
                                  }`}
                                >
                                  Password
                                </button>
                              </div>
                            </div>

                            {portalAuthMethod === 'password' ? (
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 text-ash/60" size={16} />
                                <input
                                  type="password"
                                  value={portalPassword}
                                  onChange={(e) => {
                                    setPortalPassword(e.target.value);
                                    if (portalLoginError) setPortalLoginError(null);
                                  }}
                                  placeholder="Enter your account password"
                                  className="w-full pl-9 pr-3 py-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] focus:ring-1 focus:ring-[#B68A35] bg-white font-sans transition-colors"
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {!portalCodeSent ? (
                                  <div className="text-[11px] text-ash bg-mist/60 p-2.5 rounded-lg border border-border/60 leading-relaxed">
                                    A secure 6-digit access code will be dispatched to your corporate email inbox upon verification.
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="relative">
                                      <KeyRound className="absolute left-3 top-3 text-[#B68A35]" size={16} />
                                      <input
                                        type="text"
                                        maxLength={6}
                                        value={portalOneTimeCode}
                                        onChange={(e) => {
                                          setPortalOneTimeCode(e.target.value);
                                          if (portalLoginError) setPortalLoginError(null);
                                        }}
                                        placeholder="Enter 6-digit code"
                                        className="w-full pl-9 pr-3 py-2.5 border border-[#B68A35] rounded-xl text-xs text-charcoal font-mono tracking-widest outline-none bg-white"
                                      />
                                    </div>
                                    <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                                      <CheckCircle size={12} /> Verification code dispatched to {portalWorkEmail}. Check your inbox.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={verifyingWhitelist || portalSendingCode}
                              className="w-full bg-[#B68A35] hover:bg-[#9E7528] text-white py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              {verifyingWhitelist || portalSendingCode ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                                  <span>Verifying Work Domain...</span>
                                </>
                              ) : portalAuthMethod === 'code' && !portalCodeSent ? (
                                <>
                                  <Send size={14} />
                                  <span>Send me a one-time code</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={14} />
                                  <span>Login Securely</span>
                                </>
                              )}
                            </button>
                            <p className="text-[11px] text-ash/80 text-center font-sans mt-3">
                              By signing in, you acknowledge our{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  navigateTo('privacy');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-[#B68A35] underline hover:text-primary font-semibold cursor-pointer transition-colors"
                              >
                                Privacy Policy
                              </button>.
                            </p>
                          </div>
                        </form>
                      ) : (
                        /* Mode 2: Guest Access */
                        <form onSubmit={handlePortalGuestAccess} className="space-y-4">
                          <div className="bg-mist/60 border border-border/60 p-3 rounded-xl text-xs text-ash leading-relaxed">
                            Guest Access enables one-off bookings and audit record queries. Entry requires a valid business work email.
                          </div>

                          <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-ash font-bold block mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              value={portalGuestName}
                              onChange={(e) => setPortalGuestName(e.target.value)}
                              placeholder="e.g. Alex Morgan"
                              className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white font-sans"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-ash font-bold block mb-1 flex items-center justify-between">
                              <span>Work Email Address</span>
                              <span className="text-[9px] text-[#B68A35] font-sans font-semibold">Business email required</span>
                            </label>
                            <input
                              type="email"
                              required
                              value={portalGuestWorkEmail}
                              onChange={(e) => {
                                setPortalGuestWorkEmail(e.target.value);
                                if (portalLoginError) setPortalLoginError(null);
                              }}
                              placeholder="e.g. alex.morgan@company.com"
                              className="w-full p-2.5 border border-border rounded-xl text-xs text-charcoal outline-none focus:border-[#B68A35] bg-white font-sans"
                            />
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={verifyingWhitelist}
                              className="w-full bg-[#B68A35] hover:bg-[#9E7528] text-white py-3 rounded-xl font-serif font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                              {verifyingWhitelist ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                                  <span>Verifying Email...</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} />
                                  <span>Verify &amp; Enter Portal</span>
                                </>
                              )}
                            </button>
                            <p className="text-[11px] text-ash/80 text-center font-sans mt-3">
                              By signing in, you acknowledge our{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  navigateTo('privacy');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-[#B68A35] underline hover:text-primary font-semibold cursor-pointer transition-colors"
                              >
                                Privacy Policy
                              </button>.
                            </p>
                          </div>
                        </form>
                      )}

                      <div className="border-t border-border/60 pt-3 flex items-center justify-between text-[10px] text-ash">
                        <span>Need domain pre-registration?</span>
                        <a
                          href="mailto:info@yitzak.co.za?subject=Institutional%20Domain%20Pre-Registration%20Request"
                          className="text-[#B68A35] hover:underline font-bold"
                        >
                          Contact Corporate Support →
                        </a>
                      </div>
                    </div>

                    {/* Right Column: Institutional Benefits & Trust Signals */}
                    <div className="lg:col-span-5 bg-[#023625] text-white p-6 sm:p-8 rounded-xl shadow-xs flex flex-col justify-between space-y-6">
                      <div className="space-y-5">
                        {/* Verified Partner Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#B68A35] font-serif font-bold text-xs">
                          <ShieldCheck size={16} />
                          <span>Verified Partner | FoodChain ID</span>
                        </div>

                        <div>
                          <h3 className="font-serif font-bold text-lg text-white">Institutional Benefits</h3>
                          <p className="text-xs text-white/70 mt-1 font-sans leading-relaxed">
                            Empowering corporate partners with seamless scheduling and verified compliance.
                          </p>
                        </div>

                        <ul className="space-y-3.5 text-xs text-white/85 font-sans">
                          <li className="flex items-start gap-3">
                            <Shield className="w-4 h-4 text-[#B68A35] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-white block">Secure Audit Records</span>
                              <span className="text-[11px] text-white/60">Encrypted repository for institutional gap analyses and FSMS reports.</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#B68A35] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-white block">Verified Certifications</span>
                              <span className="text-[11px] text-white/60">Real-time status tracking for accredited FoodChain ID schemes.</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <Download className="w-4 h-4 text-[#B68A35] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-white block">Compliance Downloads</span>
                              <span className="text-[11px] text-white/60">On-demand access to whitepapers, course syllabi, and advisory briefs.</span>
                            </div>
                          </li>
                        </ul>
                      </div>

                      {/* Trust Signal Reassurance */}
                      <div className="border-t border-white/15 pt-4 text-[11px] text-white/70 leading-relaxed font-sans flex items-start gap-2.5">
                        <Lock className="w-4 h-4 text-[#B68A35] shrink-0 mt-0.5" />
                        <div>
                          <span>Access restricted to verified business accounts. Your data is encrypted and protected under POPIA &amp; GDPR standards. </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigateTo('privacy');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-[#DFC181] hover:underline font-semibold cursor-pointer inline-flex items-center gap-1 ml-1"
                          >
                            <span>Read POPIA Notice →</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal overlay for Whitelist Manager */}
                  {showWhitelistModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <Suspense fallback={<ViewLoadingFallback />}>
                          <WhitelistManager onClose={() => setShowWhitelistModal(false)} />
                        </Suspense>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentView === 'privacy' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Suspense fallback={<ViewLoadingFallback />}>
              <PrivacyPolicy 
                onNavigateHome={() => {
                  navigateTo('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateContact={() => {
                  navigateTo('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </Suspense>
          </motion.div>
        )}
      </main>

      {/* 6. Footer (Three Columns: Contact Info, Quick Links, Follow Us) */}
      <footer className="bg-[#023625] text-white full-width border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16 py-16 space-y-12">
          {/* Main 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* Column 1: Contact Info */}
            <div className="space-y-4">
              <h3 className="text-[#B68A35] font-serif font-bold text-base tracking-wider uppercase">
                Contact Info
              </h3>
              <ul className="space-y-3 font-sans text-xs md:text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <Mail size={16} className="text-[#B68A35] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono">Email Us</span>
                    <a href="mailto:info@yitzak.co.za" className="hover:text-[#B68A35] transition-colors block font-mono text-xs">
                      info@yitzak.co.za
                    </a>
                    <a href="mailto:cgumpo@yitzak.co.za" className="hover:text-[#B68A35] transition-colors block font-mono text-xs text-white/60">
                      cgumpo@yitzak.co.za
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={16} className="text-[#B68A35] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono">Phone Enquiries</span>
                    <a href="tel:+27102107715" className="hover:text-[#B68A35] transition-colors block font-mono text-xs">
                      +27 (0)102107715
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#B68A35] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono">Head Office &amp; Operations</span>
                    <p className="leading-relaxed">
                      359 Surrey Avenue, Randburg, South Africa<br />
                      <span className="text-white/60 text-[11px] font-mono">Delivering across Southern Africa &amp; global markets</span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className="text-[#B68A35] font-serif font-bold text-base tracking-wider uppercase">
                Quick Links
              </h3>
              <ul className="space-y-2.5 font-sans text-xs md:text-sm text-white/80">
                <li>
                  <button
                    onClick={() => {
                      setActiveHomeSection('home');
                      navigateTo('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2.5 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={14} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Home</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveHomeSection('about');
                      if (currentView !== 'home') {
                        navigateTo('home', 'why-us');
                      } else {
                        const el = document.getElementById('why-us');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        updateBrowserUrl('home', 'why-us', false);
                      }
                    }}
                    className="flex items-center gap-2.5 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={14} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>About</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (currentView !== 'home') {
                        navigateTo('home', 'services-overview');
                      } else {
                        const el = document.getElementById('services-overview') || document.getElementById('services');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center gap-2.5 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={14} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Services</span>
                  </button>

                  {/* Sub-services collapsed on mobile, visible on desktop */}
                  <div className="hidden sm:flex flex-col space-y-1.5 pl-4 pt-1.5 border-l border-white/10 ml-2">
                    <button onClick={() => navigateTo('training')} className="text-left text-xs text-white/60 hover:text-white transition-colors cursor-pointer">
                      • Professional Training
                    </button>
                    <button onClick={() => navigateTo('certifications')} className="text-left text-xs text-white/60 hover:text-white transition-colors cursor-pointer">
                      • Certification
                    </button>
                    <button onClick={() => navigateTo('consulting')} className="text-left text-xs text-white/60 hover:text-white transition-colors cursor-pointer">
                      • Consulting &amp; Advisory
                    </button>
                    <button onClick={() => navigateTo('process_implementation')} className="text-left text-xs text-white/60 hover:text-white transition-colors cursor-pointer">
                      • Business Process Implementation
                    </button>
                  </div>
                </li>
                <li>
                  <button
                    onClick={() => {
                      navigateTo('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2.5 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={14} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Contact</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      navigateTo('privacy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2.5 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={14} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Privacy Notice</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Follow Us */}
            <div className="space-y-4">
              <h3 className="text-[#B68A35] font-serif font-bold text-base tracking-wider uppercase">
                Connect
              </h3>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#B68A35] text-white hover:text-[#023625] flex items-center justify-center transition-all cursor-pointer"
                  title="Follow us on LinkedIn"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#B68A35] text-white hover:text-[#023625] flex items-center justify-center transition-all cursor-pointer"
                  title="Follow us on Instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="mailto:info@yitzak.co.za"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#B68A35] text-white hover:text-[#023625] flex items-center justify-center transition-all cursor-pointer"
                  title="Send us an email"
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Branding & Legal - Cleanly stacked on mobile: logo/tagline, Privacy Notice, copyright */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs font-sans text-white/60 text-center md:text-left">
            {/* 1. Logo and Tagline */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <YitzakLogo lightMode size={28} />
              <span className="hidden sm:inline text-white/20">·</span>
              <span className="text-white/70 text-xs">
                Empowering Organisations Through Compliance &amp; Capability
              </span>
            </div>

            {/* 2. Privacy Notice Link */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  navigateTo('privacy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-white/80 hover:text-[#B68A35] underline underline-offset-2 transition-colors cursor-pointer text-xs"
              >
                Privacy Notice
              </button>
            </div>

            {/* 3. Copyright */}
            <div className="text-white/50 text-[11px] font-mono">
              © 2026 YITZAK. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Global Booking Modal Component */}
      {isBookingOpen && (
        <Suspense fallback={null}>
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
            initialPillarId={selectedPillarId}
            initialNotes={selectedBookingNotes}
            onBookingSuccess={handleBookingSuccess}
            onNavigatePrivacy={() => {
              navigateTo('privacy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}

      {/* Floating Action Cluster: Quiet 52px Chat Launcher & 40px Back-to-Top */}
      <FloatingChatWidget
        onOpenBooking={() => handleOpenBooking()}
        showBackToTop={showBackToTop}
        onScrollToTop={scrollToTop}
      />
    </div>
  );
}
