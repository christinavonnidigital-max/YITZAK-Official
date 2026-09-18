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
  | 'privacy'
  | 'not_found';

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
    title: 'Yitzak Consulting | Professional Training, Advisory & Certification Preparation',
    description: 'Developing competence and enabling compliance through Professional Training, Certification Preparation, Advisory, and Business Process Implementation across Southern Africa.'
  },
  training: {
    view: 'training',
    path: '/services/training',
    title: 'Professional Training & Auditor Courses | Yitzak Consulting',
    description: 'Accredited training across ISO 9001, ISO 14001, ISO 45001, HACCP, and FSSC 22000. In-house and public delivery across South Africa and Zimbabwe.'
  },
  certifications: {
    view: 'certifications',
    path: '/services/certifications',
    title: 'Certification Preparation & Scheme Advisory | Yitzak Consulting',
    description: 'Expert preparation and advisory for globally recognised certification schemes including BRCGS, FSSC 22000, and ISO standards.'
  },
  consulting: {
    view: 'consulting',
    path: '/services/consulting',
    title: 'Consulting & Management Advisory | Yitzak Consulting',
    description: 'Institutional advisory, gap assessments, internal audits, and integrated management system (QMS/FSMS) formulation.'
  },
  process_implementation: {
    view: 'process_implementation',
    path: '/services/business-process-implementation',
    title: 'Business Process Implementation & SOPs | Yitzak Consulting',
    description: 'End-to-end business process mapping, SOP development, governance controls, and workforce implementation roadmaps.'
  },
  knowledge: {
    view: 'knowledge',
    path: '/knowledge-centre',
    title: 'Knowledge Centre & Technical Library | Yitzak Consulting',
    description: 'Access free technical whitepapers, scheme transition guides, audit preparation checklists, and compliance publications.'
  },
  calendar: {
    view: 'calendar',
    path: '/training-calendar',
    title: '2026 Training Calendar & Schedules | Yitzak Consulting',
    description: 'Browse 2026 course schedules, live seat availability, and instructor-led training dates across Southern Africa.'
  },
  contact: {
    view: 'contact',
    path: '/contact',
    title: 'Contact Advisory Desk | Yitzak Consulting',
    description: 'Request course bookings, advisory consultations, or on-site gap assessments with Yitzak principal consultants.'
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
    title: 'Privacy Notice & POPIA Compliance | Yitzak Consulting',
    description: 'Official POPIA Privacy Notice for Yitzak Consulting (Pty) Ltd in compliance with South African Act No. 4 of 2013.'
  },
  not_found: {
    view: 'not_found',
    path: '/404',
    title: '404 - Page Not Found | Yitzak Consulting',
    description: 'The requested compliance standard, course syllabus, or advisory URL was not found on Yitzak Consulting.'
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
  'privacy',
  'not_found'
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

  // 1. Root / Home Path
  if (rawPath === '' || rawPath === '/') {
    // Hash-based quick matches (e.g. /#contact, /#training, /#privacy)
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

    // Fallback: check stored session view in case the preview host/iframe refreshed back to root '/'
    try {
      const storedView = sessionStorage.getItem('yitzak_current_view') as AppView | null;
      const storedElementId = sessionStorage.getItem('yitzak_element_id') || undefined;
      if (storedView && storedView !== 'not_found' && VALID_VIEWS.includes(storedView)) {
        return { view: storedView, elementId: storedElementId };
      }
    } catch {
      // ignore sessionStorage access limitations
    }

    return { view: 'home' };
  }

  // 2. Path-based exact matches
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
  if (rawPath === '/404' || rawPath === '/not-found') {
    return { view: 'not_found' };
  }

  // 3. Any other non-root path is an unknown URL -> 404 Not Found
  return { view: 'not_found' };
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

  // Helper to set or create a meta tag
  const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Update primary meta description
  if (route.description) {
    setMeta('meta[name="description"]', 'name', 'description', route.description);
  }

  // Update Canonical Link tag
  const canonicalUrl = `https://yitzak.co.za${route.path === '/' ? '' : route.path}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalUrl);

  // Update Social & Open Graph tags
  setMeta('meta[property="og:title"]', 'property', 'og:title', route.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', route.description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', route.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', route.description);
  setMeta('meta[name="twitter:url"]', 'name', 'twitter:url', canonicalUrl);

  // Indexing rules: Restrict authenticated/private portal and 404 error page from indexing; permit all public views
  if (view === 'portal' || view === 'not_found') {
    setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  } else {
    setMeta('meta[name="robots"]', 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
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
