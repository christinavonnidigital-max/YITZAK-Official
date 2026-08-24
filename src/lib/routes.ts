export type AppView = 
  | 'home' 
  | 'consulting' 
  | 'training' 
  | 'certifications' 
  | 'calendar' 
  | 'contact' 
  | 'process_implementation' 
  | 'knowledge' 
  | 'portal';

export interface RouteMeta {
  view: AppView;
  path: string;
  title: string;
  description: string;
}

export const ROUTES: Record<AppView, RouteMeta> = {
  home: {
    view: 'home',
    path: '/',
    title: 'Yitzak Consulting | Developing Competence. Enabling Compliance.',
    description: 'Empowering organisations through Accredited Training, Global Certification, Advisory, and Process Implementation.'
  },
  training: {
    view: 'training',
    path: '/services/training',
    title: 'Accredited Training & Courses | Yitzak Consulting',
    description: 'Explore accredited food safety, ISO management, and lead auditor training programs.'
  },
  certifications: {
    view: 'certifications',
    path: '/services/certifications',
    title: 'Global Certification & Accredited Schemes | Yitzak Consulting',
    description: 'ISO 9001, ISO 14001, ISO 22000, FSSC 22000, BRCGS, and HACCP accredited certification pathways.'
  },
  consulting: {
    view: 'consulting',
    path: '/services/consulting',
    title: 'Consulting & Advisory Services | Yitzak Consulting',
    description: 'Tailored compliance advisory, gap assessments, internal audits, and management system consulting.'
  },
  process_implementation: {
    view: 'process_implementation',
    path: '/services/process-implementation',
    title: 'Business Process Implementation | Yitzak Consulting',
    description: 'Structured 5-phase roadmap from gap discovery to audit readiness and continuous improvement.'
  },
  knowledge: {
    view: 'knowledge',
    path: '/knowledge-centre',
    title: 'Knowledge Centre & Technical Library | Yitzak Consulting',
    description: 'Institutional whitepapers, scheme transition guides, regulatory checklists, and compliance publications.'
  },
  calendar: {
    view: 'calendar',
    path: '/training-calendar',
    title: '2026 Training Calendar & Schedules | Yitzak Consulting',
    description: 'View scheduled public and corporate training sessions for 2026 with real-time seat availability.'
  },
  contact: {
    view: 'contact',
    path: '/contact',
    title: 'Contact Advisory Desk | Yitzak Consulting',
    description: 'Connect directly with Yitzak principal advisors for gap assessments, training quotes, or advisory proposals.'
  },
  portal: {
    view: 'portal',
    path: '/client-portal',
    title: 'Institutional Client Portal | Yitzak Consulting',
    description: 'Authorized corporate portal access for compliance records, bookings, and audit documentation.'
  }
};

/**
 * Resolves current window path and hash to an AppView
 */
export function getViewFromLocation(): { view: AppView; elementId?: string } {
  if (typeof window === 'undefined') {
    return { view: 'home' };
  }

  const rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.replace(/^#/, '').toLowerCase();

  // Hash-based quick matches (e.g. /#contact, /#about, /#training)
  if (hash === 'contact' || hash === 'advisory-desk') return { view: 'contact', elementId: 'contact' };
  if (hash === 'about' || hash === 'about-section') return { view: 'home', elementId: 'about-section' };
  if (hash === 'training') return { view: 'training' };
  if (hash === 'certifications' || hash === 'schemes') return { view: 'certifications' };
  if (hash === 'consulting' || hash === 'advisory') return { view: 'consulting' };
  if (hash === 'process' || hash === 'implementation') return { view: 'process_implementation' };
  if (hash === 'knowledge' || hash === 'whitepapers') return { view: 'knowledge' };
  if (hash === 'calendar' || hash === 'schedule') return { view: 'calendar' };
  if (hash === 'portal' || hash === 'login') return { view: 'contact' };

  // Path-based matches
  if (rawPath === '/about') return { view: 'home', elementId: 'about-section' };
  if (rawPath === '/knowledge-centre' || rawPath === '/knowledge' || rawPath === '/knowledge-center' || rawPath === '/whitepapers' || rawPath === '/publications' || rawPath === '/resources') {
    return { view: 'knowledge' };
  }
  if (rawPath === '/contact' || rawPath === '/contact-us' || rawPath === '/advisory-desk' || rawPath === '/inquiry') {
    return { view: 'contact' };
  }
  if (rawPath === '/training' || rawPath === '/training-courses' || rawPath === '/courses' || rawPath === '/services/training' || rawPath === '/academy') {
    return { view: 'training' };
  }
  if (rawPath === '/certifications' || rawPath === '/certification' || rawPath === '/accredited-schemes' || rawPath === '/schemes' || rawPath === '/services/certifications') {
    return { view: 'certifications' };
  }
  if (rawPath === '/consulting' || rawPath === '/advisory' || rawPath === '/consulting-services' || rawPath === '/services/consulting' || rawPath === '/audits') {
    return { view: 'consulting' };
  }
  if (rawPath === '/process-implementation' || rawPath === '/process' || rawPath === '/implementation' || rawPath === '/systems' || rawPath === '/services/process-implementation') {
    return { view: 'process_implementation' };
  }
  if (rawPath === '/training-calendar' || rawPath === '/calendar' || rawPath === '/schedule') {
    return { view: 'calendar' };
  }
  if (rawPath === '/client-portal' || rawPath === '/portal' || rawPath === '/login' || rawPath === '/client-area') {
    return { view: 'contact' };
  }

  return { view: 'home' };
}

/**
 * Updates URL and Document Title to match current view
 */
export function updateBrowserUrl(view: AppView, elementId?: string, replace = false) {
  if (typeof window === 'undefined') return;

  const route = ROUTES[view] || ROUTES.home;
  let targetUrl = route.path;

  if (elementId && elementId !== 'top') {
    if (view === 'home' && elementId === 'about-section') {
      targetUrl = '/about';
    } else {
      targetUrl = `${route.path}#${elementId}`;
    }
  }

  // Update document title
  if (route.title) {
    document.title = route.title;
  }

  // Update meta description if present
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && route.description) {
    metaDesc.setAttribute('content', route.description);
  }

  // Only push if different from current path+hash
  const currentPathWithHash = window.location.pathname + window.location.hash;
  if (currentPathWithHash !== targetUrl) {
    if (replace) {
      window.history.replaceState({ view, elementId }, route.title, targetUrl);
    } else {
      window.history.pushState({ view, elementId }, route.title, targetUrl);
    }
  }
}
