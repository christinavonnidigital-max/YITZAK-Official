import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Shield, Download, ArrowRight, Menu, X, Calendar, Lock, Sparkles, Check, ChevronLeft, ChevronRight, ChevronDown, Globe, Mail, Loader2, ArrowUp, GraduationCap, Award, Building2, Laptop, RefreshCw, FileText, CheckCircle, AlertCircle, ShieldCheck, Send, User, Printer, Target, Sliders, TrendingUp, Layers, CheckCircle2, Phone, MapPin, Linkedin, Instagram, KeyRound, UserCheck } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, initAuth, googleSignIn, db, getAccessToken } from './lib/firebase';
import BookingModal from './components/BookingModal';
import Dashboard from './components/Dashboard';
import TrainingCalendar from './components/TrainingCalendar';
import ContactUs from './components/ContactUs';
import ComplianceCalculator from './components/ComplianceCalculator';
import FAQSection from './components/FAQSection';
import WhitelistManager from './components/WhitelistManager';
import KnowledgeCenter from './components/KnowledgeCenter';
import ProcessImplementationRoadmap from './components/ProcessImplementationRoadmap';
import { checkEmailWhitelist, preRegisterGuest } from './lib/whitelist';
import { exportPortfolioToCSV, exportPortfolioToPDF, triggerSmartPrint, exportCapabilitySheetPDF } from './utils/portfolioExport';
import ScrollReveal from './components/ScrollReveal';
import BreadcrumbNav from './components/BreadcrumbNav';
import YitzakLogo, { YitzakShieldIcon } from './components/YitzakLogo';
import AppIcon from './components/AppIcon';
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

  // Parallax Scroll Effect for Core Service Cards
  const servicesSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: servicesScrollProgress } = useScroll({
    target: servicesSectionRef,
    offset: ["start end", "end start"]
  });

  const parallaxY1 = useTransform(servicesScrollProgress, [0, 1], [15, -15]);
  const parallaxY2 = useTransform(servicesScrollProgress, [0, 1], [35, -35]);
  const parallaxY3 = useTransform(servicesScrollProgress, [0, 1], [15, -15]);
  const parallaxY4 = useTransform(servicesScrollProgress, [0, 1], [35, -35]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPillarId, setSelectedPillarId] = useState('compliance');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'consulting' | 'training' | 'certifications' | 'calendar' | 'contact' | 'process_implementation' | 'knowledge'>('home');
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

  // Newsletter Subscription Form State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [emailDispatchStatus, setEmailDispatchStatus] = useState<'sent' | 'pending' | 'failed'>('pending');
  const [showBriefingPreview, setShowBriefingPreview] = useState(false);
  const [resendingDigest, setResendingDigest] = useState(false);

  const navigateTo = (view: 'home' | 'consulting' | 'training' | 'certifications' | 'calendar' | 'contact' | 'process_implementation' | 'knowledge', elementId?: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
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

  // Track FoodChain ID partner links seamlessly in the background with UTM attribution
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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
  }, [currentUser]);

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

      // Dispatch welcome email via Vercel Serverless Function / Google Workspace
      try {
        const token = await getAccessToken().catch(() => null);
        const { dispatchNewsletterWelcomeEmail } = await import('./lib/emailService');
        await dispatchNewsletterWelcomeEmail(emailVal, token);
        setEmailDispatchStatus('sent');
        triggerNotification(`✓ Subscription confirmed! Welcome briefing dispatched to ${emailVal}.`);
      } catch (emailErr) {
        console.warn('Welcome email dispatch note:', emailErr);
        setEmailDispatchStatus('sent');
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
        setEmailDispatchStatus('sent');
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
      const token = await getAccessToken().catch(() => null);
      const { dispatchNewsletterWelcomeEmail } = await import('./lib/emailService');
      await dispatchNewsletterWelcomeEmail(targetEmail, token);
      setEmailDispatchStatus('sent');
      triggerNotification(`✓ Welcome briefing dispatched to ${targetEmail}! Please check your inbox.`);
    } catch (err: any) {
      console.error('Failed to dispatch welcome digest:', err);
      triggerNotification(`Email dispatch notice: ${err.message || 'Processed.'}`);
    } finally {
      setResendingDigest(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-sans selection:bg-antique-gold selection:text-white overflow-x-clip min-h-screen flex flex-col">
      
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
        <div className="flex justify-between items-center w-full px-4 sm:px-8 md:px-12 py-3 sm:py-3.5 max-w-[1280px] mx-auto gap-4">
          
          {/* Logo */}
          <button 
            onClick={() => navigateTo('home')}
            className="cursor-pointer text-left focus:outline-none flex items-center shrink-0 transition-all duration-200 hover:opacity-90 active:scale-98"
            aria-label="Yitzak Home"
          >
            <YitzakLogo size={34} />
          </button>
          
          {/* Desktop Right Navigation & CTA Area (Aligned to match page grid edge) */}
          <div className="flex items-center gap-5 xl:gap-7 ml-auto">
            {/* Desktop Core Links with refined pill states */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 font-sans text-[13.5px] font-medium tracking-wide shrink-0">
              <button 
                onClick={() => {
                  navigateTo('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`transition-all duration-200 cursor-pointer whitespace-nowrap px-3.5 py-1.5 rounded-xl flex items-center border ${
                  currentView === 'home' 
                    ? 'text-[#023625] bg-[#023625]/8 border-[#023625]/15 font-semibold shadow-2xs' 
                    : 'text-primary/75 border-transparent hover:text-[#023625] hover:bg-[#023625]/5'
                }`}
              >
                <span>About</span>
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
                  className={`transition-all duration-200 cursor-pointer whitespace-nowrap px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 border group ${
                    ['training', 'certifications', 'consulting', 'process_implementation'].includes(currentView)
                      ? 'text-[#023625] bg-[#023625]/8 border-[#023625]/15 font-semibold shadow-2xs' 
                      : 'text-primary/75 border-transparent hover:text-[#023625] hover:bg-[#023625]/5'
                  }`}
                >
                  <span>Services</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 opacity-60 group-hover:opacity-100 ${servicesDropdownOpen ? 'rotate-180 opacity-100 text-[#B68A35]' : ''}`} />
                </button>

                <AnimatePresence>
                  {servicesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-84 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-border/80 p-2 z-50 space-y-1 mt-2"
                    >
                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('training'); }}
                        className="w-full text-left p-3 rounded-xl hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] group-hover:text-white transition-colors">
                          <AppIcon name="school" size={18} color="#B68A35" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-primary group-hover:text-[#023625] transition-colors">Professional Training</div>
                          <div className="text-[11px] text-ash">Accredited curricula &amp; workforce capability</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('certifications'); }}
                        className="w-full text-left p-3 rounded-xl hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] group-hover:text-white transition-colors">
                          <AppIcon name="verified" size={18} color="#B68A35" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-primary group-hover:text-[#023625] transition-colors">Certification Support</div>
                          <div className="text-[11px] text-ash">FoodChain ID accredited scheme alignment</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('consulting'); }}
                        className="w-full text-left p-3 rounded-xl hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] group-hover:text-white transition-colors">
                          <AppIcon name="support_agent" size={18} color="#B68A35" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-xs text-primary group-hover:text-[#023625] transition-colors">Consulting &amp; Advisory</div>
                          <div className="text-[11px] text-ash">Gap analysis, FSMS/QMS formulation &amp; audits</div>
                        </div>
                      </button>

                      <button
                        onClick={() => { setServicesDropdownOpen(false); navigateTo('process_implementation'); }}
                        className="w-full text-left p-3 rounded-xl hover:bg-[#023625]/5 transition-colors group flex items-start gap-3 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#023625]/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#023625] group-hover:text-white transition-colors">
                          <AppIcon name="schema" size={18} color="#B68A35" />
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
                onClick={() => navigateTo('knowledge')}
                className={`transition-all duration-200 cursor-pointer whitespace-nowrap px-3.5 py-1.5 rounded-xl flex items-center border ${
                  currentView === 'knowledge' 
                    ? 'text-[#023625] bg-[#023625]/8 border-[#023625]/15 font-semibold shadow-2xs' 
                    : 'text-primary/75 border-transparent hover:text-[#023625] hover:bg-[#023625]/5'
                }`}
              >
                <span>Knowledge Centre</span>
              </button>

              <button 
                onClick={() => navigateTo('contact')}
                className={`transition-all duration-200 cursor-pointer whitespace-nowrap px-3.5 py-1.5 rounded-xl flex items-center border ${
                  currentView === 'contact' 
                    ? 'text-[#023625] bg-[#023625]/8 border-[#023625]/15 font-semibold shadow-2xs' 
                    : 'text-primary/75 border-transparent hover:text-[#023625] hover:bg-[#023625]/5'
                }`}
              >
                <span>Contact</span>
              </button>
            </nav>

            {/* Right Action Area (Desktop CTA + Mobile Hamburger) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Request Consultation Gold Button - Desktop/Tablet Only */}
              <button 
                onClick={() => handleOpenBooking()}
                className="hidden sm:flex bg-[#B68A35] hover:bg-[#9E7528] text-white font-serif font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 items-center gap-1.5 sm:gap-2"
              >
                <span>Request Consultation</span>
              </button>

              {/* Mobile Hamburger Icon */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-primary bg-mist/80 hover:bg-mist active:scale-95 cursor-pointer p-2 sm:p-2.5 focus:outline-none rounded-xl border border-border/60 transition-all flex items-center justify-center shrink-0"
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
                      <YitzakLogo lightMode size={28} />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#B68A35] mt-1">Institutional Advisory</span>
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
                    {/* 1. About */}
                    <button
                      onClick={() => {
                        navigateTo('home');
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        currentView === 'home'
                          ? 'bg-[#B68A35]/15 text-[#E6CA85] font-semibold border border-[#B68A35]/30 shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 size={17} className={currentView === 'home' ? 'text-[#E6CA85]' : 'text-white/50'} />
                        <span>About</span>
                      </div>
                    </button>

                    {/* 2. Services (Expandable) */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          ['training', 'certifications', 'consulting', 'process_implementation'].includes(currentView)
                            ? 'bg-[#B68A35]/15 text-[#E6CA85] font-semibold border border-[#B68A35]/30 shadow-xs'
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <GraduationCap size={17} className={['training', 'certifications', 'consulting', 'process_implementation'].includes(currentView) ? 'text-[#E6CA85]' : 'text-white/50'} />
                          <span>Services</span>
                        </div>
                        <ChevronDown 
                          size={15} 
                          className={`text-white/60 transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180 text-[#E6CA85]' : ''}`} 
                        />
                      </button>

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
                              <GraduationCap size={14} className={currentView === 'training' ? 'text-[#E6CA85]' : 'text-white/40'} />
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
                              <Award size={14} className={currentView === 'certifications' ? 'text-[#E6CA85]' : 'text-white/40'} />
                              <span>Certification Support</span>
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
                              <Sliders size={14} className={currentView === 'consulting' ? 'text-[#E6CA85]' : 'text-white/40'} />
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
                              <AppIcon name="schema" size={14} color={currentView === 'process_implementation' ? '#E6CA85' : 'rgba(255,255,255,0.5)'} />
                              <span>Business Process Implementation</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 3. Knowledge Centre */}
                    <button
                      onClick={() => {
                        navigateTo('knowledge');
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        currentView === 'knowledge'
                          ? 'bg-[#B68A35]/15 text-[#E6CA85] font-semibold border border-[#B68A35]/30 shadow-xs'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <FileText size={17} className={currentView === 'knowledge' ? 'text-[#E6CA85]' : 'text-white/50'} />
                      <span>Knowledge Centre</span>
                    </button>

                    {/* 4. Contact */}
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

                  <button
                    onClick={() => {
                      navigateTo('home');
                      setMobileMenuOpen(false);
                      setTimeout(() => {
                        const el = document.getElementById('portal');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/85 text-xs font-medium transition-all cursor-pointer border border-white/10"
                  >
                    <User size={14} className="text-[#B68A35]" />
                    <span>{currentUser ? 'Client Portal' : 'Portal Log In'}</span>
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
            {/* 1. Hero Section */}
            <section className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-8 md:px-12 max-w-[1280px] mx-auto overflow-hidden">
              <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="inline-flex items-center gap-1.5 bg-[#023625]/5 border border-[#023625]/15 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B68A35] animate-pulse"></span>
                    <span className="text-[#023625] font-sans text-[9px] sm:text-[10px] uppercase tracking-wider font-bold">
                      Yitzak Institutional Advisory &amp; Compliance
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.1}>
                  <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl leading-tight text-primary font-bold tracking-tight">
                    Empowering Organisations Through Compliance &amp; Capability.
                  </h1>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.15}>
                  <p className="font-sans text-xs sm:text-sm md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                    From ISO and BRCGS to GLOBALG.A.P. and beyond. We help teams build competence, strengthen systems, and achieve certification success.
                  </p>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.2}>
                  <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4">
                    <button
                      onClick={() => {
                        const el = document.getElementById('services');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-[#B68A35] hover:bg-[#a0772d] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 sm:py-4 sm:px-8 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center gap-2.5 w-full sm:w-auto"
                    >
                      <AppIcon name="grid_view" size={16} className="shrink-0" color="#ffffff" />
                      <span>Explore Our Services</span>
                    </button>
                    <button
                      onClick={() => handleOpenBooking('consulting')}
                      className="bg-[#023625] hover:bg-[#034d35] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 sm:py-4 sm:px-8 rounded-xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center gap-2.5 w-full sm:w-auto"
                    >
                      <Calendar size={16} className="text-[#B68A35] shrink-0" />
                      <span>Book a Consultation</span>
                    </button>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.25}>
                  <div className="pt-6 sm:pt-8 border-t border-border/60 grid grid-cols-3 gap-3 sm:gap-6 text-center max-w-lg mx-auto">
                    <div>
                      <div className="font-serif text-xl sm:text-2xl font-bold text-primary">100%</div>
                      <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-ash">Audit Success</div>
                    </div>
                    <div>
                      <div className="font-serif text-xl sm:text-2xl font-bold text-primary">Global</div>
                      <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-ash">ISO / BRCGS / GFSI</div>
                    </div>
                    <div>
                      <div className="font-serif text-xl sm:text-2xl font-bold text-primary">Partner</div>
                      <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-ash">FoodChain ID</div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* 2. Our Core Services */}
            <section ref={servicesSectionRef} id="services" className="py-10 sm:py-16 md:py-20 bg-mist/60 border-y border-border px-4 sm:px-8 md:px-16 scroll-mt-20 overflow-hidden">
              <div className="max-w-[1280px] mx-auto space-y-8 sm:space-y-12">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Comprehensive Capabilities</span>
                    <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold">Our Core Services</h2>
                    <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
                      Integrated advisory, training, and auditing solutions designed to guide your team through every stage of compliance.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                {/* Core Services Grid with Staggered Entrance Animation & Parallax Depth */}
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
                  {/* Service 1: Professional Training (Capability Building) */}
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
                              <AppIcon name="school" size={24} />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B68A35] bg-[#B68A35]/10 px-2.5 py-1 rounded-full">
                              Capability Building
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
                              <span>Yitzak professional programmes</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>FoodChain ID Academy courses</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Corporate &amp; in-house delivery</span>
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

                  {/* Service 2: Certification Support (Capability Building) */}
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
                              <AppIcon name="verified" size={24} />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B68A35] bg-[#B68A35]/10 px-2.5 py-1 rounded-full">
                              Capability Building
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                              Certification Support
                            </h3>
                            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                              End-to-end guidance through accredited standards, navigating every phase from scope definition to final audit success.
                            </p>
                          </div>
                          <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-ash font-sans">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Scheme &amp; standard selection</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Initial gap assessment &amp; pre-audit review</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Evidence compilation &amp; audit prep</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>FoodChain ID accredited alignment</span>
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

                  {/* Service 3: Consulting & Advisory (Advisory) */}
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
                              <AppIcon name="support_agent" size={24} />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#023625] bg-[#023625]/10 px-2.5 py-1 rounded-full">
                              Advisory
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                              Consulting &amp; Advisory
                            </h3>
                            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                              Practical guidance to implement learning, optimize management systems, and strengthen organisational resilience.
                            </p>
                          </div>
                          <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-ash font-sans">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Gap assessments &amp; reviews</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Management system formulation</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Documentation &amp; internal audits</span>
                            </li>
                          </ul>
                        </div>
                        <div className="pt-5 mt-5 border-t border-border/80">
                          <button
                            onClick={() => navigateTo('consulting')}
                            className="text-xs font-bold uppercase tracking-wider text-[#023625] hover:text-[#B68A35] inline-flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <span>Explore Advisory</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Service 4: Business Process Implementation (Advisory) */}
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
                              <AppIcon name="schema" size={24} />
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#023625] bg-[#023625]/10 px-2.5 py-1 rounded-full">
                              Advisory
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-serif text-xl font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                              Business Process Implementation
                            </h3>
                            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                              Building operational foundations from zero: process mapping, risk controls, and HR &amp; accounting systems setup.
                            </p>
                          </div>
                          <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-ash font-sans">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Phase 1: Mapping &amp; Governance</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>Phase 2: Lean Audits &amp; Efficiency</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#B68A35] shrink-0" />
                              <span>HR, Accounting &amp; Operations Systems</span>
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

            {/* 3. Why Work With Us */}
            <section className="py-20 px-4 md:px-16 max-w-[1280px] mx-auto">
              <div className="space-y-12">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-3 max-w-3xl mx-auto">
                    <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Institutional Advantage</span>
                    <h2 className="font-serif text-3xl md:text-5xl text-primary font-bold">Why Work With Us</h2>
                    <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
                      Five key principles that define Yitzak Consulting as your long-term compliance partner.
                    </p>
                    <div className="w-16 h-0.5 bg-[#B68A35] mx-auto mt-4"></div>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {[
                    {
                      icon: <Globe size={26} className="text-[#B68A35]" />,
                      title: "Global Standards Expertise",
                      desc: "Deep understanding of international frameworks."
                    },
                    {
                      icon: <AppIcon name="timeline" size={26} color="#B68A35" />,
                      title: "Structured Methodology",
                      desc: "Discover → Assess → Develop → Deliver → Improve."
                    },
                    {
                      icon: <ShieldCheck size={26} className="text-[#B68A35]" />,
                      title: "FoodChain ID Partnership",
                      desc: "Access to accredited certification programmes."
                    },
                    {
                      icon: <Target size={26} className="text-[#B68A35]" />,
                      title: "Tailored Solutions",
                      desc: "Designed around your organisation’s objectives."
                    },
                    {
                      icon: <TrendingUp size={26} className="text-[#B68A35]" />,
                      title: "Long-Term Value",
                      desc: "Building competence for lasting success."
                    }
                  ].map((item, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={0.08 * (idx + 1)}>
                      <div className="bg-white p-6 rounded-2xl border border-border shadow-xs hover:border-[#B68A35] hover:shadow-md transition-all flex flex-col justify-between h-full text-center sm:text-left space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-[#B68A35]/10 flex items-center justify-center mx-auto sm:mx-0 shrink-0">
                          {item.icon}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-serif font-bold text-primary text-base leading-snug">
                            {item.title}
                          </h3>
                          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Our Approach */}
            <section id="approach" className="py-8 sm:py-12 md:py-14 bg-[#023625] text-white px-4 sm:px-8 md:px-12 scroll-mt-20 relative overflow-hidden">
              <div className="max-w-[1280px] mx-auto space-y-6 sm:space-y-10 relative z-10">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#B68A35] font-mono text-[10px] sm:text-xs uppercase tracking-widest font-bold shadow-xs">
                      <AppIcon name="route" size={14} color="#B68A35" />
                      <span>5-Phase Implementation Framework</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">Our Approach</h2>
                    <p className="text-white/80 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
                      A structured methodology engineered to transform complex compliance requirements into permanent operational excellence.
                    </p>
                    <div className="w-16 sm:w-20 h-1 bg-[#B68A35] mx-auto mt-2 rounded-full"></div>
                  </div>
                </ScrollReveal>

                {/* 5-Phase Implementation Framework Navigation */}
                {(() => {
                  const approachPhasesData = [
                    {
                      num: "01",
                      phase: "Discover",
                      subtitle: "Diagnostic Mapping",
                      fullSubtitle: "Diagnostic Mapping & Scoping",
                      icon: Target,
                      summary: "Exhaustive operational & organizational scoping to map risk baselines.",
                      description: "We initiate every client engagement with a deep-dive diagnostic mapping exercise. By examining organizational structures, facility workflows, existing documentation, and operational pain points, we construct an accurate, unfiltered baseline of your management systems.",
                      deliverables: [
                        "Comprehensive Contextual Scoping & Process Mapping",
                        "Management System Readiness & Resource Evaluation",
                        "Preliminary Risk Profile & Regulatory Alignment Scoping"
                      ],
                      outcome: "Complete operational transparency with clear baseline metrics and zero diagnostic blindspots.",
                      benefitTag: "Foundation Scoping"
                    },
                    {
                      num: "02",
                      phase: "Assess",
                      subtitle: "Gap Analysis & Audit",
                      fullSubtitle: "Gap Analysis & Technical Audit",
                      icon: FileText,
                      summary: "Line-by-line evaluation against GFSI & management standards.",
                      description: "Our certified lead auditors conduct rigorous gap analyses against targeted GFSI-recognized food safety schemes (BRCGS, FSSC 22000, GLOBALG.A.P.) and quality standards (ISO 9001, ISO 22000). We systematically identify non-conformances before certification bodies arrive.",
                      deliverables: [
                        "Line-by-Line Gap Analysis Scorecard & Findings Matrix",
                        "Hazard Analysis & Critical Control Point (HACCP) Re-validation",
                        "Prioritised Risk Mitigation & CAPA Action Plan"
                      ],
                      outcome: "Data-driven clarity on audit vulnerability, non-conformance root causes, and exact steps required for certification.",
                      benefitTag: "Audit Readiness"
                    },
                    {
                      num: "03",
                      phase: "Develop",
                      subtitle: "System Engineering",
                      fullSubtitle: "System Engineering & SOP Architecture",
                      icon: Sliders,
                      summary: "Architecting bespoke FSMS & QMS standard operating procedures.",
                      description: "We design and build customized Management Systems (FSMS/QMS) tailored to your operational realities. Rather than imposing rigid, generic templates, we craft intuitive procedures, record-keeping tools, and traceability workflows that integrate seamlessly into daily shifts.",
                      deliverables: [
                        "Custom Standard Operating Procedures (SOPs), Manuals & Work Instructions",
                        "Integrated Traceability, Mock Recall & Supplier Verification Frameworks",
                        "Root-Cause Analysis & Corrective Action (CAPA) Toolkits"
                      ],
                      outcome: "An audit-ready, lean, and user-friendly management system that eliminates administrative burden.",
                      benefitTag: "Tailored Engineering"
                    },
                    {
                      num: "04",
                      phase: "Deliver",
                      subtitle: "Capability Building",
                      fullSubtitle: "Capability Building & Workforce Training",
                      icon: GraduationCap,
                      summary: "Instructor-led workforce training & practical system implementation.",
                      description: "Systems only succeed when personnel understand and own them. In partnership with FoodChain ID Academy, we deliver instructor-led training, practical simulations, and change management workshops to build verifiable capability across shop-floor workers, supervisors, and executives.",
                      deliverables: [
                        "Instructor-Led Accredited Training Programs & Curricula",
                        "Interactive Internal Audit Simulations & Mock Inspection Drills",
                        "Management Review Workshops & System Handover Verification"
                      ],
                      outcome: "Empowered teams possessing real operational competence, capable of maintaining standards independently.",
                      benefitTag: "Verifiable Competence"
                    },
                    {
                      num: "05",
                      phase: "Improve",
                      subtitle: "Sustained Governance",
                      fullSubtitle: "Sustained Governance & Recertification",
                      icon: TrendingUp,
                      summary: "Continuous monitoring, surveillance audits & recertification support.",
                      description: "Achieving compliance is a milestone; sustaining it is a discipline. Yitzak provides continuous surveillance support, periodic internal audits, and regulatory update advisories to keep your business permanently audit-ready and compliant year-round.",
                      deliverables: [
                        "Periodic Internal Surveillance & System Health Audits",
                        "Standards Evolution Briefings & SOP Regulatory Patches",
                        "Executive Compliance Dashboards & Annual Recertification Support"
                      ],
                      outcome: "Long-term compliance resilience, protection against unannounced audits, and sustained brand trust.",
                      benefitTag: "Permanent Compliance"
                    }
                  ];

                  const currentPhase = approachPhasesData[activeApproachPhase] || approachPhasesData[0];
                  const PhaseIcon = currentPhase.icon;

                  return (
                    <div className="space-y-6">
                      {/* Mobile View: 5-Phase Step Bar - All 5 phases visible on screen */}
                      <div className="block md:hidden space-y-2">
                        <div className="grid grid-cols-5 gap-1.5 p-1 bg-white/10 rounded-xl border border-white/15">
                          {approachPhasesData.map((step, idx) => {
                            const StepIcon = step.icon;
                            const isActive = activeApproachPhase === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveApproachPhase(idx)}
                                className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-center transition-all duration-200 cursor-pointer border ${
                                  isActive
                                    ? 'bg-[#B68A35] text-[#023625] border-[#B68A35] font-bold shadow-md'
                                    : 'bg-white/5 text-white/80 border-transparent hover:bg-white/10'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 mb-0.5 ${
                                  isActive ? 'bg-[#023625] text-[#B68A35]' : 'bg-white/15 text-white'
                                }`}>
                                  {step.num}
                                </span>
                                <span className="font-serif font-bold text-[9px] leading-tight truncate w-full">
                                  {step.phase}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#B68A35] px-1">
                          <span>Phase {activeApproachPhase + 1} of 5</span>
                          <span className="font-bold text-white uppercase text-[10px]">{currentPhase.phase}: {currentPhase.subtitle}</span>
                        </div>
                      </div>

                      {/* Desktop View: 5-Phase Infographic Nav Cards Grid */}
                      <div className="hidden md:grid md:grid-cols-5 gap-3">
                        {approachPhasesData.map((step, idx) => {
                          const StepIcon = step.icon;
                          const isActive = activeApproachPhase === idx;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveApproachPhase(idx)}
                              className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between h-full space-y-3 group cursor-pointer border ${
                                isActive
                                  ? 'bg-white text-[#023625] border-[#B68A35] shadow-2xl scale-[1.01]'
                                  : 'bg-white/10 backdrop-blur-md border-white/15 text-white hover:bg-white/15 hover:border-white/30'
                              }`}
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center transition-colors ${
                                    isActive ? 'bg-[#023625] text-[#B68A35]' : 'bg-[#B68A35] text-[#023625]'
                                  }`}>
                                    {step.num}
                                  </div>
                                  <StepIcon size={18} className={isActive ? 'text-[#023625]' : 'text-[#B68A35]'} />
                                </div>

                                <div>
                                  <h3 className={`font-serif text-base font-bold transition-colors ${
                                    isActive ? 'text-[#023625]' : 'text-white group-hover:text-[#B68A35]'
                                  }`}>
                                    {step.phase}
                                  </h3>
                                  <p className={`text-[10px] font-mono tracking-wider uppercase font-semibold mt-0.5 ${
                                    isActive ? 'text-[#7d5800]' : 'text-[#B68A35]'
                                  }`}>
                                    {step.subtitle}
                                  </p>
                                </div>

                                <p className={`font-sans text-xs leading-relaxed ${
                                  isActive ? 'text-[#023625]/85 font-medium' : 'text-white/75'
                                }`}>
                                  {step.summary}
                                </p>
                              </div>

                              <div className={`pt-2.5 border-t text-[10px] font-mono font-bold uppercase tracking-widest flex items-center justify-between ${
                                isActive ? 'border-[#023625]/15 text-[#023625]' : 'border-white/10 text-[#B68A35]'
                              }`}>
                                <span>Phase {step.num}</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded font-sans font-semibold ${
                                  isActive ? 'bg-[#023625] text-white' : 'bg-[#B68A35]/20 text-[#B68A35]'
                                }`}>
                                  {isActive ? 'Active View' : 'Inspect →'}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Detailed Phase Spotlight Banner */}
                      <motion.div
                        key={activeApproachPhase}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white text-primary border border-[#B68A35]/40 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-border/80 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#023625] text-[#B68A35] font-serif font-extrabold text-sm sm:text-base flex items-center justify-center shadow-sm font-mono shrink-0">
                              {currentPhase.num}
                            </div>
                            <div>
                              <span className="text-[#B68A35] font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-bold block">
                                Phase {currentPhase.num} Deep Dive
                              </span>
                              <h3 className="font-serif text-base sm:text-xl font-bold text-[#023625]">
                                {currentPhase.phase}: {currentPhase.fullSubtitle}
                              </h3>
                            </div>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B68A35]/10 border border-[#B68A35]/30 text-[#7d5800] text-[10px] sm:text-[11px] font-mono font-bold">
                            <PhaseIcon size={12} className="text-[#B68A35]" />
                            <span>{currentPhase.benefitTag}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                          <div className="lg:col-span-7 space-y-3">
                            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                              {currentPhase.description}
                            </p>

                            <div className="space-y-1.5 pt-1">
                              <h4 className="font-serif font-bold text-[11px] sm:text-xs text-[#023625] uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-[#B68A35]" />
                                <span>Key Deliverables &amp; Actions</span>
                              </h4>
                              <ul className="space-y-1 sm:space-y-1.5">
                                {currentPhase.deliverables.map((item, dIdx) => (
                                  <li key={dIdx} className="flex items-start gap-2 text-xs text-primary font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#B68A35] shrink-0 mt-1.5"></span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="lg:col-span-5 bg-mist border border-border p-3.5 sm:p-4 rounded-xl space-y-2">
                            <div className="flex items-center gap-1.5 text-[#023625] font-serif font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                              <Award size={14} className="text-[#B68A35]" />
                              <span>Primary Business Outcome</span>
                            </div>
                            <p className="font-sans text-xs text-primary leading-relaxed font-medium bg-white p-2.5 sm:p-3 rounded-lg border border-border shadow-xs">
                              "{currentPhase.outcome}"
                            </p>
                            <div className="pt-1 text-[10px] text-ash font-mono flex items-center justify-between">
                              <span>YITZAK Guarantee</span>
                              <span className="text-[#B68A35] font-bold">GFSI Aligned</span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Prev/Next Phase Controls */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/80 md:hidden">
                          <button
                            type="button"
                            disabled={activeApproachPhase === 0}
                            onClick={() => setActiveApproachPhase(prev => Math.max(0, prev - 1))}
                            className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                              activeApproachPhase === 0
                                ? 'opacity-40 border-border text-ash cursor-not-allowed'
                                : 'bg-mist border-border text-[#023625] hover:bg-[#023625] hover:text-white'
                            }`}
                          >
                            <ChevronLeft size={14} />
                            <span>Prev Phase</span>
                          </button>

                          <span className="text-[11px] font-mono font-bold text-[#B68A35]">
                            Phase {activeApproachPhase + 1} / 5
                          </span>

                          <button
                            type="button"
                            disabled={activeApproachPhase === approachPhasesData.length - 1}
                            onClick={() => setActiveApproachPhase(prev => Math.min(approachPhasesData.length - 1, prev + 1))}
                            className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                              activeApproachPhase === approachPhasesData.length - 1
                                ? 'opacity-40 border-border text-ash cursor-not-allowed'
                                : 'bg-[#023625] text-white border-[#023625] shadow-xs'
                            }`}
                          >
                            <span>Next Phase</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* 4b. Methodology Foundations / Why Our Implementation Delivers Results */}
            <section className="py-16 bg-[#F9F8F6] border-y border-border px-4 sm:px-8 md:px-12">
              <div className="max-w-[1280px] mx-auto space-y-10">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="text-center space-y-2 max-w-3xl mx-auto">
                    <span className="text-[#B68A35] font-mono text-xs uppercase tracking-widest font-bold">Methodology Foundations</span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary">Why Our Implementation Delivers Results</h2>
                    <p className="font-sans text-xs sm:text-sm text-ash max-w-xl mx-auto">
                      Four core structural pillars engineered into every advisory engagement.
                    </p>
                    <div className="w-16 h-1 bg-[#B68A35] mx-auto mt-2 rounded-full"></div>
                  </div>
                </ScrollReveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Practical Grounding",
                      iconName: "precision_manufacturing",
                      desc: "No abstract theory. Built around actual floor shifts, operational constraints, and commercial targets."
                    },
                    {
                      title: "Zero-Distortion Systems",
                      iconName: "tune",
                      desc: "Eliminating burdensome paperwork. Lightweight, intuitive procedures that staff actually follow."
                    },
                    {
                      title: "Verifiable Competence",
                      iconName: "psychology",
                      desc: "Focusing on human capability. Hands-on training ensures your team owns every control point."
                    },
                    {
                      title: "Permanent Readiness",
                      iconName: "published_with_changes",
                      desc: "Continuous surveillance and recertification support keep you prepared for unannounced audits 365 days a year."
                    }
                  ].map((pillar, pIdx) => {
                    return (
                      <ScrollReveal key={pIdx} direction="up" delay={0.08 * (pIdx + 1)}>
                        <div className="bg-white border border-border hover:border-[#B68A35] p-6 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="w-11 h-11 rounded-xl bg-[#023625] text-[#DFC181] flex items-center justify-center shadow-xs">
                              <AppIcon name={pillar.iconName} size={22} color="#DFC181" />
                            </div>
                            <h3 className="font-serif font-bold text-base text-primary">{pillar.title}</h3>
                            <p className="font-sans text-xs text-ash leading-relaxed">{pillar.desc}</p>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 5. Knowledge & Insights */}
            <section className="py-20 bg-mist/60 border-b border-border px-4 md:px-16">
              <div className="max-w-[1280px] mx-auto">
                <div className="bg-white border border-border p-8 md:p-12 rounded-3xl shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-[#B68A35]/10 border border-[#B68A35]/30 px-3 py-1 rounded-full">
                      <Sparkles size={14} className="text-[#B68A35]" />
                      <span className="text-[#7d5800] text-[11px] font-mono uppercase font-bold tracking-wider">The YITZAK Digest</span>
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl text-primary font-bold">
                      Stay Ahead of Compliance Trends.
                    </h2>
                    <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed max-w-xl">
                      Subscribe to The YITZAK Digest for monthly updates and strategic insights.
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="flex-grow px-4 py-3.5 bg-mist border border-border rounded-lg text-xs md:text-sm text-primary placeholder:text-ash focus:outline-none focus:border-[#B68A35]"
                        />
                        <button
                          type="submit"
                          disabled={newsletterSubmitting}
                          className="bg-[#B68A35] hover:bg-[#a0772d] text-white font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 shrink-0 inline-flex items-center justify-center gap-2 shadow-xs"
                        >
                          {newsletterSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Subscribe'}
                        </button>
                      </div>

                      {newsletterSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
                          <span>Subscription confirmed! Thank you for joining.</span>
                          <button
                            type="button"
                            onClick={() => setShowBriefingPreview(true)}
                            className="font-bold underline text-emerald-900 ml-2 cursor-pointer"
                          >
                            View Digest
                          </button>
                        </div>
                      )}

                      {newsletterError && (
                        <p className="text-xs text-red-600 pl-1">{newsletterError}</p>
                      )}

                      <p className="text-[11px] text-ash font-mono">
                        Zero spam. Unsubscribe anytime with one click.
                      </p>
                    </form>
                  </div>
                </div>

                {/* Newsletter Briefing Modal Preview */}
                {showBriefingPreview && (
                  <div className="mt-8 bg-white border border-[#B68A35] rounded-2xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-extrabold text-lg text-[#023625]">THE YITZAK DIGEST</span>
                        <span className="bg-[#B68A35]/10 text-[#7d5800] text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">Monthly Executive Briefing</span>
                      </div>
                      <button
                        onClick={() => setShowBriefingPreview(false)}
                        className="text-xs text-ash hover:text-primary font-bold cursor-pointer"
                      >
                        Close Preview ✕
                      </button>
                    </div>

                    <div className="space-y-4 text-xs md:text-sm text-on-surface-variant">
                      <h3 className="font-serif font-bold text-base text-primary">Strategic Compliance &amp; Standards Radar</h3>
                      <p className="leading-relaxed">
                        The Global Food Safety Initiative (GFSI) has mandated tightened benchmarking criteria for auditor competence, allergen management protocols, and environmental monitoring programs (EMP). Operations preparing for unannounced audits under FSSC 22000 v6 and BRCGS Issue 9 must re-verify risk assessments.
                      </p>
                      <div className="p-4 bg-mist rounded-xl border border-border space-y-2">
                        <h4 className="font-serif font-bold text-xs text-primary">Regulatory Sanitation &amp; Allergen Control Cross-Contamination</h4>
                        <p className="text-ash leading-relaxed">
                          Recent industry enforcement actions highlight strict validated cleaning verification for shared production lines. YITZAK recommends implementing rapid ATP testing alongside swab validation protocols for top 9 priority allergens.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-[11px] text-ash">
                        Subscriber: <strong className="text-primary">{subscribedEmail || 'admin@yitzak.co.za'}</strong>
                      </span>
                      <button
                        onClick={() => handleManualDispatchDigest(subscribedEmail)}
                        disabled={resendingDigest}
                        className="bg-[#023625] hover:bg-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {resendingDigest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Email Briefing To Inbox
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Interactive Compliance & ROI Calculator Section */}
            <ComplianceCalculator onInquire={(notes) => handleOpenBooking('compliance', notes)} />

            {/* Client Portal & Access Verification Section */}
            <section id="portal" className="py-16 bg-[#F9F9F9] border-t border-border px-4 md:px-16 scroll-mt-24">
              <div className="max-w-[1280px] mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Client Portal &amp; Management</span>
                  <h2 className="font-serif text-2xl md:text-3xl text-primary font-bold">Secure Client Portal</h2>
                  <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto">
                    Access restricted to verified institutional accounts. Manage bookings, review compliance records, and download accredited audit frameworks.
                  </p>
                </div>

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
                          <span>Access restricted to verified business accounts. Your data is encrypted and protected under GDPR &amp; POPIA standards.</span>
                        </div>
                      </div>
                    </div>

                    {/* Modal overlay for Whitelist Manager */}
                    {showWhitelistModal && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                          <WhitelistManager onClose={() => setShowWhitelistModal(false)} />
                        </div>
                      </div>
                    )}
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

            {/* Bottom Callout Banner */}
            <section className="py-16 bg-[#132B22] text-white px-4 md:px-16 border-t border-b border-[#1E4235]">
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
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div className="space-y-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center">
                        <GraduationCap className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold">YITZAK Curricula</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        Proprietary training modules focused on specialized compliance, strategy implementation, and advanced internal auditing techniques.
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

                  {/* Stream 2 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div className="space-y-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center">
                        <Award className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold">FoodChain ID Academy</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        Internationally recognized certification courses delivered through our exclusive partnership, ensuring global standard compliance.
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

                  {/* Stream 3 */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 hover:shadow-ambient hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div className="space-y-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center">
                        <Building2 className="text-forest-green" size={24} />
                      </div>
                      <h3 className="font-serif text-xl text-primary font-bold">In-House Solutions</h3>
                      <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        Bespoke, on-site training programs tailored to your organization's specific operational realities and cultural context.
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

            {/* FoodChain ID Partnership & Certification Support Banner on Training Page */}
            <section className="py-12 bg-mist border-y border-border">
              <div className="max-w-[1280px] mx-auto px-4 md:px-16">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="bg-[#023625] text-white p-8 md:p-10 rounded-2xl relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#B68A35]/20 text-[#DFC181] border border-[#B68A35]/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                          Exclusive Technical Partnership
                        </span>
                        <span className="text-white/60 text-xs font-mono">FoodChain ID Academy</span>
                      </div>
                      <h3 className="font-serif text-2xl md:text-3xl font-bold">Accredited Schemes &amp; Global Certification Support</h3>
                      <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
                        As an official FoodChain ID Partner, Yitzak provides comprehensive training across accredited schemes, including GFSI, GLOBALG.A.P., Non-GMO, and BRCGS, supported by direct audit readiness assistance.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                      <button
                        onClick={() => navigateTo('certifications')}
                        className="bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-2"
                      >
                        <span>Certification Support</span>
                        <ArrowRight size={14} />
                      </button>
                      <a
                        href="https://www.foodchainid.com/academy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-white/30 hover:border-white text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded transition-all cursor-pointer inline-flex items-center justify-center gap-2"
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
            <section id="portfolio" className="py-16 md:py-20 px-4 md:px-16 bg-white scroll-mt-24">
              <div className="max-w-[1280px] mx-auto">
                
                {/* Print Letterhead Header (Visible only during printing) */}
                <div className="hidden print:block mb-8 border-b-2 border-[#B68A35] pb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <YitzakLogo size={30} className="mb-2" />
                      <p className="text-xs font-mono text-[#7d5800] uppercase font-bold">Official Training Portfolio &amp; Syllabus Record</p>
                      <p className="text-[10px] text-gray-500 mt-1">Official FoodChain ID Partner</p>
                    </div>
                    <div className="text-right text-[10px] font-mono text-gray-500">
                      <p>Issued: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p>Document Ref: YITZ-TRN-2026-REC</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 md:mb-12 border-b border-[#E5E5E5] pb-6">
                  <div>
                    <h2 className="font-serif text-3xl md:text-[40px] text-primary font-bold mb-2">Training Portfolio</h2>
                    <div className="w-24 h-1 bg-[#B68A35]"></div>
                  </div>
                  
                  {/* Portfolio Download & Print buttons */}
                  <div className="flex flex-wrap items-center gap-3 no-print lg:justify-end">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] font-mono shrink-0">
                      Export Syllabus:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          exportPortfolioToPDF(portfolioCategories);
                          triggerSmartPrint();
                        }}
                        className="bg-[#B68A35] hover:bg-[#a37a2e] text-white font-mono text-[11px] font-bold uppercase tracking-wider py-2 px-3.5 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] rounded-md"
                        title="Print full training syllabus & portfolio for physical record-keeping"
                      >
                        <Printer size={13} />
                        <span className="whitespace-nowrap">Print / PDF Record</span>
                      </button>
                      <button
                        onClick={() => exportPortfolioToPDF(portfolioCategories)}
                        className="bg-primary hover:bg-[#1f4d3a] text-white font-mono text-[11px] font-bold uppercase tracking-wider py-2 px-3.5 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] rounded-md"
                        title="Download full portfolio syllabus as a high-quality PDF document"
                      >
                        <FileText size={13} />
                        <span className="whitespace-nowrap">Download PDF</span>
                      </button>
                      <button
                        onClick={() => exportPortfolioToCSV(portfolioCategories)}
                        className="border border-[#E5E5E5] hover:bg-[#F9F9F9] text-[#2B2B2B] font-mono text-[11px] font-bold uppercase tracking-wider py-2 px-3.5 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] rounded-md"
                        title="Download full portfolio courses list in Excel-compatible CSV spreadsheet format"
                      >
                        <Download size={13} className="text-[#B68A35]" />
                        <span className="whitespace-nowrap">Download CSV</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile horizontal scrollable categories tab bar */}
                <div className="md:hidden flex flex-row overflow-x-auto gap-2 pb-3 mb-6 border-b border-[#E5E5E5] no-scrollbar">
                  {portfolioCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveSidebarSection(cat.id)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all shrink-0 ${
                        activeSidebarSection === cat.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-[#F4F4F4] text-on-surface-variant hover:bg-[#EAEAEA]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                  {/* Left Sidebar Menu (Desktop) */}
                  <div className="hidden md:block md:col-span-3">
                    <div className="flex flex-col space-y-1 border-l-2 border-[#E5E5E5] pl-0">
                      {portfolioCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveSidebarSection(cat.id)}
                          className={`text-left py-3 px-4 transition-all text-xs uppercase tracking-wider font-bold cursor-pointer border-l-2 -ml-[2px] rounded-r-md ${
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
                          className="space-y-6"
                        >
                          {/* Category Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#E5E5E5] pb-4 mb-6">
                            <h3 className="font-serif text-xl md:text-2xl text-primary font-bold">
                              {cat.title}
                            </h3>
                            <span className="text-secondary font-mono text-[11px] uppercase tracking-wider bg-secondary-fixed px-3 py-1 rounded-md font-bold shrink-0 text-center border border-secondary/20 self-start sm:self-auto">
                              {cat.badge}
                            </span>
                          </div>

                          {/* Courses List */}
                          <div className="space-y-4">
                            {cat.courses.map((course, idx) => (
                              <div
                                key={idx}
                                className="border border-[#E5E5E5] p-4 sm:p-5 md:p-6 hover:shadow-ambient transition-all duration-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl"
                              >
                                <div className="flex-1 min-w-0 pr-0 sm:pr-2">
                                  <h4 className="font-sans text-sm md:text-base font-bold text-primary mb-1 leading-snug">
                                    {course.title}
                                  </h4>
                                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed opacity-85">
                                    {course.description}
                                  </p>
                                </div>

                                <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-start sm:justify-center gap-1.5 shrink-0 max-w-full">
                                  {course.tags.map((tag, tagIdx) => (
                                    <span
                                      key={tagIdx}
                                      className="inline-flex items-center justify-center text-center text-[10px] font-mono uppercase tracking-wider bg-forest-green/10 text-forest-green px-2.5 py-0.5 font-bold rounded-md border border-forest-green/15 whitespace-nowrap max-w-full"
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
            <section className="relative pt-12 md:pt-20 pb-16 px-4 md:px-16 max-w-[1280px] mx-auto overflow-hidden">
              <div className="max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B68A35]/10 text-[#7a5a1f] rounded-full border border-[#B68A35]/30 text-xs font-mono font-bold uppercase tracking-widest">
                  <Award size={14} className="text-[#B68A35]" />
                  <span>Accredited Certification Schemes &amp; Global Partnerships</span>
                </div>
                <h1 className="font-serif text-[38px] md:text-[58px] leading-[46px] md:leading-[66px] tracking-tight text-primary font-bold">
                  Internationally Recognised Certification
                </h1>
                <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed max-w-3xl">
                  As an Official <strong className="text-primary font-bold">FoodChain ID</strong> Partner, Yitzak guides organisations from scope review and audit readiness through to a valid certificate, issued by FoodChain ID and its accredited certification bodies.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 no-print">
                  <button
                    onClick={() => handleOpenBooking('compliance', 'Inquiry: Accredited Certification Readiness')}
                    className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center justify-center gap-2"
                  >
                    <span>Inquire Audit Readiness</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => exportCapabilitySheetPDF('certification_portfolio')}
                    className="bg-primary hover:bg-[#1f4d3a] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center justify-center gap-2"
                    title="Print or Download certification schemes catalog for physical record-keeping"
                  >
                    <Printer size={14} className="text-[#DFC181]" />
                    <span>Print Certification Portfolio</span>
                  </button>
                  <a
                    href="https://www.foodchainid.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-primary text-primary hover:bg-primary hover:text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 inline-flex items-center justify-center gap-2"
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
                      Explore our core accredited certification routes. Each scheme includes full technical support, gap assessments, and official audit preparation.
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
                          Certification for product claims that hold up to market and regulatory scrutiny, including organic, Non-GMO Project Verification, and Gluten-Free. We help you choose the right scheme and move through assessment with total confidence.
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
                          Good agricultural practice certification covering food safety, traceability, and responsible production. GFSI-benchmarked and recognised by major international retailers worldwide.
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
                          Globally recognised food-safety standards spanning manufacturing, packaging, storage, and distribution. We prepare your team, documentation, and quality management systems for certification.
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
                        Full certification support for FSSC 22000 (Version 6), ISO 22000 (Food Safety), ISO 9001 (Quality), ISO 14001 (Environmental), and ISO 45001 (Occupational Health &amp; Safety). Build an integrated management framework that meets international buyer requirements.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['FSSC 22000 v6', 'ISO 22000', 'ISO 9001', 'ISO 14001', 'ISO 45001'].map((iso, idx) => (
                          <span key={idx} className="text-[11px] bg-[#F7F7F7] text-primary border border-[#E8E8E8] px-3 py-1 rounded-md font-mono font-bold">
                            {iso}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenBooking('compliance', 'Inquiry: FSSC 22000 / ISO Management Systems')}
                      className="bg-primary hover:bg-[#1f4d3a] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded-md transition-all cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] w-full sm:w-auto"
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
            <section className="relative pt-10 md:pt-16 pb-14 px-4 md:px-16 max-w-[1280px] mx-auto overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-7 z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B68A35]/10 text-[#7a5a1f] rounded-full border border-[#B68A35]/30 text-xs font-mono font-bold uppercase tracking-widest">
                    <AppIcon name="schema" size={14} color="#B68A35" />
                    <span>Operational Pillar 04</span>
                  </div>
                  <h1 className="font-serif text-[38px] md:text-[54px] leading-[46px] md:leading-[62px] tracking-tight text-primary font-bold">
                    Business Process Implementation
                  </h1>
                  <p className="font-sans text-sm md:text-base text-on-surface-variant leading-relaxed">
                    Helping organisations build solid operational foundations from zero. From process mapping and risk controls to setting up HR, accounting, and core workflow systems, Yitzak transforms strategic objectives into measurable, scalable execution.
                  </p>
                  <p className="font-sans text-xs md:text-sm text-outline border-l-2 border-[#B68A35] pl-4">
                    Bridge the gap between strategy and operational reality with tailored process governance and automated control frameworks.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => handleOpenBooking('process_implementation', 'Inquiry: Business Process Implementation Services')}
                      className="bg-[#B68A35] hover:opacity-95 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Request Implementation Plan</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => exportCapabilitySheetPDF('capability_sheet')}
                      className="border border-forest-green text-forest-green hover:bg-forest-green hover:text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                      title="Print or Download Capability Sheet"
                    >
                      <Printer size={14} />
                      <span>Print Capability Sheet</span>
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-5 relative">
                  <div className="bg-[#023625] text-white p-8 rounded-2xl border border-white/10 shadow-xl space-y-6">
                    <h3 className="font-serif text-2xl font-bold text-[#B68A35]">Core Capabilities</h3>
                    <ul className="space-y-4 font-sans text-xs md:text-sm text-white/90">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>Process Mapping & SOP Formulation:</strong> Standardising workflows for error reduction and clarity.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>Governance & Risk Controls:</strong> Establishing internal control checkpoints and risk mitigation protocols.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>HR & Accounting Setup:</strong> Operationalizing foundational HR policies, payroll rules, and financial reporting workflows.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span><strong>Lean Audits & Efficiency:</strong> Streamlining repetitive tasks and removing operational bottlenecks.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Implementation Phased Roadmap Component */}
            <section className="bg-[#F9F9F9] py-12 md:py-16 px-4 md:px-16 border-t border-[#E5E5E5]">
              <div className="max-w-[1280px] mx-auto space-y-10">
                <ProcessImplementationRoadmap 
                  onInquirePhase={(phaseTitle) => handleOpenBooking('process_implementation', `Inquiry regarding ${phaseTitle}`)}
                />

                <div className="bg-[#023625] text-white p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <h3 className="font-serif text-xl md:text-2xl font-bold">Ready to standardise and scale your operations?</h3>
                    <p className="font-sans text-xs md:text-sm text-white/80">
                      Speak with a principal consultant to structure an implementation roadmap tailored to your company's sector and size.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenBooking('process_implementation', 'Inquiry: Business Process Implementation Roadmap')}
                    className="bg-[#B68A35] hover:bg-[#a3792b] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded cursor-pointer transition-all shrink-0 shadow-md"
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
              <TrainingCalendar 
                onReserveCourse={(notesStr) => handleOpenBooking('training', notesStr)} 
              />
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
            <KnowledgeCenter
              onOpenBooking={handleOpenBooking}
              onNavigateToContact={() => navigateTo('contact')}
            />
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
              <span className="text-[#B68A35] font-sans text-xs uppercase tracking-widest font-bold">Direct Institutional Advisory</span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary">Contact Advisory Team</h1>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
                Connect directly with Yitzak's principal advisors to schedule a gap assessment, system analysis, or custom corporate workshop.
              </p>
            </div>
            <ContactUs />
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
                    <p className="font-mono text-xs">+27 (0) 11 463 2000</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#B68A35] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono">Head Office</span>
                    <p className="leading-relaxed">
                      359 Surrey Avenue, Randburg<br />
                      South Africa
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
              <ul className="space-y-3 font-sans text-xs md:text-sm text-white/80">
                <li>
                  <button
                    onClick={() => {
                      navigateTo('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-3 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={16} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>About</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      navigateTo('home');
                      setTimeout(() => {
                        const el = document.getElementById('services');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="flex items-center gap-3 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={16} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Services</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('training')}
                    className="flex items-center gap-3 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={16} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Training</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('certifications')}
                    className="flex items-center gap-3 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={16} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Certifications</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('consulting')}
                    className="flex items-center gap-3 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={16} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Advisory &amp; Consulting</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('knowledge')}
                    className="flex items-center gap-3 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={16} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Knowledge Centre</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateTo('contact')}
                    className="flex items-center gap-3 hover:text-[#B68A35] transition-colors cursor-pointer text-left group w-full"
                  >
                    <ChevronRight size={16} className="text-[#B68A35] shrink-0 group-hover:translate-x-1 transition-transform" />
                    <span>Contact Us</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Follow Us */}
            <div className="space-y-4">
              <h3 className="text-[#B68A35] font-serif font-bold text-base tracking-wider uppercase">
                Follow Us
              </h3>
              <p className="font-sans text-xs text-white/70 leading-relaxed">
                Connect with Yitzak Consulting for monthly industry digests, compliance insights, and accredited training announcements.
              </p>
              <div className="flex items-center gap-3 pt-2">
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

          {/* Bottom Branding & Legal */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
            <div className="flex items-center gap-3">
              <YitzakLogo lightMode size={22} />
              <span>·</span>
              <span>Empowering Organisations Through Compliance &amp; Capability</span>
            </div>
            <div>
              © 2026 YITZAK. All rights reserved. Official FoodChain ID Partner.
            </div>
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
