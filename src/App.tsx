import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, BookOpen, Download, HelpCircle, ArrowRight, Menu, X, Calendar, Lock, Sparkles, Check, ChevronRight, ChevronDown, Globe, Mail, Share2, Loader2, ArrowUp, GraduationCap, Award, Building2, Laptop, RefreshCw, FileText, CheckCircle, Lightbulb, AlertCircle, ShieldCheck, Database, Clock, Send, User, Printer } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, initAuth, googleSignIn, db, getAccessToken } from './lib/firebase';
import BookingModal from './components/BookingModal';
import Dashboard from './components/Dashboard';
import TrainingCalendar from './components/TrainingCalendar';
import ContactUs from './components/ContactUs';
import ComplianceCalculator from './components/ComplianceCalculator';
import FAQSection from './components/FAQSection';
import WhitelistManager from './components/WhitelistManager';
import { checkEmailWhitelist, preRegisterGuest } from './lib/whitelist';
import { exportPortfolioToCSV, exportPortfolioToPDF } from './utils/portfolioExport';
import ScrollReveal from './components/ScrollReveal';
import OutboundBridgeModal from './components/OutboundBridgeModal';
import { PILLARS } from './data';

const portfolioCategories = [
  {
    id: 'food-safety',
    label: 'Food Safety',
    title: 'Food Safety Portfolio',
    badge: 'FSSC 22000 & BRCGS',
    courses: [
      {
        title: 'HACCP Advanced Practitioner',
        description: 'Design, implement, and manage advanced hazard analysis and critical control point systems according to international guidelines.',
        tags: ['HACCP', 'Food Safety']
      },
      {
        title: 'FSSC 22000 Implementation & Auditing',
        description: 'Complete guidance on FSSC 22000 requirements, prerequisite programmes (PRPs), and internal/external audit protocols.',
        tags: ['FSSC 22000', 'GFSI']
      },
      {
        title: 'BRCGS Global Standard for Food Safety Issue 9',
        description: 'In-depth training for auditing and implementing the benchmarked BRCGS Food Safety standard.',
        tags: ['BRCGS', 'Food Safety']
      },
      {
        title: 'Food Defence & Food Fraud (TACCP/VACCP)',
        description: 'Proactive threat and vulnerability assessments to secure supply chains from intentional contamination and fraud.',
        tags: ['TACCP', 'VACCP']
      },
      {
        title: 'Good Manufacturing Practices (GMP) & PCQI Requirements',
        description: 'Core prerequisite programmes and Preventive Controls Qualified Individual regulatory alignment for global trade.',
        tags: ['GMP', 'PCQI']
      },
      {
        title: 'Developing a Food Safety Culture',
        description: 'Structured methodologies to assess, drive, and measure food safety culture maturity in food and packaging organisations.',
        tags: ['Culture', 'Leadership']
      }
    ]
  },
  {
    id: 'quality',
    label: 'Quality Management',
    title: 'Quality Management Portfolio',
    badge: 'ISO 9001',
    courses: [
      {
        title: 'ISO 9001:2015 System Implementation',
        description: 'Step-by-step roadmap for building and deploying a highly effective and compliant Quality Management System (QMS).',
        tags: ['ISO 9001', 'Systems']
      },
      {
        title: 'Internal Auditing & Lead Auditor Training',
        description: 'Equipping audit teams with professional techniques to perform rigorous internal and supplier quality audits using ISO 19011 standards.',
        tags: ['Auditing', 'ISO 19011']
      },
      {
        title: 'Corrective & Preventive Action (CAPA) Workshop',
        description: 'Root cause analysis techniques (5 Whys, Fishbone), corrective action formulation, and compliance efficacy validation.',
        tags: ['CAPA', 'Problem Solving']
      },
      {
        title: 'Supplier Auditing & Quality Assurance',
        description: 'Establishing robust vendor assessment programmes, service level agreements, and external supply quality compliance.',
        tags: ['Suppliers', 'Risk']
      },
      {
        title: 'Documentation Control & Quality Records',
        description: 'Systematic approach to managing standard operating procedures (SOPs), documentation version control, and operational data integrity.',
        tags: ['Documentation', 'QMS']
      }
    ]
  },
  {
    id: 'environmental',
    label: 'Environmental',
    title: 'Environmental Management',
    badge: 'ISO 14001',
    courses: [
      {
        title: 'ISO 14001:2015 System Implementation',
        description: 'Designing, running, and maintaining an Environmental Management System (EMS) that minimizes footprint and ensures legal compliance.',
        tags: ['ISO 14001', 'EMS']
      },
      {
        title: 'Climate Change Integration & Sustainability',
        description: 'Translating greenhouse gas protocols, carbon footprints, climate adaptation, and climate risks into actionable corporate strategy.',
        tags: ['Carbon', 'Sustainability']
      },
      {
        title: 'Environmental Compliance & Impact Assessments',
        description: 'Identifying environmental aspects, evaluating impacts, and establishing robust regulatory compliance matrices.',
        tags: ['Compliance', 'Rigor']
      }
    ]
  },
  {
    id: 'ohs',
    label: 'Occupational Health',
    title: 'Occupational Health & Safety',
    badge: 'ISO 45001',
    courses: [
      {
        title: 'ISO 45001:2018 System Implementation',
        description: 'Deploying an Occupational Health and Safety Management System (OHSMS) to reduce workplace incidents and secure compliance.',
        tags: ['ISO 45001', 'OHS']
      },
      {
        title: 'Hazard Identification & Risk Assessment (HIRA)',
        description: 'Proactive methodologies to identify workplace hazards, assess occupational risks, and implement control hierarchies.',
        tags: ['HIRA', 'Safety']
      },
      {
        title: 'Emergency Preparedness & Response Planning',
        description: 'Designing resilient emergency response systems, disaster management protocols, evacuation plans, and business continuity plans.',
        tags: ['Preparedness', 'Crisis']
      },
      {
        title: 'Establishing High-Performance Safety Committees',
        description: 'Empowering employee-representative safety forums with legal knowledge, hazard identification, and practical oversight skills.',
        tags: ['Committees', 'Culture']
      }
    ]
  },
  {
    id: 'ims',
    label: 'Integrated Management',
    title: 'Integrated Management Systems',
    badge: 'IMS Integration',
    courses: [
      {
        title: 'IMS Implementation Frameworks',
        description: 'Unifying ISO 9001, ISO 14001, and ISO 45001 into a singular, streamlined, and highly efficient management framework.',
        tags: ['IMS', 'Efficiency']
      },
      {
        title: 'IMS Internal Auditor',
        description: 'Conducting multi-standard integrated audits covering quality, environment, and occupational health and safety simultaneously.',
        tags: ['Integrated Audit', 'ISO 19011']
      },
      {
        title: 'Business Process Integration & Harmonisation',
        description: 'Aligning operational procedures with corporate standards to eliminate duplication and reduce document drag.',
        tags: ['Process', 'Lean']
      }
    ]
  }
];

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
  const [currentView, setCurrentView] = useState<'home' | 'consulting' | 'training' | 'certifications' | 'calendar' | 'contact'>('home');
  const [activeSidebarSection, setActiveSidebarSection] = useState('food-safety');
  const [selectedBookingNotes, setSelectedBookingNotes] = useState('');
  const [portalGuestName, setPortalGuestName] = useState('');
  const [portalGuestEmail, setPortalGuestEmail] = useState('');
  const [portalShowGuestForm, setPortalShowGuestForm] = useState(false);
  const [verifyingWhitelist, setVerifyingWhitelist] = useState(false);
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);

  const handleVerifyAndEnterPortal = async () => {
    if (!portalGuestName.trim() || !portalGuestEmail.trim()) {
      triggerNotification('Please enter both your name and email to proceed.');
      return;
    }
    if (!portalGuestEmail.includes('@')) {
      triggerNotification('Please enter a valid email address.');
      return;
    }

    setVerifyingWhitelist(true);
    try {
      const check = await checkEmailWhitelist(portalGuestEmail);
      let displayName = portalGuestName.trim();

      if (check.isWhitelisted) {
        if (check.guest?.name && check.guest.name !== 'Authorized Guest') {
          displayName = check.guest.name;
        }
        triggerNotification(`✓ Whitelist Verified! Welcome ${displayName}.`);
      } else {
        await preRegisterGuest(
          portalGuestEmail, 
          portalGuestName, 
          'Pre-registered on Guest Portal Entry', 
          'guest', 
          'active'
        );
        triggerNotification(`✓ Guest email registered! Welcome ${displayName || portalGuestEmail.trim()}.`);
      }

      const mockUser: FirebaseUser = {
        uid: 'guest_' + Date.now(),
        displayName,
        email: portalGuestEmail.trim(),
        photoURL: null,
        emailVerified: false,
        isAnonymous: true
      } as unknown as FirebaseUser;

      setCurrentUser(mockUser);
    } catch (e) {
      console.error('Whitelist check error:', e);
      const mockUser: FirebaseUser = {
        uid: 'guest_' + Date.now(),
        displayName: portalGuestName.trim(),
        email: portalGuestEmail.trim(),
        photoURL: null,
        emailVerified: false,
        isAnonymous: true
      } as unknown as FirebaseUser;
      setCurrentUser(mockUser);
      triggerNotification('Logged in as guest.');
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

  // Newsletter Subscription Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [emailDispatchStatus, setEmailDispatchStatus] = useState<'sent' | 'pending' | 'failed'>('pending');
  const [showBriefingPreview, setShowBriefingPreview] = useState(false);
  const [resendingDigest, setResendingDigest] = useState(false);

  const navigateTo = (view: 'home' | 'consulting' | 'training' | 'certifications' | 'calendar' | 'contact', elementId?: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
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

  // Initialize Auth state on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    );

    // Also directly hook into the standard auth state in case token is already refreshed
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
      unsubAuth();
    };
  }, []);

  // Intercept FoodChain ID external links to capture and track partner attribution
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.href.includes('foodchainid.com')) {
        e.preventDefault();
        const url = anchor.href;
        
        // Extract a friendly scheme name from inner text or title
        let schemeName = anchor.title || anchor.innerText || 'FoodChain ID Partner Scheme';
        schemeName = schemeName.replace('↗', '').trim();
        if (!schemeName || schemeName.length < 3) {
          schemeName = 'FoodChain ID Academy or Scheme';
        }
        
        setReferralTarget({ url, schemeName });
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  // Monitor scroll for Back to Top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleOpenBooking = (pillarId = 'compliance', initialNotes = '') => {
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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.trim()) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }
    const emailVal = newsletterEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    setNewsletterSubmitting(true);
    setNewsletterError(null);
    setSubscribedEmail(emailVal);
    setEmailDispatchStatus('pending');

    try {
      const docId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const subscriptionData = {
        email: emailVal,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // Dynamically import setDoc/doc
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'newsletter_subscriptions', docId), subscriptionData);

      // Attempt immediate Gmail API dispatch if token available
      try {
        const token = await getAccessToken();
        if (token) {
          const { sendWelcomeNewsletterEmail } = await import('./lib/googleApi');
          await sendWelcomeNewsletterEmail(token, emailVal);
          setEmailDispatchStatus('sent');
          triggerNotification(`✓ Subscription confirmed! Welcome email sent to ${emailVal}.`);
        } else {
          setEmailDispatchStatus('pending');
          triggerNotification(`✓ Subscription confirmed for ${emailVal}!`);
        }
      } catch (emailErr) {
        console.warn('Welcome email dispatch skipped/failed:', emailErr);
        setEmailDispatchStatus('pending');
        triggerNotification(`✓ Subscription confirmed for ${emailVal}!`);
      }

      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch (err: any) {
      console.warn('Newsletter submission error, using local fallback: ', err);
      try {
        const localSubs = JSON.parse(localStorage.getItem('yitzak_newsletter_subscriptions') || '[]');
        localSubs.push({ email: emailVal, createdAt: new Date().toISOString() });
        localStorage.setItem('yitzak_newsletter_subscriptions', JSON.stringify(localSubs));
        setNewsletterSuccess(true);
        setNewsletterEmail('');
        setEmailDispatchStatus('pending');
        triggerNotification(`✓ Subscription confirmed for ${emailVal}!`);
      } catch (localErr) {
        setNewsletterError('An error occurred. Please try again later.');
      }
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const handleManualDispatchDigest = async (targetEmail: string) => {
    setResendingDigest(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        try {
          const res = await googleSignIn();
          token = res?.accessToken || null;
        } catch (authErr) {
          console.warn('Google sign-in cancelled or failed:', authErr);
        }
      }
      if (!token) {
        triggerNotification('Google Account authentication required to send direct confirmation emails.');
        return;
      }
      const { sendWelcomeNewsletterEmail } = await import('./lib/googleApi');
      await sendWelcomeNewsletterEmail(token, targetEmail);
      setEmailDispatchStatus('sent');
      triggerNotification(`✓ Welcome briefing & confirmation email sent to ${targetEmail}! Please check your inbox.`);
    } catch (err: any) {
      console.error('Failed to dispatch welcome digest:', err);
      triggerNotification(`Email dispatch notice: ${err.message || 'Authentication required.'}`);
    } finally {
      setResendingDigest(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans selection:bg-antique-gold selection:text-white overflow-x-hidden min-h-screen flex flex-col">
      
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
      <header className="bg-surface-container-lowest text-secondary docked full-width top-0 sticky border-b border-outline-variant flat no shadows z-50">
        <div className="flex justify-between items-center w-full px-4 md:px-16 py-4 max-w-[1280px] mx-auto">
          <button 
            onClick={() => navigateTo('home')}
            className="font-display-hero text-headline-md font-bold tracking-tight text-primary dark:text-primary-fixed cursor-pointer text-left focus:outline-none"
          >
            YITZAK
          </button>
          
          <nav className="hidden lg:flex gap-5 xl:gap-7 items-center font-sans text-xs xl:text-sm">
            <button 
              onClick={() => {
                navigateTo('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`font-semibold transition-colors duration-200 cursor-pointer ${
                currentView === 'home' 
                  ? 'text-secondary border-b-2 border-secondary pb-0.5 font-bold' 
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => navigateTo('consulting')}
              className={`font-semibold transition-colors duration-200 cursor-pointer ${
                currentView === 'consulting' 
                  ? 'text-secondary border-b-2 border-secondary pb-0.5 font-bold' 
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Consulting
            </button>
            <button 
              onClick={() => navigateTo('training')}
              className={`font-semibold transition-colors duration-200 cursor-pointer ${
                currentView === 'training' 
                  ? 'text-secondary border-b-2 border-secondary pb-0.5 font-bold' 
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Training
            </button>
            <button 
              onClick={() => navigateTo('certifications')}
              className={`font-semibold transition-colors duration-200 cursor-pointer ${
                currentView === 'certifications' 
                  ? 'text-secondary border-b-2 border-secondary pb-0.5 font-bold' 
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Certifications
            </button>
            <button 
              onClick={() => navigateTo('calendar')}
              className={`font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'calendar' 
                  ? 'text-secondary border-b-2 border-secondary pb-0.5 font-bold' 
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              <Calendar size={14} className="text-[#B68A35] shrink-0" />
              <span>Calendar</span>
            </button>
            <button 
              onClick={handleDownloadWhitepaper}
              className="text-on-surface-variant font-semibold hover:text-secondary transition-colors duration-200 cursor-pointer"
            >
              Knowledge Centre
            </button>
            <button 
              onClick={() => navigateTo('contact')}
              className={`font-semibold transition-colors duration-200 cursor-pointer ${
                currentView === 'contact' 
                  ? 'text-secondary border-b-2 border-secondary pb-0.5 font-bold' 
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
            >
              Contact Us
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => {
                navigateTo('home');
                setTimeout(() => {
                  const el = document.getElementById('portal');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className={`text-xs xl:text-sm font-semibold hover:text-secondary transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded border border-border/60 ${
                currentUser ? 'bg-primary/5 text-primary border-primary/30 font-bold' : 'text-on-surface-variant bg-mist/60 hover:bg-mist'
              }`}
            >
              <User size={14} className="text-[#B68A35]" />
              <span>{currentUser ? 'Client Portal' : 'Portal'}</span>
            </button>

            <button 
              onClick={() => handleOpenBooking()}
              className="btn-primary text-xs xl:text-sm px-4 py-2 cursor-pointer focus:outline-none font-bold uppercase tracking-wider shrink-0 shadow-xs"
            >
              Request a Consultation
            </button>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-primary cursor-pointer p-2 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-b border-border overflow-hidden px-6 py-4 space-y-3"
            >
              <button 
                onClick={() => {
                  navigateTo('home');
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className={`block text-left w-full font-sans text-xs uppercase tracking-widest py-2 cursor-pointer font-bold ${
                  currentView === 'home' ? 'text-secondary font-extrabold' : 'text-on-surface-variant'
                }`}
              >
                About Us
              </button>
              <button 
                onClick={() => {
                  navigateTo('consulting');
                  setMobileMenuOpen(false);
                }} 
                className={`block text-left w-full font-sans text-xs uppercase tracking-widest py-2 cursor-pointer font-bold ${
                  currentView === 'consulting' ? 'text-secondary font-extrabold' : 'text-on-surface-variant'
                }`}
              >
                Consulting Services
              </button>
              <button 
                onClick={() => {
                  navigateTo('training');
                  setMobileMenuOpen(false);
                }}
                className={`block text-left w-full font-sans text-xs uppercase tracking-widest py-2 cursor-pointer font-bold ${
                  currentView === 'training' ? 'text-secondary font-extrabold' : 'text-on-surface-variant'
                }`}
              >
                Training Curricula
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigateTo('certifications');
                }} 
                className={`block text-left w-full font-sans text-xs uppercase tracking-widest py-2 cursor-pointer font-bold ${
                  currentView === 'certifications' ? 'text-secondary font-extrabold' : 'text-on-surface-variant'
                }`}
              >
                Accredited Certifications
              </button>
              <button 
                onClick={() => {
                  navigateTo('calendar');
                  setMobileMenuOpen(false);
                }}
                className={`block text-left w-full font-sans text-xs uppercase tracking-widest py-2 cursor-pointer font-bold ${
                  currentView === 'calendar' ? 'text-[#B68A35] font-extrabold' : 'text-on-surface-variant'
                }`}
              >
                Training Calendar
              </button>
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDownloadWhitepaper();
                }} 
                className="block text-left w-full font-sans text-xs uppercase tracking-widest text-on-surface-variant py-2 cursor-pointer font-bold"
              >
                Knowledge Centre
              </button>
              <button 
                onClick={() => {
                  navigateTo('contact');
                  setMobileMenuOpen(false);
                }} 
                className={`block text-left w-full font-sans text-xs uppercase tracking-widest py-2 cursor-pointer font-bold ${
                  currentView === 'contact' ? 'text-secondary font-extrabold' : 'text-on-surface-variant'
                }`}
              >
                Contact Us
              </button>
              <button 
                onClick={() => {
                  navigateTo('home');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('portal');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }} 
                className="block text-left w-full font-sans text-xs uppercase tracking-widest text-primary py-2 cursor-pointer font-extrabold flex items-center gap-2"
              >
                <User size={14} className="text-[#B68A35]" />
                <span>{currentUser ? 'Client Portal' : 'Portal Log In'}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleOpenBooking();
                }}
                className="w-full text-center btn-primary text-xs py-3 uppercase cursor-pointer font-bold tracking-wider"
              >
                Request a Consultation
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <>
            {/* Elegant Corporate Hero Section */}
            <section className="relative pt-12 md:pt-20 pb-20 px-4 md:px-16 max-w-[1280px] mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 space-y-6 z-10">
                  <ScrollReveal direction="up" delay={0.05}>
                    <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-full mb-6">
                      <span className="w-2 h-2 rounded-full bg-[#B68A35] animate-pulse"></span>
                      <span className="text-primary font-sans text-[11px] uppercase tracking-widest font-bold">
                        Developing Competence. Enabling Compliance.
                      </span>
                    </div>

                    <h1 className="font-serif text-[44px] md:text-[62px] leading-[48px] md:leading-[68px] tracking-tight text-primary font-bold mb-6">
                      Build Competence.<br />
                      <span className="text-[#B68A35]">Strengthen Performance.</span>
                    </h1>

                    <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed max-w-xl mb-6">
                      YITZAK is an elite institutional consulting and professional training firm. We provide industry-leading guidance, expert advisory, and accredited standards implementation to help organisations develop capable teams, streamline management systems, and master compliance.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2 mb-6">
                      <button 
                        onClick={() => navigateTo('training')}
                        className="bg-primary hover:bg-primary/95 text-white font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-md"
                      >
                        <span>Explore Training Portfolio</span>
                        <ArrowRight size={14} />
                      </button>
                      <button 
                        onClick={() => handleOpenBooking()}
                        className="border border-[#B68A35] text-[#B68A35] hover:bg-[#B68A35]/5 font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded cursor-pointer transition-all active:scale-95 text-center"
                      >
                        Book a Consultation
                      </button>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-wrap gap-x-6 gap-y-3 items-center text-xs text-on-surface-variant font-sans">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#B68A35] rounded-full"></div>
                        <span>Official FoodChain ID Partner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#B68A35] rounded-full"></div>
                        <span>20+ ISO & GFSI Standards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#B68A35] rounded-full"></div>
                        <span>Interactive Client Portal</span>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Floating Modern Image Layout */}
                <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                  <ScrollReveal direction="left" delay={0.15}>
                    <div className="relative z-10 rounded-2xl overflow-hidden aspect-[4/3.5] border-4 border-white shadow-ambient bg-surface">
                      <img 
                        className="w-full h-full object-cover filter brightness-95" 
                        alt="Corporate executive workshop" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh8qjKo1mwyVEx2R4hcz_37lRzkxGHkT6V-oq1p6-aNLPzSIK1PeKocPwmsavBw-jzyWVB7YGBWC7mQGezHM9vJgXqXzW6XP-LZ0F3KVj7xjUPf9A30emofQLCDZzMztfEV_elrnRp7EgBGuSsJrD3EK0M9h-zOPiHOpehrbBdtNYBmiSgUTd0LjaWVrc-kU93-69KQ9lqCIkb1UTr7OvswZEbEAmW5BkzB5_ThEx55RADoHMnem4L" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/45 to-transparent"></div>
                    </div>

                    {/* Absolute Badge Card 1 */}
                    <a 
                      href="https://www.foodchainid.com/academy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute -left-6 bottom-8 z-20 bg-[#023625] text-white p-4 rounded-xl shadow-lg border border-white/10 max-w-[200px] hidden sm:block hover:bg-[#034d35] hover:scale-105 transition-all group duration-200 cursor-pointer"
                      title="Visit FoodChain ID Academy (Opens in new tab)"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Award className="text-[#B68A35]" size={18} />
                        <span className="font-serif text-xs font-bold group-hover:text-[#B68A35] transition-colors">Partner Ecosystem</span>
                      </div>
                      <p className="font-sans text-[10px] text-white/80 leading-relaxed">
                        Integrated access to global courses via FoodChain ID Academy.
                      </p>
                      <div className="mt-2 text-[#B68A35] font-sans text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
                        <span>Visit Academy</span>
                        <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                      </div>
                    </a>

                    {/* Absolute Badge Card 2 */}
                    <div className="absolute -right-6 top-8 z-20 bg-white border border-border p-4 rounded-xl shadow-lg max-w-[180px] hidden sm:block">
                      <span className="font-serif text-2xl font-bold text-primary block">2026</span>
                      <span className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Latest Edition Curricula</span>
                    </div>

                    {/* Geometric background elements */}
                    <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full bg-[#B68A35]/10 z-0"></div>
                    <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-primary/5 z-0"></div>
                  </ScrollReveal>
                </div>
              </div>
            </section>

            {/* About YITZAK & Interactive Focus (Page 2 transition) */}
            <section className="py-16 md:py-24 bg-mist border-t border-b border-border">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Who We Are */}
                  <div className="lg:col-span-6 space-y-6">
                    <ScrollReveal direction="right" delay={0.05}>
                      <div className="space-y-1 mb-6">
                        <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold block">About YITZAK</span>
                        <h2 className="font-serif text-3xl md:text-[40px] leading-tight text-primary font-bold">
                          Building competence.<br />Driving business excellence.
                        </h2>
                      </div>
                      <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed mb-6">
                        We help organisations develop capable people, strengthen management systems, and meet industry requirements with confidence, through professional training, consulting, and certification support.
                      </p>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed opacity-90">
                        Our approach pairs practical industry experience with internationally aligned standards, delivering learning and guidance that improve performance, reduce risk, and create lasting value. Whether you are investing in workforce development, implementing management systems, or preparing for an external audit, we give you learning and expert guidance you can put to work immediately.
                      </p>
                    </ScrollReveal>
                  </div>

                  {/* Right Column: Interactive Focus Principles */}
                  <div className="lg:col-span-6">
                    <ScrollReveal direction="left" delay={0.1}>
                      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                        <span className="text-[#B68A35] font-sans text-[11px] uppercase tracking-widest font-bold block mb-4">
                          Our Guiding Principles
                        </span>
                        <h3 className="font-serif text-lg text-primary font-bold mb-4">Our Core Focus is Simple</h3>
                        
                        <div className="space-y-4">
                          {[
                            {
                              id: '01',
                              title: 'Develop capable people.',
                              summary: 'Practical knowledge tailored for execution.',
                              desc: 'Yitzak designs and delivers training that builds deep personal competence. We translate dense standards and regulations into clean, actionable work practices that employees can apply the very next day.'
                            },
                            {
                              id: '02',
                              title: 'Build stronger organisations.',
                              summary: 'Systematizing compliance, eliminating risk.',
                              desc: 'We support organisations in constructing, configuring, and refining their standard operating procedures (SOPs). This alignment creates smooth workflows that easily withstand demanding external audits.'
                            },
                            {
                              id: '03',
                              title: 'Create sustainable performance.',
                              summary: 'Long-term partnership values.',
                              desc: 'We do not believe in one-and-done events. We maintain deep strategic partnerships, assisting with system overrides, continuous refresher learning, and custom assessments as standards evolve.'
                            }
                          ].map((p) => {
                            const isActive = activeFocusPrinciple === p.id;
                            return (
                              <div 
                                key={p.id}
                                onClick={() => setActiveFocusPrinciple(p.id)}
                                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                                  isActive 
                                    ? 'bg-primary/5 border-primary shadow-sm' 
                                    : 'bg-transparent border-border hover:bg-surface'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <span className={`font-mono text-sm font-bold ${isActive ? 'text-[#B68A35]' : 'text-outline'}`}>
                                      {p.id}
                                    </span>
                                    <h4 className="font-serif text-sm font-bold text-primary">{p.title}</h4>
                                  </div>
                                  <ChevronDown 
                                    size={18} 
                                    className={`transition-transform duration-200 ${
                                      isActive ? 'rotate-180 text-[#B68A35]' : 'text-outline hover:text-primary'
                                    }`} 
                                  />
                                </div>
                                
                                <AnimatePresence>
                                  {isActive && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden border-t border-border/60 pt-3"
                                    >
                                      <p className="font-sans text-[11px] uppercase tracking-wider text-[#B68A35] font-bold mb-1">{p.summary}</p>
                                      <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{p.desc}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>

                </div>
              </div>
            </section>

            {/* Strategic Service Pillars (Page 3 transition) */}
            <section id="expertise" className="py-16 md:py-24 bg-white border-b border-border scroll-mt-24">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16 space-y-16">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Strategic Support</span>
                    <h2 className="font-serif text-3xl md:text-[44px] text-primary font-bold">Our core services</h2>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                      Three integrated areas, with professional training at the heart, fully backed by strategic consulting and internationally accredited certification.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.15
                      }
                    }
                  }}
                  className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                >
                  {/* Service 1 */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="h-full"
                  >
                    <div 
                      onClick={() => navigateTo('training')}
                      className="bg-mist border border-border p-8 rounded-xl flex flex-col justify-between h-full shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="space-y-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <GraduationCap className="text-primary group-hover:text-white transition-colors" size={24} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-serif text-xl md:text-2xl text-primary font-bold group-hover:text-secondary transition-colors flex items-center justify-between">
                            <span>Professional Training</span>
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </h3>
                          <span className="text-xs uppercase tracking-widest text-[#B68A35] font-bold block">The Heart of Our Business</span>
                        </div>
                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Practical, instructor-led training that builds knowledge, competence, and confidence across management systems and industry disciplines.
                        </p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-border/60">
                        <span className="text-[10px] font-mono uppercase text-outline tracking-wider block mb-2">Streams &amp; Methods:</span>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {['Yitzak Programmes', 'FoodChain ID Courses', 'In-House & Customised'].map((item, idx) => (
                            <button 
                              key={idx} 
                              onClick={(e) => { e.stopPropagation(); navigateTo('training', 'portfolio'); }}
                              className="bg-white hover:bg-forest-green/10 border border-border/40 hover:border-forest-green/30 text-[10px] text-primary px-2.5 py-1 font-sans rounded font-semibold transition-colors cursor-pointer"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-primary group-hover:text-secondary inline-flex items-center gap-1.5 transition-colors">
                          <span>Explore Professional Training</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 2 */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="h-full"
                  >
                    <div 
                      onClick={() => navigateTo('consulting')}
                      className="bg-mist border border-border p-8 rounded-xl flex flex-col justify-between h-full shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="space-y-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <Lightbulb className="text-primary group-hover:text-white transition-colors" size={24} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-serif text-xl md:text-2xl text-primary font-bold group-hover:text-secondary transition-colors flex items-center justify-between">
                            <span>Consulting &amp; Advisory</span>
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </h3>
                          <span className="text-xs uppercase tracking-widest text-[#B68A35] font-bold block">Apply What You Learn</span>
                        </div>
                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Practical guidance that helps organisations implement learning and improve systems, processes, and performance.
                        </p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-border/60">
                        <span className="text-[10px] font-mono uppercase text-outline tracking-wider block mb-2">Service Areas:</span>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {['Gap Assessments', 'System Development', 'Documentation Support', 'Internal Audits'].map((item, idx) => (
                            <span key={idx} className="bg-white border border-border/40 text-[10px] text-primary px-2.5 py-1 font-sans rounded font-semibold">
                              {item}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-primary group-hover:text-secondary inline-flex items-center gap-1.5 transition-colors">
                          <span>Explore Consulting Services</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 3 */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className="h-full"
                  >
                    <div 
                      onClick={() => navigateTo('certifications')}
                      className="bg-mist border border-border p-8 rounded-xl flex flex-col justify-between h-full shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      <div className="space-y-6">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <Award className="text-primary group-hover:text-white transition-colors" size={24} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-serif text-xl md:text-2xl text-primary font-bold group-hover:text-secondary transition-colors flex items-center justify-between">
                            <span>Certifications</span>
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </h3>
                          <span className="text-xs uppercase tracking-widest text-[#B68A35] font-bold block">With FoodChain ID</span>
                        </div>
                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Accredited, internationally recognised certification schemes. We guide organisations from scoping and audit readiness through to a valid certificate.
                        </p>
                      </div>
                      <div className="mt-8 pt-6 border-t border-border/60">
                        <span className="text-[10px] font-mono uppercase text-outline tracking-wider block mb-2">Accredited Schemes:</span>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {[
                            { name: 'Product & Label Certification', url: 'https://www.foodchainid.com/product-and-label-certification/' },
                            { name: 'GLOBALG.A.P.', url: 'https://www.foodchainid.com/globalg-a-p/' },
                            { name: 'BRCGS Certifications', url: 'https://www.foodchainid.com/brcgs-certifications/' }
                          ].map((item, idx) => (
                            <button 
                              key={idx} 
                              onClick={(e) => { e.stopPropagation(); navigateTo('certifications'); }}
                              className="bg-white hover:bg-forest-green/10 border border-border/40 hover:border-forest-green/30 text-[10px] text-primary px-2.5 py-1 font-sans rounded font-semibold transition-colors cursor-pointer"
                              title={`Explore ${item.name} scheme details`}
                            >
                              <span>{item.name}</span>
                            </button>
                          ))}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-primary group-hover:text-secondary inline-flex items-center gap-1.5 transition-colors">
                          <span>View Accredited Certifications</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Trust bar */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-[#023625]/5 border border-primary/10 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-[#023625] flex items-center justify-center flex-shrink-0 text-[#B68A35] shadow-sm">
                      <CheckCircle size={22} />
                    </div>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                      On completion, participants receive the applicable certificate from Yitzak or FoodChain ID, depending on the programme. Certification is delivered through our partnership with <strong className="text-primary font-bold">FoodChain ID</strong> and its accredited certification bodies, giving clients a single, trusted route from training to certification.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* Interactive Compliance & ROI Calculator Section */}
            <ComplianceCalculator onInquire={(notes) => handleOpenBooking('compliance', notes)} />



            {/* Accredited Certifications Detail (Page 5 transition) */}
            <section className="py-16 md:py-24 bg-white border-b border-border">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16 space-y-16">
                {/* Quote block */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-[#023625] text-white p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full pointer-events-none -mr-24 -mb-24"></div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center z-10 relative">
                      <div className="md:col-span-6 space-y-2 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                        <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold block">Our Philosophy</span>
                        <blockquote className="font-serif text-xl md:text-2xl font-semibold leading-snug">
                          "From first gap assessment to final certificate, one partner carries you through."
                        </blockquote>
                      </div>
                      <div className="md:col-span-6 md:pl-8">
                        <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
                          Training, readiness, and accredited certification in a single relationship. No hand-offs, no lost context, no starting over.
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* Interactive Industries We Serve */}
            <section id="industries" className="py-16 md:py-24 bg-mist border-b border-border scroll-mt-24">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16 space-y-12">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Markets &amp; Sectors</span>
                    <h2 className="font-serif text-3xl md:text-[44px] text-primary font-bold">Industries We Serve</h2>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                      We tailor compliance and technical standards to the operational realities of your sector across Southern Africa.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                {/* Streamlined Sector Filters & Search */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-start">
                      {[
                        { id: 'all', label: 'All Sectors' },
                        { id: 'food', label: 'Food & Agriculture' },
                        { id: 'industrial', label: 'Industrial & Manufacturing' },
                        { id: 'services', label: 'Logistics & Services' },
                        { id: 'enterprise', label: 'Enterprise & Public' }
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => {
                            setIndustrySectorFilter(btn.id);
                            setIndustrySearchQuery('');
                          }}
                          className={`px-4 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            industrySectorFilter === btn.id && !industrySearchQuery
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-white border border-border text-on-surface-variant hover:bg-mist'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    {/* Quick Search */}
                    <div className="relative w-full md:w-64 shrink-0">
                      <input 
                        type="text"
                        value={industrySearchQuery}
                        onChange={(e) => setIndustrySearchQuery(e.target.value)}
                        placeholder="Search sector or standard..."
                        className="w-full text-xs font-sans border border-border rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#B68A35] text-primary placeholder-outline bg-white"
                      />
                      {industrySearchQuery && (
                        <button 
                          onClick={() => setIndustrySearchQuery('')}
                          className="absolute right-3 top-2.5 text-xs text-outline font-sans font-bold hover:text-primary"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Display Area: Pillar Overview in "All Sectors" or Specific Sub-sector Cards when filtered */}
                <ScrollReveal direction="up" delay={0.15}>
                  {(() => {
                    // Defined 4 Core Pillar Clusters for clean "All Sectors" view
                    const pillarClusters = [
                      {
                        id: 'food-agri',
                        title: 'Food & Agriculture',
                        badge: 'Food Safety & GFSI',
                        icon: ShieldCheck,
                        desc: 'End-to-end compliance for food processing, beverage manufacturing, packaging plants, and agricultural supply chains.',
                        highlights: ['BRCGS Food Safety', 'GLOBALG.A.P. Farm Assurance', 'HACCP & ISO 22000', 'Non-GMO & Organic'],
                        action: 'Inquiry: Food & Agri Compliance'
                      },
                      {
                        id: 'ind-mfg',
                        title: 'Industrial & Manufacturing',
                        badge: 'GMP & Safety ISOs',
                        icon: Building2,
                        desc: 'Engineering cleanrooms, pharmaceutical GMP compliance, assembly line quality systems, and construction safety frameworks.',
                        highlights: ['ISO 9001 QMS', 'ISO 45001 Occupational Safety', 'Pharmaceutical GMP', 'Cleanroom Protocols'],
                        action: 'Inquiry: Industrial & Manufacturing'
                      },
                      {
                        id: 'log-serv',
                        title: 'Logistics, Retail & Healthcare',
                        badge: 'Storage & Supply Chain',
                        icon: Award,
                        desc: 'Cold storage monitoring, retail fresh supply governance, distribution auditing, and healthcare facility sanitation.',
                        highlights: ['BRCGS Storage & Distribution', 'Cold Chain GDP Audits', 'Retail Vendor Governance', 'Healthcare Hygiene'],
                        action: 'Inquiry: Logistics & Supply Chain'
                      },
                      {
                        id: 'corp-pub',
                        title: 'Enterprise & Public Sector',
                        badge: 'Scalable Institutional Frameworks',
                        icon: Globe,
                        desc: 'Lean, scalable compliance for growing SMEs, integrated multi-site ISO management for corporate groups, and public sector roadmaps.',
                        highlights: ['ISO 14001 Environmental', 'Integrated ISO Systems', 'SME Scale-up Systems', 'Institutional Governance'],
                        action: 'Inquiry: Enterprise Governance'
                      }
                    ];

                    const detailedSectors = [
                      { id: '01', name: 'Food Manufacturing', category: 'food', desc: 'Core packaging, food hygiene compliance and GFSI standards implementation.', standards: ['BRCGS', 'HACCP'] },
                      { id: '02', name: 'Beverage Production', category: 'food', desc: 'SOP layouts, water resource conservation and pasteurisation audits.', standards: ['ISO 22000', 'SOPs'] },
                      { id: '03', name: 'Agriculture & Produce', category: 'food', desc: 'Farm assurance schemes, GLOBALG.A.P. audits, and crop safety procedures.', standards: ['GLOBALG.A.P.', 'GRASP'] },
                      { id: '04', name: 'Pharmaceuticals & Medical', category: 'industrial', desc: 'Cleanroom engineering, GMP alignment and rigorous regulatory compliance.', standards: ['GMP', 'Cleanroom'] },
                      { id: '05', name: 'General Manufacturing', category: 'industrial', desc: 'Hardware assembly, quality guidelines (ISO 9001), and operational safety.', standards: ['ISO 9001', 'Lean'] },
                      { id: '06', name: 'Logistics & Warehousing', category: 'services', desc: 'Storage and distribution standards, cold chain monitoring, and BRCGS alignment.', standards: ['BRCGS S&D', 'Cold Chain'] },
                      { id: '07', name: 'Retail & Supermarket Supply', category: 'services', desc: 'Supplier audit management, shelf freshness protocols, and local vendor governance.', standards: ['Vendor Audits', 'QMS'] },
                      { id: '08', name: 'Hospitality & Catering', category: 'services', desc: 'Hotel sanitation, catering hazards assessment, and customer experience QMS.', standards: ['HACCP', 'Hygiene'] },
                      { id: '09', name: 'Healthcare Facilities', category: 'services', desc: 'Inpatient safety metrics, sterilisation assurance, and occupational risk compliance.', standards: ['ISO 45001', 'Infection Control'] },
                      { id: '10', name: 'Construction & Civil', category: 'industrial', desc: 'ISO 45001 safety structures, protective gear deployment, and emergency setups.', standards: ['ISO 45001', 'Site Safety'] },
                      { id: '11', name: 'SMEs & Growing Enterprises', category: 'enterprise', desc: 'Lean compliance systems designed to scale without heavy operational overhead.', standards: ['Lean QMS', 'Scalable'] },
                      { id: '12', name: 'Large Corporate & Public Sector', category: 'enterprise', desc: 'Multi-site integrated management frameworks linking ISO 9001, 14001 & 45001.', standards: ['ISO 9001', '14001', '45001'] }
                    ];

                    // If user searched OR clicked a specific category filter, show detailed items matching criteria
                    if (industrySearchQuery || industrySectorFilter !== 'all') {
                      const filtered = detailedSectors.filter(sector => {
                        const matchesCategory = industrySectorFilter === 'all' || sector.category === industrySectorFilter;
                        const matchesSearch = !industrySearchQuery || 
                          sector.name.toLowerCase().includes(industrySearchQuery.toLowerCase()) || 
                          sector.desc.toLowerCase().includes(industrySearchQuery.toLowerCase()) ||
                          sector.standards.some(s => s.toLowerCase().includes(industrySearchQuery.toLowerCase()));
                        return matchesCategory && matchesSearch;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="bg-white border border-border p-10 text-center rounded-2xl max-w-lg mx-auto space-y-4 shadow-sm">
                            <HelpCircle className="mx-auto text-outline" size={32} />
                            <div className="space-y-1">
                              <h4 className="font-serif text-base text-primary font-bold">No specific sectors matched "{industrySearchQuery}"</h4>
                              <p className="font-sans text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                                We design custom compliance frameworks across all specialized industrial markets. Contact our technical team directly.
                              </p>
                            </div>
                            <button 
                              onClick={() => handleOpenBooking('compliance', `Inquiry: Sector Assessment for ${industrySearchQuery}`)}
                              className="btn-primary text-xs py-2.5 px-6 uppercase tracking-wider inline-block cursor-pointer"
                            >
                              Request Custom Sector Assessment
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                          {filtered.map((sector) => (
                            <div 
                              key={sector.id} 
                              className="bg-white border border-border rounded-xl p-6 hover:border-[#B68A35]/50 hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-serif text-base font-bold text-primary group-hover:text-[#B68A35] transition-colors">
                                    {sector.name}
                                  </span>
                                  <span className="font-mono text-[10px] text-[#B68A35] bg-[#B68A35]/10 px-2 py-0.5 rounded font-bold uppercase">
                                    {sector.category}
                                  </span>
                                </div>
                                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                                  {sector.desc}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                  {sector.standards.map((st, i) => (
                                    <span key={i} className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">
                                      {st}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-5 pt-3 border-t border-border/50 flex justify-end">
                                <button
                                  onClick={() => handleOpenBooking('compliance', `Inquiry: ${sector.name}`)}
                                  className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Inquire Solutions</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Default "All Sectors" View: Clean 4-Pillar Cluster Grid (Executive & Clean)
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {pillarClusters.map((pillar) => {
                          const IconComp = pillar.icon;
                          return (
                            <div 
                              key={pillar.id}
                              className="bg-white border border-border rounded-2xl p-8 hover:border-[#B68A35]/50 hover:shadow-md transition-all flex flex-col justify-between group space-y-6"
                            >
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-[#B68A35]">
                                    <IconComp size={22} />
                                  </div>
                                  <span className="bg-[#B68A35]/10 text-[#7a5a1f] border border-[#B68A35]/30 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                    {pillar.badge}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors">
                                    {pillar.title}
                                  </h3>
                                  <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed mt-2">
                                    {pillar.desc}
                                  </p>
                                </div>

                                <div className="space-y-2 pt-2">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-bold block">Key Standards &amp; Focus Areas</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {pillar.highlights.map((item, idx) => (
                                      <span key={idx} className="text-[11px] bg-mist text-primary border border-border px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1">
                                        <Check size={12} className="text-[#B68A35]" />
                                        <span>{item}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-border flex items-center justify-between">
                                <button
                                  onClick={() => setIndustrySectorFilter(pillar.id === 'food-agri' ? 'food' : pillar.id === 'ind-mfg' ? 'industrial' : pillar.id === 'log-serv' ? 'services' : 'enterprise')}
                                  className="text-xs font-sans text-on-surface-variant hover:text-primary font-bold transition-colors cursor-pointer"
                                >
                                  View specific sectors →
                                </button>
                                <button
                                  onClick={() => handleOpenBooking('compliance', pillar.action)}
                                  className="bg-primary/5 hover:bg-primary text-primary hover:text-white border border-primary/20 text-xs font-sans font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <span>Inquire</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </ScrollReveal>

                {/* Sector banner quote */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-white border border-border p-6 rounded-xl flex items-center gap-4 max-w-3xl mx-auto shadow-xs">
                    <Shield className="text-[#023625] shrink-0" size={24} />
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed italic">
                      "Whatever the sector, the constants are the same: capable people, sound systems, and standards applied with practical judgement."
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* Interactive Our Approach Workflow (Page 7 transition) */}
            <section className="py-16 md:py-24 bg-white border-b border-border">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16 space-y-16">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Structured Method</span>
                    <h2 className="font-serif text-3xl md:text-[44px] text-primary font-bold">Our interactive approach</h2>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                      A partnership-driven method that turns organisational goals into measurable and compliant outcomes. Click on any phase to see what we deliver.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                {/* 5 steps of approach (Interactive Stepper layout) */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { num: '01', title: 'Discover', short: 'Organisation mapping' },
                      { num: '02', title: 'Assess', short: 'Protocol audit' },
                      { num: '03', title: 'Develop', short: 'Bespoke solutions' },
                      { num: '04', title: 'Deliver', short: 'Class & System setup' },
                      { num: '05', title: 'Improve', short: 'Ongoing review' },
                    ].map((step) => {
                      const isSelected = activeFocusStep === step.num;
                      return (
                        <button
                          key={step.num}
                          onClick={() => setActiveFocusStep(step.num)}
                          className={`text-left p-4 border rounded-xl transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                            isSelected 
                              ? 'bg-primary text-white border-primary shadow-md scale-[1.02]'
                              : 'bg-mist border-border hover:bg-surface text-primary'
                          }`}
                        >
                          <span className={`font-serif text-xl font-extrabold block border-b pb-2 ${
                            isSelected ? 'text-[#B68A35] border-white/20' : 'text-[#B68A35] border-border'
                          }`}>
                            {step.num}
                          </span>
                          <div>
                            <h4 className="font-serif text-xs md:text-sm font-bold block">{step.title}</h4>
                            <span className={`font-sans text-[10px] block opacity-80 ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
                              {step.short}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollReveal>

                {/* Selected Step Expanded Card details */}
                <div className="bg-[#023625] text-white p-6 md:p-8 rounded-2xl relative overflow-hidden transition-all duration-300">
                  <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full pointer-events-none -mr-16 -mt-16"></div>
                  
                  {(() => {
                    const detailsMap: Record<string, { title: string; motto: string; core: string; activity: string[]; deliverable: string }> = {
                      '01': {
                        title: 'Phase 01: Discover',
                        motto: 'Understanding your unique business environment and strategic targets.',
                        core: 'We map out your current scale, target GFSI or ISO standards, regulatory pain points, and specific department capabilities.',
                        activity: [
                          'Host initial technical workshops with key department leads.',
                          'Map legislative requirements and global trade goals.',
                          'Define custom key performance indicators (KPIs).'
                        ],
                        deliverable: 'Discovery Report & Standards Roadmap Document'
                      },
                      '02': {
                        title: 'Phase 02: Assess',
                        motto: 'Rigorous gap analysis to uncover compliance vulnerabilities.',
                        core: 'We perform on-site walkthroughs or documentation audits to test if standard operating procedures (SOPs) are functional in production.',
                        activity: [
                          'Review current record-keeping and data integrity systems.',
                          'Perform mock audit drills mimicking third-party inspectors.',
                          'Assess physical production facilities or safety boundaries.'
                        ],
                        deliverable: 'Rigor Gap Assessment Matrix & Remediation Report'
                      },
                      '03': {
                        title: 'Phase 03: Develop',
                        motto: 'Tailoring blueprints that perfectly fit your organization.',
                        core: 'We structure custom curricula, build and draft robust standard operating procedures, and set up classroom scheduling overrides.',
                        activity: [
                          'Author streamlined documentation, avoiding administrative bloat.',
                          'Design modular in-house training plans aligned to standards.',
                          'Define technical roles, responsibilities, and clear CAPA workflows.'
                        ],
                        deliverable: 'Custom Management System Draft & Curricula Blueprint'
                      },
                      '04': {
                        title: 'Phase 04: Deliver',
                        motto: 'Enabling workforce competence and starting operations.',
                        core: 'Facilitators run hands-on, instructor-led lessons and implement systems in-situ. We ensure teams absorb the theory and execute it.',
                        activity: [
                          'Deliver accredited classroom modules (Food Safety, Quality, Environmental, OHS).',
                          'Initiate active standard operating procedures in real production runs.',
                          'Train internal audit teams on ISO 19011 methods.'
                        ],
                        deliverable: 'Accredited Certification preparation & Active Systems Hand-off'
                      },
                      '05': {
                        title: 'Phase 05: Improve',
                        motto: 'Safeguarding compliance through continuous feedback loops.',
                        core: 'We support continual improvement, system reviews, and help clients adjust protocols as international standards update.',
                        activity: [
                          'Schedule periodic audit overrides and safety reviews.',
                          'Deliver advanced refresher workshops.',
                          'Provide instant access to calendar overrides via YITZAK portal.'
                        ],
                        deliverable: 'Partnership SLA & Continuous Compliance Oversight'
                      }
                    };

                    const selected = detailsMap[activeFocusStep] || detailsMap['01'];
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
                        {/* Summary */}
                        <div className="md:col-span-5 space-y-4">
                          <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold block">Active Method Details</span>
                          <h3 className="font-serif text-2xl font-bold leading-tight">{selected.title}</h3>
                          <p className="font-serif text-sm text-[#B68A35] italic leading-relaxed">{selected.motto}</p>
                          <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">{selected.core}</p>
                        </div>
                        
                        {/* Tasks & Deliverables */}
                        <div className="md:col-span-7 space-y-6 md:pl-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0">
                          <div className="space-y-3">
                            <span className="text-white/60 font-sans text-[10px] uppercase tracking-widest block font-bold">Key Activities In This Phase:</span>
                            <ul className="space-y-2">
                              {selected.activity.map((item, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-xs font-sans text-white/90">
                                  <span className="text-[#B68A35] mt-1 flex-shrink-0">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                            <span className="text-white/60 font-sans text-[9px] uppercase tracking-widest block">Phase Key Outcome:</span>
                            <span className="font-sans text-xs font-bold text-white block">{selected.deliverable}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom step alliance note */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-[#023625]/5 border border-primary/10 p-8 rounded-2xl relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-primary/10 pb-6 md:pb-0 md:pr-8 space-y-1">
                        <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold block">Core Alliance</span>
                        <h3 className="font-serif text-xl md:text-2xl font-bold text-primary">One partner. Local expertise, plus a global portfolio.</h3>
                      </div>
                      <div className="md:col-span-7 md:pl-8">
                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Yitzak offers its own professional programmes while giving clients access to a respected global portfolio through FoodChain ID.
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* Why Organisations Choose Us (Page 8 transition) */}
            <section className="py-16 md:py-24 px-4 md:px-16 bg-mist border-b border-border">
              <div className="max-w-[1280px] mx-auto space-y-16">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">The Yitzak Difference</span>
                    <h2 className="font-serif text-3xl md:text-[44px] text-primary font-bold">Why organisations choose us</h2>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                {/* Choose Us Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-b border-border pb-12 items-stretch">
                  {[
                    { title: 'Practical Industry Experience', text: 'Solutions built around real operational environments, not theory.' },
                    { title: 'World-Class Training', text: 'Programmes aligned with recognised international standards and delivered to a global benchmark.' },
                    { title: 'Tailored Solutions', text: 'Every programme is adapted to your organisation’s objectives.' },
                    { title: 'Professional Delivery', text: 'Experienced facilitators delivering practical, engaging learning.' },
                    { title: 'Long-Term Partnerships', text: 'Supporting organisations well beyond individual training events.' },
                  ].map((item, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={0.1 + idx * 0.05} className="h-full">
                      <div className="space-y-3 bg-white border border-border p-5 rounded-xl h-full flex flex-col justify-start shadow-xs hover:border-[#B68A35]/40 transition-all">
                        <h4 className="font-serif text-md font-bold text-primary border-l-2 border-[#B68A35] pl-3 leading-snug">{item.title}</h4>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed pl-3">{item.text}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Guides / Values */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="space-y-8">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold block text-center">What Guides Us</span>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch">
                      {[
                        { title: 'Integrity', text: 'Honest, practical advice that serves our clients’ best interests.' },
                        { title: 'Collaboration', text: 'Strong partnerships create stronger organisations.' },
                        { title: 'Excellence', text: 'High professional standards in everything we deliver.' },
                        { title: 'Continuous Improvement', text: 'Learning never stops, and neither do we.' },
                      ].map((val, idx) => (
                        <div key={idx} className="bg-white p-6 border border-border space-y-2 rounded-xl shadow-xs h-full flex flex-col justify-start">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#B68A35]"></div>
                            <h4 className="font-sans text-sm font-bold text-primary">{val.title}</h4>
                          </div>
                          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">{val.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                {/* Bottom block commitment */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-[#023625] text-[#F9F9F9] p-8 rounded-2xl relative overflow-hidden text-center max-w-4xl mx-auto">
                    <div className="space-y-4 z-10 relative">
                      <span className="text-[#B68A35] font-sans text-[11px] uppercase tracking-widest font-bold block">Our Commitment</span>
                      <blockquote className="font-serif text-lg md:text-xl leading-relaxed italic max-w-2xl mx-auto">
                        "Every organisation is different, so we don't believe in one-size-fits-all solutions. We work closely with every client to understand their objectives, develop practical solutions, and deliver measurable outcomes. Our success is measured by the success of the organisations we support."
                      </blockquote>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* Interactive Schedule Portal (Google Sign In & Schedule Overrides) */}
            <section id="portal" className="py-16 md:py-24 px-4 md:px-16 bg-white border-b border-border scroll-mt-24">
              <div className="max-w-4xl mx-auto space-y-8">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center">
                    <span className="font-sans text-[11px] font-bold text-antique-gold uppercase tracking-widest">Interactive Client Portal</span>
                    <h2 className="font-serif text-2xl md:text-3xl text-primary font-bold mt-2">Schedule Management</h2>
                    <p className="font-sans text-xs md:text-sm text-ash max-w-lg mx-auto mt-2 leading-relaxed">
                      Access your real-time secure dashboard to review corporate schedules, request new consultations, and manage overrides.
                    </p>
                  </div>
                </ScrollReveal>

                {isAuthLoading ? (
                  <div className="bg-mist border border-border p-12 text-center flex flex-col items-center justify-center space-y-4 rounded-xl">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <p className="font-sans text-xs text-ash">Securing network authorization...</p>
                  </div>
                ) : currentUser ? (
                  <Dashboard
                    currentUser={currentUser}
                    onLogout={() => {
                      setCurrentUser(null);
                      triggerNotification('Logged out successfully.');
                    }}
                    onOpenBooking={() => setIsBookingOpen(true)}
                    refreshTrigger={refreshTrigger}
                  />
                ) : (
                  <div className="bg-mist border border-border p-6 md:p-12 text-center space-y-6 rounded-2xl shadow-sm">
                    <Lock className="mx-auto text-primary" size={32} />
                    <div className="space-y-2">
                      <h4 className="font-serif text-lg text-primary font-bold">Authorized Scheduling Portal</h4>
                      <p className="font-sans text-xs text-ash max-w-md mx-auto leading-relaxed">
                        Yitzak partners with Google Auth. Authentication blocks temporary slots globally in real-time, dispatches automated transaction receipts via Gmail, and synchronizes calendar files.
                      </p>
                    </div>

                    {/* Google Auth Sandbox warning alert */}
                    <div className="max-w-md mx-auto text-left text-xs text-[#856404] bg-[#fff3cd] border border-[#ffeeba] p-4 rounded space-y-2">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-[#856404]" />
                        <span>Facing a "Google verification" or 403 error?</span>
                      </p>
                      <p className="leading-relaxed">
                        This sandbox testing environment operates within the Google Cloud Sandbox limit. If you see Google's block screen, it is because your Google account has not been added as an authorized "Test User" in the developer's GCP console.
                      </p>
                      <p className="font-bold text-[#533f03]">
                        Bypass Option: Click the guest bypass option below to access the Portal and Bookings immediately.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto pt-2">
                      <AnimatePresence mode="wait">
                        {!portalShowGuestForm ? (
                          <motion.div
                            key="google-signin-view"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="max-w-xs mx-auto space-y-4"
                          >
                            <button
                              id="portal_google_login_btn"
                              onClick={handleGoogleLoginOnly}
                              className="w-full flex justify-center items-center gap-3 py-3 border border-border bg-white text-charcoal hover:bg-surface transition-all active:scale-95 shadow-sm font-sans font-bold text-xs uppercase tracking-wider rounded cursor-pointer"
                            >
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                              </svg>
                              <span>Sign in with Google</span>
                            </button>

                            <button
                              id="portal_guest_bypass_btn"
                              type="button"
                              onClick={() => setPortalShowGuestForm(true)}
                              className="w-full text-center py-2 text-xs text-secondary hover:underline font-semibold cursor-pointer block"
                            >
                              Or: Whitelist Email Verification & Guest Entry
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="guest-form-view"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="text-left border border-border p-6 bg-white space-y-4 rounded-xl shadow-xs"
                          >
                            <div className="flex items-center justify-between border-b border-border pb-2.5">
                              <h6 className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Whitelisted Guest Entry
                              </h6>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                Guest Access
                              </span>
                            </div>

                            <p className="text-[11px] text-ash leading-relaxed">
                              Enter your pre-registered guest email address to access the portal.
                            </p>

                            <div>
                              <label htmlFor="portal-guest-name" className="text-[10px] uppercase font-mono tracking-wider text-ash block mb-1 font-semibold">Full Name</label>
                              <input 
                                id="portal-guest-name"
                                type="text" 
                                required
                                value={portalGuestName}
                                onChange={(e) => setPortalGuestName(e.target.value)}
                                placeholder="e.g. Christina Vonn"
                                className="w-full p-2.5 border border-border bg-white text-xs text-charcoal outline-none focus:border-primary rounded-lg font-sans"
                              />
                            </div>
                            <div>
                              <label htmlFor="portal-guest-email" className="text-[10px] uppercase font-mono tracking-wider text-ash block mb-1 font-semibold">Pre-Registered Guest Email</label>
                              <input 
                                id="portal-guest-email"
                                type="email" 
                                required
                                value={portalGuestEmail}
                                onChange={(e) => setPortalGuestEmail(e.target.value)}
                                placeholder="e.g. christinavonnidigital@gmail.com"
                                className="w-full p-2.5 border border-border bg-white text-xs text-charcoal outline-none focus:border-primary rounded-lg font-sans"
                              />
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-ash pt-1">
                              <span>Need to pre-register an email?</span>
                              <button
                                type="button"
                                onClick={() => setShowWhitelistModal(true)}
                                className="text-secondary hover:underline font-bold cursor-pointer"
                              >
                                Open Whitelist Manager →
                              </button>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                id="portal-guest-enter-btn"
                                type="button"
                                disabled={verifyingWhitelist}
                                onClick={handleVerifyAndEnterPortal}
                                className="flex-1 bg-[#023625] text-white py-2.5 text-xs uppercase font-bold tracking-widest hover:bg-primary active:scale-95 transition-all cursor-pointer rounded-lg text-center flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {verifyingWhitelist ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Verifying Email...
                                  </>
                                ) : (
                                  'Verify & Enter Portal'
                                )}
                              </button>
                              <button
                                id="portal-guest-cancel-btn"
                                type="button"
                                onClick={() => {
                                  setPortalShowGuestForm(false);
                                }}
                                className="px-4 border border-border text-ash hover:text-primary text-xs cursor-pointer rounded-lg hover:bg-mist transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Modal overlay for Whitelist Manager */}
                      {showWhitelistModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <WhitelistManager onClose={() => setShowWhitelistModal(false)} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* CTA Banner Section */}
            <section className="bg-forest-green py-20 px-4 md:px-16 text-center text-white overflow-hidden">
              <ScrollReveal direction="up" delay={0.05}>
                <div className="max-w-[1280px] mx-auto space-y-6">
                  <h2 className="font-headline-lg text-[32px] md:text-[48px] leading-[40px] md:leading-[56px] font-bold">Ready to elevate your team's competence?</h2>
                  <p className="font-body-lg text-[18px] text-white/85 max-w-2xl mx-auto">Discover our comprehensive range of professional training programmes designed for modern compliance needs.</p>
                  <button 
                    onClick={() => navigateTo('training')}
                    className="btn-primary cursor-pointer inline-block"
                  >
                    Explore Training Programmes
                  </button>
                </div>
              </ScrollReveal>
            </section>

            {/* Newsletter Subscription Section */}
            <section id="newsletter" className="py-16 md:py-20 px-4 md:px-16 bg-mist border-t border-b border-border scroll-mt-24">
              <div className="max-w-[1280px] mx-auto">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 bg-[#B68A35]/10 text-primary border border-[#B68A35]/20 px-3.5 py-1 rounded-full">
                      <Mail size={14} className="text-[#B68A35]" />
                      <span className="font-sans text-[10px] uppercase tracking-widest font-bold">Knowledge Newsletter</span>
                    </div>

                    <div className="space-y-3">
                      <h2 className="font-serif text-3xl md:text-[40px] text-primary font-bold tracking-tight">The YITZAK Digest</h2>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed">
                        Stay ahead of evolving compliance landscapes. Get monthly technical briefings, ISO & GFSI standard updates, and strategic risk-mitigation insights curated by our principal auditors.
                      </p>
                    </div>

                    <div className="max-w-md mx-auto pt-4">
                      {newsletterSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-[#023625] text-white p-6 md:p-8 rounded-2xl border border-white/10 text-center space-y-5 shadow-lg"
                        >
                          <div className="w-12 h-12 bg-[#B68A35]/20 rounded-full flex items-center justify-center text-[#B68A35] mx-auto">
                            <CheckCircle size={24} />
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-serif text-xl font-bold text-white">Subscription Confirmed!</h3>
                            <p className="text-xs text-[#DFC181] font-mono">{subscribedEmail}</p>
                          </div>

                          {emailDispatchStatus === 'sent' ? (
                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-medium">
                              <CheckCircle size={14} />
                              <span>Confirmation & Briefing Dispatched to Inbox</span>
                            </div>
                          ) : (
                            <div className="bg-white/10 border border-white/20 p-3.5 rounded-xl text-xs space-y-2 text-left">
                              <div className="flex items-center justify-between text-white/90">
                                <span className="font-semibold text-[11px] uppercase tracking-wider text-[#DFC181]">Email Delivery Status</span>
                                <span className="text-[10px] text-white/70">Ready for dispatch</span>
                              </div>
                              <p className="text-white/80 text-[11px] leading-relaxed">
                                Subscription is active! To send an automated welcome briefing directly to <strong>{subscribedEmail}</strong> via Google Account, click below:
                              </p>
                              <button
                                type="button"
                                onClick={() => handleManualDispatchDigest(subscribedEmail)}
                                disabled={resendingDigest}
                                className="w-full bg-[#B68A35] hover:bg-[#a0772d] text-primary py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {resendingDigest ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Sending Email...</span>
                                  </>
                                ) : (
                                  <>
                                    <Mail size={14} />
                                    <span>Send Confirmation Email Now</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          <p className="font-sans text-xs text-white/90 leading-relaxed max-w-sm mx-auto">
                            Thank you for joining our professional community. You will receive monthly technical briefings, ISO &amp; GFSI updates, and compliance insights.
                          </p>

                          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                            <button
                              type="button"
                              onClick={() => setShowBriefingPreview(true)}
                              className="bg-white text-primary hover:bg-ash/20 py-2.5 px-5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span>Read Latest Briefing On-Screen</span>
                            </button>

                            <button
                              id="newsletter-resubscribe-btn"
                              onClick={() => {
                                setNewsletterSuccess(false);
                                setEmailDispatchStatus('pending');
                              }}
                              className="bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Subscribe Another Email
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-grow">
                              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                                <Mail size={16} />
                              </div>
                              <input
                                id="newsletter-email"
                                type="email"
                                placeholder="Enter your corporate email"
                                required
                                value={newsletterEmail}
                                onChange={(e) => {
                                  setNewsletterEmail(e.target.value);
                                  if (newsletterError) setNewsletterError(null);
                                }}
                                className="w-full bg-white border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#B68A35] transition-colors rounded-xl text-primary font-sans h-[48px]"
                              />
                            </div>
                            <button
                              id="newsletter-submit"
                              type="submit"
                              disabled={newsletterSubmitting}
                              className="bg-[#023625] hover:bg-primary text-white font-sans font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 h-[48px] sm:w-auto w-full flex-shrink-0 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                              {newsletterSubmitting ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  <span>Subscribing...</span>
                                </>
                              ) : (
                                <>
                                  <span>Subscribe</span>
                                  <ChevronRight size={14} />
                                </>
                              )}
                            </button>
                          </div>

                          {newsletterError && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-600 flex items-center justify-center gap-1.5 text-xs font-sans font-medium"
                            >
                              <AlertCircle size={14} />
                              <span>{newsletterError}</span>
                            </motion.div>
                          )}

                          <p className="font-sans text-[10px] text-outline text-center leading-relaxed">
                            Zero spam. We respect your confidentiality. Unsubscribe at any time. By subscribing, you agree to receive communications from YITZAK.
                          </p>
                        </form>
                      )}
                    </div>
                  </div>
                </ScrollReveal>

                {/* On-screen Technical Briefing Modal Preview */}
                {showBriefingPreview && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative text-left">
                      <button 
                        onClick={() => setShowBriefingPreview(false)}
                        className="absolute top-4 right-4 p-2 text-ash hover:text-primary rounded-full bg-mist hover:bg-border transition-colors cursor-pointer"
                      >
                        <X size={18} />
                      </button>

                      <div className="border-b border-border pb-4">
                        <div className="inline-flex items-center gap-1.5 bg-[#B68A35]/10 text-primary border border-[#B68A35]/20 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold mb-2">
                          <Mail className="w-3 h-3 text-[#B68A35]" />
                          Knowledge Newsletter Briefing Issue #01
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-primary">The YITZAK Digest</h3>
                        <p className="text-xs text-ash mt-0.5">Executive Technical Briefing for Food Safety & Corporate Compliance Officers</p>
                      </div>

                      <div className="space-y-4 text-xs text-charcoal leading-relaxed">
                        <div className="p-4 bg-mist rounded-xl border border-border space-y-2">
                          <h4 className="font-serif font-bold text-sm text-primary">1. GFSI Benchmarking Requirements v2024 & HACCP Updates</h4>
                          <p className="text-ash leading-relaxed">
                            The Global Food Safety Initiative (GFSI) has mandated tightened benchmarking criteria for auditor competence, allergen management protocols, and environmental monitoring programs (EMP). Operations preparing for unannounced audits under FSSC 22000 v6 and BRCGS Issue 9 must re-verify risk assessments.
                          </p>
                        </div>

                        <div className="p-4 bg-mist rounded-xl border border-border space-y-2">
                          <h4 className="font-serif font-bold text-sm text-primary">2. Regulatory Sanitation & Allergen Control Cross-Contamination</h4>
                          <p className="text-ash leading-relaxed">
                            Recent industry enforcement actions highlight strict validated cleaning verification for shared production lines. YITZAK recommends implementing rapid ATP testing alongside swab validation protocols for top 9 priority allergens.
                          </p>
                        </div>

                        <div className="p-4 bg-mist rounded-xl border border-border space-y-2">
                          <h4 className="font-serif font-bold text-sm text-primary">3. Supplier Audit Governance & Cold Chain Integrity</h4>
                          <p className="text-ash leading-relaxed">
                            Digital traceability platforms and real-time temperature loggers are now integrated into GFSI-compliant vendor qualification workflows to mitigate raw material contamination risks prior to processing.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-[11px] text-ash">
                          Subscriber: <strong className="text-primary">{subscribedEmail || 'christinagumpo@gmail.com'}</strong>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleManualDispatchDigest(subscribedEmail)}
                            disabled={resendingDigest}
                            className="bg-[#023625] hover:bg-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {resendingDigest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Email Briefing To Inbox
                          </button>
                          <button
                            onClick={() => setShowBriefingPreview(false)}
                            className="border border-border hover:bg-mist text-ash text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  <h1 className="font-serif text-2xl font-bold text-[#023625]">YITZAK INSTITUTIONAL ADVISORY</h1>
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
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-[#1f4d3a] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center gap-2"
                    title="Print Consulting & Advisory Capabilities Statement"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: 'Gap assessments & readiness reviews', pillar: 'compliance', desc: 'Pre-audit diagnostic reviews against FSSC 22000, BRCGS, ISO 9001, and HACCP.' },
                      { title: 'Management system development', pillar: 'advisory', desc: 'Custom policy, SOP, and quality manual formulation built around your team.' },
                      { title: 'Documentation & records support', pillar: 'training', desc: 'Streamlined verification logs, traceability registers, and cloud compliance archives.' },
                      { title: 'Internal audits & process reviews', pillar: 'compliance', desc: 'Independent expert auditing to satisfy annual accredited scheme mandates.' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border border-border/80 shadow-2xs hover:shadow-sm hover:border-primary/40 transition-all space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#B68A35] shrink-0"></div>
                            <h4 className="font-sans text-sm font-bold text-primary leading-snug">{item.title}</h4>
                          </div>
                          <p className="font-sans text-xs text-on-surface-variant leading-relaxed pl-4">
                            {item.desc}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-border/40 pl-4 no-print">
                          <button
                            onClick={() => handleOpenBooking(item.pillar, `Inquiry: ${item.title}`)}
                            className="text-[11px] font-bold uppercase tracking-wider text-[#7d5800] hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Book Review</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* Strategic Pillars Breakdown Section */}
            <section className="py-16 px-4 md:px-16 max-w-[1280px] mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Institutional Advisory Pillars</span>
                <h2 className="font-serif text-2xl md:text-4xl text-primary font-bold">Three Integrated Areas of Expertise</h2>
                <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                  Tailored consulting solutions structured to elevate governance, verify compliance, and train internal champions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PILLARS.map((p) => (
                  <div key={p.id} className="bg-white border border-border p-8 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        <Shield size={22} className="text-primary" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-primary">{p.title}</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">{p.description}</p>
                      
                      <div className="pt-2 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-[#7d5800] font-bold block">Key Deliverables:</span>
                        <ul className="space-y-1.5 pl-1">
                          {p.details.map((d, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2 text-xs text-ash">
                              <CheckCircle size={12} className="text-green-600 mt-0.5 shrink-0" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-border no-print">
                      <button
                        onClick={() => handleOpenBooking(p.id, `Consulting Inquiry for ${p.title}`)}
                        className="w-full bg-primary hover:bg-[#1f4d3a] text-white font-sans font-bold text-xs uppercase tracking-widest py-3 px-4 rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Schedule {p.title}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom Callout Banner */}
            <section className="py-16 bg-[#023625] text-white px-4 md:px-16">
              <div className="max-w-[1280px] mx-auto text-center space-y-6">
                <h2 className="font-serif text-2xl md:text-4xl font-bold">Ready to turn learning into working systems?</h2>
                <p className="font-sans text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
                  Connect directly with Yitzak's principal advisors to schedule a gap assessment, system analysis, or custom corporate workshop.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-4 no-print">
                  <button
                    onClick={() => handleOpenBooking('compliance', 'Inquiry: Gap Assessment & Systems Design')}
                    className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded cursor-pointer transition-all active:scale-95 shadow-md"
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
                    className="border border-white/30 hover:border-white text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded cursor-pointer transition-all active:scale-95"
                  >
                    Contact Advisory Team
                  </button>
                </div>
              </div>
            </section>

            {/* Embedded Contact Us Section at Bottom of Home Page */}
            <section id="home-contact-section" className="py-16 bg-[#F9F9F9] text-[#2D3142] px-4 md:px-16 border-t border-border">
              <div className="max-w-[1280px] mx-auto">
                <ContactUs />
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
            <section className="relative pt-12 md:pt-24 pb-16 px-4 md:px-16 max-w-[1280px] mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 z-10">
                  <h1 className="font-serif text-[40px] md:text-[64px] leading-[48px] md:leading-[72px] tracking-tight text-primary mb-6 font-bold">
                    Training that builds real competence
                  </h1>
                  <p className="font-sans text-sm md:text-base text-on-surface-variant mb-4 leading-relaxed opacity-90">
                    Practical, instructor-led training across the management-system disciplines. Delivered by industry veterans to ensure rigorous capability development. In proud partnership with FoodChain ID Academy.
                  </p>
                  <p className="font-sans text-xs md:text-sm text-outline mb-8 border-l-2 border-antique-gold pl-4">
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
                <div className="lg:col-span-6 mt-12 lg:mt-0 relative">
                  <div className="rounded-2xl overflow-hidden shadow-ambient relative z-10 aspect-[4/3] border border-[#E5E5E5]">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh8qjKo1mwyVEx2R4hcz_37lRzkxGHkT6V-oq1p6-aNLPzSIK1PeKocPwmsavBw-jzyWVB7YGBWC7mQGezHM9vJgXqXzW6XP-LZ0F3KVj7xjUPf9A30emofQLCDZzMztfEV_elrnRp7EgBGuSsJrD3EK0M9h-zOPiHOpehrbBdtNYBmiSgUTd0LjaWVrc-kU93-69KQ9lqCIkb1UTr7OvswZEbEAmW5BkzB5_ThEx55RADoHMnem4L"
                      alt="A professional corporate training room with executives engaged in a focused workshop"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Decorative Element */}
                  <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#F9F9F9] rounded-full z-0 opacity-50"></div>
                </div>
              </div>
            </section>

            {/* The Three Streams Section */}
            <section id="streams" className="bg-[#F9F9F9] py-16 md:py-20 px-4 md:px-16 border-t border-[#E5E5E5] scroll-mt-24">
              <div className="max-w-[1280px] mx-auto">
                <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-[40px] text-primary font-bold mb-4">The Three Streams</h2>
                  <div className="w-24 h-1 bg-[#B68A35] mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stream 1 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center mb-6">
                        <GraduationCap className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold mb-3">YITZAK Curricula</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed mb-6">
                        Proprietary training modules focused on specialized compliance, strategy implementation, and advanced internal auditing techniques.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSidebarSection('ims');
                        const el = document.getElementById('portfolio');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-secondary transition-colors flex items-center gap-2 self-start cursor-pointer"
                    >
                      <span>Explore Modules</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  {/* Stream 2 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center mb-6">
                        <Award className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold mb-3">FoodChain ID Academy</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed mb-6">
                        Internationally recognized certification courses delivered through our exclusive partnership, ensuring global standard compliance.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => navigateTo('certifications')}
                        className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-secondary transition-colors flex items-center gap-2 self-start cursor-pointer"
                      >
                        <span>View Accredited Schemes</span>
                        <ArrowRight size={14} />
                      </button>
                      <a
                        href="https://www.foodchainid.com/academy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors flex items-center gap-1 cursor-pointer self-start"
                      >
                        <span>Explore Global Academy</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>

                  {/* Stream 3 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center mb-6">
                        <Building2 className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold mb-3">In-House Solutions</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed mb-6">
                        Bespoke, on-site training programs tailored to your organization's specific operational realities and cultural context.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('training')}
                      className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-secondary transition-colors flex items-center gap-2 self-start cursor-pointer"
                    >
                      <span>Request Custom Plan</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Accredited Certification Schemes & FoodChain ID Section */}
            <section id="certifications" className="py-16 md:py-24 bg-mist border-y border-border scroll-mt-24">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16 space-y-12">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Accredited Routes &amp; Partnerships</span>
                    <h2 className="font-serif text-3xl md:text-[44px] text-primary font-bold">Accredited Certification Made Simple</h2>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
                      Through our partnership with FoodChain ID, we offer internationally recognised certification schemes, supporting clients from scoping and audit readiness through to a valid certificate.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Scheme 1 */}
                  <ScrollReveal direction="up" delay={0.1}>
                    <div className="bg-white border border-border p-8 rounded-xl flex flex-col justify-between shadow-sm h-full hover:border-[#B68A35]/30 hover:shadow-md transition-all group duration-200">
                      <div className="space-y-6">
                        {/* Status Indicators Bar */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Accredited</span>
                          </span>
                          <span className="bg-[#B68A35]/10 text-[#7a5a1f] border border-[#B68A35]/30 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Award size={12} className="text-[#B68A35]" />
                            <span>Industry Standard</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-4 pt-1">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg shrink-0">
                            P
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors">Product &amp; Label Certification</h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">Products &amp; Claims</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Non-GMO</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Organic</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Identity Preserved</span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Certification for product claims that hold up to market and regulatory scrutiny, including organic and Non-GMO. We help you choose the right scheme, prepare your evidence, and move through assessment with confidence.
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap justify-between items-center gap-2">
                        <a
                          href="https://www.foodchainid.com/product-and-label-certification/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: Product & Label Certification')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Readiness</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Scheme 2 */}
                  <ScrollReveal direction="up" delay={0.2}>
                    <div className="bg-white border border-border p-8 rounded-xl flex flex-col justify-between shadow-sm h-full hover:border-[#B68A35]/30 hover:shadow-md transition-all group duration-200">
                      <div className="space-y-6">
                        {/* Status Indicators Bar */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Accredited</span>
                          </span>
                          <span className="bg-sky-50 text-sky-800 border border-sky-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Globe size={12} className="text-sky-600" />
                            <span>GFSI Benchmarked</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-4 pt-1">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg shrink-0">
                            G
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors">GLOBALG.A.P.</h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">Farm Assurance</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Good Ag Practice</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Chain of Custody</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">GRASP</span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Good agricultural practice certification covering food safety, traceability, and responsible production. GFSI-benchmarked and recognised by retailers worldwide, it opens doors to markets that demand certified supply.
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap justify-between items-center gap-2">
                        <a
                          href="https://www.foodchainid.com/globalg-a-p/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: GLOBALG.A.P. Certification')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Readiness</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Scheme 3 */}
                  <ScrollReveal direction="up" delay={0.3}>
                    <div className="bg-white border border-border p-8 rounded-xl flex flex-col justify-between shadow-sm h-full hover:border-[#B68A35]/30 hover:shadow-md transition-all group duration-200">
                      <div className="space-y-6">
                        {/* Status Indicators Bar */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Accredited</span>
                          </span>
                          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Award size={12} className="text-indigo-600" />
                            <span>Global Standard</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-4 pt-1">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg shrink-0">
                            B
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors">BRCGS Certifications</h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">Food Safety &amp; Quality</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Food Safety Issue 9</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Packaging</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2 py-0.5 rounded font-medium">Storage &amp; Dist.</span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Globally recognised food-safety standards spanning manufacturing, packaging, storage, and distribution. We prepare your team and systems so the audit confirms what is already in place.
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap justify-between items-center gap-2">
                        <a
                          href="https://www.foodchainid.com/brcgs-certifications/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: BRCGS Certification')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Readiness</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* FoodChain ID Banner Quote */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-[#023625] text-white p-8 md:p-10 rounded-2xl relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                      <span className="text-[#B68A35] font-mono text-xs uppercase tracking-widest font-bold block">Exclusive Technical Partnership</span>
                      <h3 className="font-serif text-xl md:text-2xl font-bold">FoodChain ID &amp; Yitzak Consulting</h3>
                      <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
                        Yitzak operates in direct partnership with FoodChain ID to deliver accredited food safety certifications and official academy training across Southern Africa.
                      </p>
                    </div>
                    <a
                      href="https://www.foodchainid.com/academy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded transition-all cursor-pointer shrink-0 inline-flex items-center gap-2"
                    >
                      <span>Explore Global Academy</span>
                      <span>↗</span>
                    </a>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* Interactive Compliance & ROI Calculator Section */}
            <ComplianceCalculator onInquire={(notes) => handleOpenBooking('compliance', notes)} />

            {/* Training Portfolio Section */}
            <section id="portfolio" className="py-16 md:py-20 px-4 md:px-16 bg-white scroll-mt-24">
              <div className="max-w-[1280px] mx-auto">
                
                {/* Print Letterhead Header (Visible only during printing) */}
                <div className="hidden print:block mb-8 border-b-2 border-[#B68A35] pb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="font-serif text-2xl font-bold text-[#023625]">YITZAK INSTITUTIONAL ADVISORY</h1>
                      <p className="text-xs font-mono text-[#7d5800] uppercase font-bold">Official Training Portfolio &amp; Syllabus Record</p>
                      <p className="text-[10px] text-gray-500 mt-1">In direct technical partnership with FoodChain ID Academy</p>
                    </div>
                    <div className="text-right text-[10px] font-mono text-gray-500">
                      <p>Issued: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p>Document Ref: YITZ-TRN-2026-REC</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 border-b border-[#E5E5E5] pb-6">
                  <div>
                    <h2 className="font-serif text-3xl md:text-[40px] text-primary font-bold mb-2">Training Portfolio</h2>
                    <div className="w-24 h-1 bg-[#B68A35]"></div>
                  </div>
                  
                  {/* Portfolio Download & Print buttons */}
                  <div className="flex flex-wrap items-center gap-3 no-print">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373] font-mono w-full md:w-auto">
                      Export Syllabus:
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="bg-[#B68A35] hover:bg-[#a37a2e] text-white font-mono text-[11px] font-bold uppercase tracking-wider py-2.5 px-4 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
                      title="Print full training syllabus & portfolio for physical record-keeping"
                    >
                      <Printer size={14} />
                      <span>Print Record</span>
                    </button>
                    <button
                      onClick={() => exportPortfolioToPDF(portfolioCategories)}
                      className="bg-primary hover:bg-[#1f4d3a] text-white font-mono text-[11px] font-bold uppercase tracking-wider py-2.5 px-4 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
                      title="Download full portfolio syllabus as a high-quality PDF document"
                    >
                      <FileText size={14} />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => exportPortfolioToCSV(portfolioCategories)}
                      className="border border-[#E5E5E5] hover:bg-[#F9F9F9] text-[#2B2B2B] font-mono text-[11px] font-bold uppercase tracking-wider py-2.5 px-4 transition-all duration-200 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                      title="Download full portfolio courses list in Excel-compatible CSV spreadsheet format"
                    >
                      <Download size={14} className="text-[#B68A35]" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                  {/* Left Sidebar Menu */}
                  <div className="md:col-span-3">
                    <div className="flex flex-col space-y-1 border-l-2 border-[#E5E5E5] pl-0">
                      {portfolioCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveSidebarSection(cat.id)}
                          className={`text-left py-2.5 px-4 transition-all text-xs uppercase tracking-wider font-bold cursor-pointer border-l-2 -ml-[2px] ${
                            activeSidebarSection === cat.id
                              ? 'border-[#B68A35] text-primary bg-[#F9F9F9]'
                              : 'border-transparent text-on-surface-variant hover:text-primary hover:border-[#E5E5E5]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Courses Panel */}
                  <div className="md:col-span-9">
                    <AnimatePresence mode="wait">
                      {portfolioCategories.map((cat) => cat.id === activeSidebarSection && (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-4">
                            <h3 className="font-serif text-xl md:text-2xl text-primary font-bold">
                              {cat.title}
                            </h3>
                            <span className="text-secondary font-mono text-[11px] uppercase tracking-wider bg-secondary-fixed px-3 py-1 rounded font-bold">
                              {cat.badge}
                            </span>
                          </div>

                          {/* Courses List */}
                          <div className="space-y-4">
                            {cat.courses.map((course, idx) => (
                              <div
                                key={idx}
                                className="border border-[#E5E5E5] p-6 hover:shadow-ambient transition-all duration-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl"
                              >
                                <div>
                                  <h4 className="font-sans text-sm md:text-base font-bold text-primary mb-1">
                                    {course.title}
                                  </h4>
                                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed opacity-85">
                                    {course.description}
                                  </p>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                  {course.tags.map((tag, tagIdx) => (
                                    <span
                                      key={tagIdx}
                                      className="text-[10px] font-mono uppercase tracking-wider bg-forest-green/10 text-forest-green px-3 py-1 font-bold rounded"
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

            {/* Demonstrate Your Competence Section */}
            <section className="py-8 px-4 md:px-16 bg-white">
              <div className="max-w-[1280px] mx-auto">
                <div className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-forest-green/10 flex items-center justify-center shrink-0">
                    <Award className="text-forest-green" size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl text-primary font-bold mb-2">Demonstrate Your Competence</h3>
                    <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed opacity-90">
                      On successful completion, participants receive a formal YITZAK Certificate of Completion. For partnered modules, official accreditation certificates are issued directly by the governing bodies, serving as verifiable proof of your rigorous capability development.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Flexible Delivery Formats Section */}
            <section className="bg-primary text-white py-16 md:py-20 px-4 md:px-16">
              <div className="max-w-[1280px] mx-auto text-center">
                <h2 className="font-serif text-3xl md:text-[40px] font-bold mb-3">Flexible Delivery Formats</h2>
                <p className="font-sans text-xs md:text-sm text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                  Tailored to fit your organizational constraints and learning preferences.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {/* Format 1 */}
                  <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                      <Building2 className="text-antique-gold" size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold mb-3">On-Site &amp; In-House</h3>
                    <p className="font-sans text-xs text-white/70 leading-relaxed">
                      Delivered at your facility, minimizing travel disruption and maximizing contextual relevance.
                    </p>
                  </div>

                  {/* Format 2 */}
                  <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                      <Laptop className="text-antique-gold" size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold mb-3">Virtual Instructor-Led</h3>
                    <p className="font-sans text-xs text-white/70 leading-relaxed">
                      Live, interactive digital classrooms ensuring global accessibility without compromising rigor.
                    </p>
                  </div>

                  {/* Format 3 */}
                  <div className="border border-white/10 rounded-2xl p-8 bg-white/5 backdrop-blur-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                      <RefreshCw className="text-antique-gold" size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold mb-3">Blended Learning</h3>
                    <p className="font-sans text-xs text-white/70 leading-relaxed">
                      A strategic mix of self-paced digital modules and intensive live workshops.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigateTo('calendar')}
                    className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 focus:outline-none"
                  >
                    View Course Calendar
                  </button>
                  <button
                    onClick={() => handleOpenBooking('training')}
                    className="border border-white/30 hover:border-white text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 focus:outline-none"
                  >
                    Request In-House Training
                  </button>
                </div>
              </div>
            </section>

            {/* Frequently Asked Questions Accordion Section */}
            <FAQSection />
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
            <section className="relative pt-12 md:pt-20 pb-16 px-4 md:px-16 max-w-[1280px] mx-auto overflow-hidden">
              <div className="text-center max-w-4xl mx-auto space-y-6">
                <span className="bg-[#B68A35]/10 text-[#7a5a1f] border border-[#B68A35]/30 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest inline-flex items-center gap-1.5 shadow-xs">
                  <Award size={14} className="text-[#B68A35]" />
                  <span>Accredited Certification Schemes &amp; Global Partnerships</span>
                </span>
                <h1 className="font-serif text-[38px] md:text-[58px] leading-[46px] md:leading-[66px] tracking-tight text-primary font-bold">
                  Internationally Recognised Certification
                </h1>
                <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed max-w-3xl mx-auto">
                  In direct technical partnership with <strong className="text-primary font-bold">FoodChain ID</strong>, Yitzak Consulting guides food manufacturers, agricultural producers, and supply chain operators across Southern Africa from initial scoping and audit readiness through to valid, accredited certificates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 no-print">
                  <button
                    onClick={() => handleOpenBooking('compliance', 'Inquiry: Accredited Certification Readiness')}
                    className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-7 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <span>Inquire Audit Readiness</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-[#1f4d3a] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-7 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center justify-center gap-2"
                    title="Print certification schemes catalog for physical record-keeping"
                  >
                    <Printer size={14} className="text-[#DFC181]" />
                    <span>Print Certification Portfolio</span>
                  </button>
                  <a
                    href="https://www.foodchainid.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-primary text-primary hover:bg-primary hover:text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-7 rounded cursor-pointer transition-all active:scale-95 inline-flex items-center justify-center gap-2"
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
                      <h1 className="font-serif text-2xl font-bold text-[#023625]">YITZAK INSTITUTIONAL ADVISORY</h1>
                      <p className="text-xs font-mono text-[#7d5800] uppercase font-bold">Accredited Certification Schemes &amp; Standards Directory</p>
                      <p className="text-[10px] text-gray-500 mt-1">In direct technical partnership with FoodChain ID</p>
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
                      Explore our core accredited certification routes. Each scheme includes full technical support, gap assessments, and official audit preparation.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Scheme 1: Product & Label Certification */}
                  <ScrollReveal direction="up" delay={0.1}>
                    <div className="bg-white border border-border p-8 rounded-xl flex flex-col justify-between shadow-sm h-full hover:border-[#B68A35]/40 hover:shadow-md transition-all group duration-200">
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Accredited</span>
                          </span>
                          <span className="bg-[#B68A35]/10 text-[#7a5a1f] border border-[#B68A35]/30 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Award size={12} className="text-[#B68A35]" />
                            <span>Industry Standard</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-4 pt-1">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg shrink-0">
                            P
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors">Product &amp; Label Certification</h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">Products &amp; Claims</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Non-GMO</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Organic</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Identity Preserved</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Gluten-Free</span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Certification for product claims that hold up to market and regulatory scrutiny, including organic, Non-GMO Project Verification, and Gluten-Free. We help you choose the right scheme, prepare your evidence, and move through assessment with total confidence.
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap justify-between items-center gap-2">
                        <a
                          href="https://www.foodchainid.com/product-and-label-certification/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: Product & Label Certification')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Readiness</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Scheme 2: GLOBALG.A.P. */}
                  <ScrollReveal direction="up" delay={0.2}>
                    <div className="bg-white border border-border p-8 rounded-xl flex flex-col justify-between shadow-sm h-full hover:border-[#B68A35]/40 hover:shadow-md transition-all group duration-200">
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Accredited</span>
                          </span>
                          <span className="bg-sky-50 text-sky-800 border border-sky-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Globe size={12} className="text-sky-600" />
                            <span>GFSI Benchmarked</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-4 pt-1">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg shrink-0">
                            G
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors">GLOBALG.A.P.</h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">Farm Assurance</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Good Ag Practice</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Chain of Custody</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">GRASP</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Produce Handling</span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Good agricultural practice certification covering food safety, traceability, and responsible production. GFSI-benchmarked and recognised by major international retailers worldwide, it opens global export markets for your farm supply.
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap justify-between items-center gap-2">
                        <a
                          href="https://www.foodchainid.com/globalg-a-p/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: GLOBALG.A.P. Certification')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Readiness</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Scheme 3: BRCGS Certifications */}
                  <ScrollReveal direction="up" delay={0.3}>
                    <div className="bg-white border border-border p-8 rounded-xl flex flex-col justify-between shadow-sm h-full hover:border-[#B68A35]/40 hover:shadow-md transition-all group duration-200">
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            <span>Accredited</span>
                          </span>
                          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1">
                            <Award size={12} className="text-indigo-600" />
                            <span>Global Standard</span>
                          </span>
                        </div>

                        <div className="flex items-start gap-4 pt-1">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg shrink-0">
                            B
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-serif text-lg md:text-xl text-primary font-bold group-hover:text-[#B68A35] transition-colors">BRCGS Certifications</h3>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">Food Safety &amp; Quality</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Food Safety Issue 9</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Packaging</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Storage &amp; Dist.</span>
                          <span className="text-[10px] bg-mist text-primary border border-border px-2.5 py-0.5 rounded font-medium">Agents &amp; Brokers</span>
                        </div>

                        <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                          Globally recognised food-safety standards spanning manufacturing, packaging, storage, and distribution. We prepare your team, documentation, and quality management systems so the certification audit succeeds smoothly.
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-border/60 flex flex-wrap justify-between items-center gap-2">
                        <a
                          href="https://www.foodchainid.com/brcgs-certifications/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B68A35] font-sans text-xs uppercase tracking-wider font-bold hover:text-primary transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Scheme details</span>
                          <span>↗</span>
                        </a>
                        <button
                          onClick={() => handleOpenBooking('compliance', 'Inquiry: BRCGS Certification')}
                          className="text-primary font-sans text-xs uppercase tracking-wider font-bold hover:text-[#B68A35] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inquire Readiness</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Scheme 4: FSSC 22000 & ISO Systems */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="bg-white border border-border p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm hover:border-[#B68A35]/40 transition-all">
                    <div className="space-y-4 max-w-3xl">
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
                        Full certification support for FSSC 22000 (Version 6), ISO 22000 (Food Safety), ISO 9001 (Quality), ISO 14001 (Environmental), and ISO 45001 (Occupational Health &amp; Safety). Build an integrated management framework that meets international buyer requirements.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-xs bg-mist text-primary border border-border px-3 py-1 rounded font-medium">FSSC 22000 v6</span>
                        <span className="text-xs bg-mist text-primary border border-border px-3 py-1 rounded font-medium">ISO 22000</span>
                        <span className="text-xs bg-mist text-primary border border-border px-3 py-1 rounded font-medium">ISO 9001</span>
                        <span className="text-xs bg-mist text-primary border border-border px-3 py-1 rounded font-medium">ISO 14001</span>
                        <span className="text-xs bg-mist text-primary border border-border px-3 py-1 rounded font-medium">ISO 45001</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('compliance', 'Inquiry: FSSC 22000 / ISO Management Systems')}
                      className="bg-primary hover:bg-forest-green text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded transition-all cursor-pointer shrink-0 inline-flex items-center gap-2"
                    >
                      <span>Inquire ISO &amp; FSSC</span>
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
                        Yitzak operates in direct partnership with FoodChain ID to deliver accredited food safety certifications and official academy training across Southern Africa.
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

            {/* Compliance & ROI Calculator Section */}
            <ComplianceCalculator onInquire={(notes) => handleOpenBooking('compliance', notes)} />

            {/* Frequently Asked Questions Accordion Section */}
            <FAQSection />
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
              <TrainingCalendar 
                onReserveCourse={(notesStr) => handleOpenBooking('training', notesStr)} 
              />
            </div>
          </motion.div>
        )}

        {currentView === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#F9F9F9] min-h-screen text-[#2D3142] py-16 px-4 md:px-16"
          >
            <ContactUs />
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container full-width">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 px-4 md:px-16 py-16 max-w-[1280px] mx-auto">
          <div className="col-span-1 md:col-span-2 mb-8 md:mb-0 space-y-4">
            <div className="font-display-hero text-headline-md font-bold text-surface-container-lowest">
              YITZAK
            </div>
            <p className="font-body-md text-sm opacity-80 max-w-md leading-relaxed">
              In direct technical partnership with FoodChain ID. Providing institutional consulting, accredited certification readiness, and professional food safety training across Southern Africa.
            </p>
            <p className="font-sans text-xs opacity-60 pt-2">
              © 2026 YITZAK. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 font-technical-label text-xs uppercase tracking-wider">
            <span className="text-[#B68A35] font-bold pb-1 text-[11px] font-mono">Overview</span>
            <button onClick={() => navigateTo('home')} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">About Us</button>
            <button onClick={() => navigateTo('consulting')} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Consulting Services</button>
            <button onClick={() => {
              navigateTo('home');
              setTimeout(() => {
                const el = document.getElementById('portal');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Client Portal</button>
          </div>

          <div className="flex flex-col gap-2.5 font-technical-label text-xs uppercase tracking-wider">
            <span className="text-[#B68A35] font-bold pb-1 text-[11px] font-mono">Programs &amp; Schemes</span>
            <button onClick={() => navigateTo('training')} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Training Curricula</button>
            <button onClick={() => navigateTo('certifications')} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Accredited Schemes</button>
            <button onClick={() => navigateTo('calendar')} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Schedule &amp; Dates</button>
          </div>

          <div className="flex flex-col gap-2.5 font-technical-label text-xs uppercase tracking-wider">
            <span className="text-[#B68A35] font-bold pb-1 text-[11px] font-mono">Knowledge &amp; Contact</span>
            <button onClick={handleDownloadWhitepaper} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Knowledge Centre</button>
            <button onClick={() => navigateTo('contact')} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Contact Us</button>
            <button onClick={() => handleOpenBooking()} className="text-left text-on-primary opacity-80 hover:text-secondary transition-opacity cursor-pointer">Inquire Advisory</button>
          </div>
        </div>
      </footer>

      {/* Global Booking Modal Component */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        initialPillarId={selectedPillarId}
        initialNotes={selectedBookingNotes}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Outbound Referral Bridge Interstitial Modal */}
      <OutboundBridgeModal
        isOpen={referralTarget !== null}
        onClose={() => setReferralTarget(null)}
        targetUrl={referralTarget?.url || ''}
        schemeName={referralTarget?.schemeName || ''}
        currentUser={currentUser}
        triggerNotification={triggerNotification}
      />

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-secondary text-white hover:bg-gold-hover shadow-xl cursor-pointer flex items-center justify-center border border-white/20 transition-all duration-300 group"
            title="Back to Top"
            aria-label="Back to Top"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
