export type AppView = 
  | 'home' 
  | 'consulting' 
  | 'training' 
  | 'certifications' 
  | 'calendar' 
  | 'contact' 
  | 'process_implementation' 
  | 'knowledge' 
  | 'portal'
  | 'privacy';

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
    title: 'Professional Training & Courses | Yitzak Consulting',
    description: 'Explore food safety, ISO management, and auditor training programs.'
  },
  certifications: {
    view: 'certifications',
    path: '/services/certifications',
    title: 'Certification Preparation | Yitzak Consulting',
    description: 'Through our partnership with FoodChain ID, we help organisations prepare for suitable certification routes across food safety, quality, and agricultural standards.'
  },
  consulting: {
    view: 'consulting',
    path: '/services/consulting',
    title: 'Consulting & Advisory Services | Yitzak Consulting',
    description: 'Tailored compliance advisory, gap assessments, internal audits, and management system consulting.'
  },
  process_implementation: {
    view: 'process_implementation',
    path: '/services/business-process-implementation',
    title: 'Business Process Implementation | Yitzak Consulting',
    description: 'Structured roadmap for business process implementation, management system formulation, and audit readiness.'
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
  },
  privacy: {
    view: 'privacy',
    path: '/privacy-notice',
    title: 'Privacy Notice | Yitzak Consulting',
    description: 'POPIA Privacy Notice for Yitzak Consulting (Pty) Ltd in compliance with Act No. 4 of 2013.'
  }
};

export const VALID_VIEWS: AppView[] = [
  'home',
  'consulting',
  'training',
  'certifications',
  'calendar',
  'contact',
  'process_implementation',
  'knowledge',
  'portal',
  'privacy'
];

/**
 * Resolves current window path and hash to an AppView
 */
export function getViewFromLocation(): { view: AppView; elementId?: string } {
  if (typeof window === 'undefined') {
    return { view: 'home' };
  }

  const rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.replace(/^#/, '').toLowerCase();

  // 1. Path-based exact matches
  if (rawPath === '/privacy-policy' || rawPath === '/privacy' || rawPath === '/popia' || rawPath === '/popia-notice' || rawPath === '/legal/privacy' || rawPath === '/privacy-notice') {
    return { view: 'privacy' };
  }
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
  if (rawPath === '/process-implementation' || rawPath === '/process' || rawPath === '/implementation' || rawPath === '/systems' || rawPath === '/services/business-process-implementation' || rawPath === '/services/process-implementation') {
    return { view: 'process_implementation' };
  }
  if (rawPath === '/training-calendar' || rawPath === '/calendar' || rawPath === '/schedule') {
    return { view: 'calendar' };
  }
  if (rawPath === '/client-portal' || rawPath === '/portal' || rawPath === '/login' || rawPath === '/client-area') {
    return { view: 'portal' };
  }

  // 2. Hash-based quick matches (e.g. /#contact, /#training, /#privacy)
  if (hash === 'contact' || hash === 'advisory-desk') return { view: 'contact', elementId: 'contact' };
  if (hash === 'training') return { view: 'training' };
  if (hash === 'certifications' || hash === 'schemes') return { view: 'certifications' };
  if (hash === 'consulting' || hash === 'advisory') return { view: 'consulting' };
  if (hash === 'process' || hash === 'implementation' || hash === 'process_implementation' || hash === 'business-process-implementation') return { view: 'process_implementation' };
  if (hash === 'knowledge' || hash === 'whitepapers') return { view: 'knowledge' };
  if (hash === 'calendar' || hash === 'schedule') return { view: 'calendar' };
  if (hash === 'portal' || hash === 'login') return { view: 'portal' };
  if (hash === 'privacy' || hash === 'privacy-policy' || hash === 'popia' || hash === 'privacy-notice') return { view: 'privacy' };
  if (hash === 'why-us' || hash === 'about' || hash === 'about-section') return { view: 'home', elementId: 'why-us' };

  // 3. Fallback: check stored session view in case the preview host/iframe refreshed back to root '/'
  try {
    const storedView = sessionStorage.getItem('yitzak_current_view') as AppView | null;
    const storedElementId = sessionStorage.getItem('yitzak_element_id') || undefined;
    if (storedView && VALID_VIEWS.includes(storedView)) {
      return { view: storedView, elementId: storedElementId };
    }
  } catch {
    // ignore sessionStorage access limitations
  }

  return { view: 'home' };
}

/**
 * Updates URL and Document Title to match current view
 */
export function updateBrowserUrl(view: AppView, elementId?: string, replace = false) {
  if (typeof window === 'undefined') return;

  // Persist current active view in sessionStorage
  try {
    sessionStorage.setItem('yitzak_current_view', view);
    if (elementId) {
      sessionStorage.setItem('yitzak_element_id', elementId);
    } else {
      sessionStorage.removeItem('yitzak_element_id');
    }
  } catch {
    // ignore sessionStorage access limitations
  }

  const route = ROUTES[view] || ROUTES.home;
  let targetUrl = route.path;

  if (elementId && elementId !== 'top') {
    targetUrl = `${route.path === '/' ? '' : route.path}#${elementId}`;
    if (targetUrl === '') targetUrl = '/';
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
  try {
    const currentPathWithHash = window.location.pathname + window.location.hash;
    if (currentPathWithHash !== targetUrl) {
      if (replace) {
        window.history.replaceState({ view, elementId }, route.title, targetUrl);
      } else {
        window.history.pushState({ view, elementId }, route.title, targetUrl);
      }
    }
  } catch {
    // ignore history state issues in strict iframe sandboxes
  }
}
