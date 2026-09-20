/**
 * YITZAK Content Management System (CMS) State Manager
 * Handles real-time persistence and updates for site-wide announcements, 
 * contact details, custom FAQs, and administrative content overrides.
 */

export interface CMSBannerConfig {
  enabled: boolean;
  text: string;
  badge: string;
  theme: 'gold' | 'emerald' | 'charcoal';
  linkTarget?: string;
  linkText?: string;
}

export interface CMSContactConfig {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  registrationNumber: string;
}

export interface CMSFAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  iconName?: string;
  updatedAt: string;
}

export interface CMSState {
  banner: CMSBannerConfig;
  contact: CMSContactConfig;
  customFaqs: CMSFAQItem[];
  siteTagline: string;
  lastUpdated: string;
}

const CMS_STORAGE_KEY = 'yitzak_cms_content_v1';

export const DEFAULT_CMS_STATE: CMSState = {
  banner: {
    enabled: true,
    badge: 'NOTICE',
    text: 'Official FoodChain ID Partner · FSSC 22000, BRCGS & ISO Lead Auditor Advisory Desk in Randburg, Johannesburg.',
    theme: 'emerald',
    linkTarget: 'training',
    linkText: 'View Calendar'
  },
  contact: {
    phone: '+27 60 763 6710',
    email: 'cgumpo@yitzak.co.za',
    address: 'Randburg, Johannesburg, South Africa',
    businessHours: 'Mon - Fri: 08:00 - 17:00 SAST',
    registrationNumber: 'Reg: 2024/000000/07'
  },
  customFaqs: [],
  siteTagline: 'Institutional Advisory, Training & GFSI Compliance Architecture',
  lastUpdated: new Date().toISOString()
};

export function getCMSState(): CMSState {
  if (typeof window === 'undefined') return DEFAULT_CMS_STATE;
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return DEFAULT_CMS_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CMS_STATE,
      ...parsed,
      banner: { ...DEFAULT_CMS_STATE.banner, ...(parsed.banner || {}) },
      contact: { ...DEFAULT_CMS_STATE.contact, ...(parsed.contact || {}) },
      customFaqs: Array.isArray(parsed.customFaqs) ? parsed.customFaqs : []
    };
  } catch (err) {
    console.warn('Could not read CMS state from localStorage:', err);
    return DEFAULT_CMS_STATE;
  }
}

export function saveCMSState(state: Partial<CMSState>): CMSState {
  const current = getCMSState();
  const updated: CMSState = {
    ...current,
    ...state,
    banner: state.banner ? { ...current.banner, ...state.banner } : current.banner,
    contact: state.contact ? { ...current.contact, ...state.contact } : current.contact,
    customFaqs: state.customFaqs !== undefined ? state.customFaqs : current.customFaqs,
    lastUpdated: new Date().toISOString()
  };

  try {
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time reactive sync across components
    window.dispatchEvent(new CustomEvent('yitzak-cms-updated', { detail: updated }));
  } catch (err) {
    console.error('Failed to write CMS state to localStorage:', err);
  }

  return updated;
}
