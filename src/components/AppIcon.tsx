import React from 'react';
import {
  LayoutGrid,
  Headphones,
  Workflow,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  Calculator,
  Calendar,
  Users,
  ShieldAlert,
  Factory,
  Sliders,
  Brain,
  RefreshCw,
  TrendingUp,
  GitFork,
  MapPin,
  Mail,
  HelpCircle,
  FileText,
  Scale,
  Leaf,
  HeartPulse,
  Sprout,
  Settings2,
  ArrowRight,
  Search,
  Check,
  X,
  Menu,
  Sparkles,
  Shield,
  Award,
  BookOpen,
  ClipboardCheck,
  Layers,
  LucideIcon,
  Split,
  Milestone
} from 'lucide-react';

export interface AppIconProps {
  /** Icon name (e.g. 'grid_view', 'support_agent', 'schema', 'school', 'verified', etc.) */
  name?: string;
  /** Lucide Icon component if passing a component directly */
  icon?: React.ElementType;
  /** Icon size in pixels. Defaults to 24 */
  size?: number;
  /** Color class or hex code. Defaults to #1f1f1f (or currentColor) */
  color?: string;
  /** Tailwind class names for the icon or container */
  className?: string;
  /** Container style variant */
  variant?: 'none' | 'badge' | 'tile' | 'filled' | 'gold' | 'forest';
  /** Fill toggle for icon styling */
  fill?: boolean;
  /** Weight */
  weight?: number;
}

// Complete lookup table mapping Material & custom names directly to crisp Lucide SVG icons
const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation & Actions
  grid_view: LayoutGrid,
  grid: LayoutGrid,
  menu: Menu,
  close: X,
  search: Search,
  arrow_forward: ArrowRight,
  check: Check,
  download: FileText,

  // Services & Architecture
  support_agent: Headphones,
  schema: Workflow,
  school: GraduationCap,
  verified: CheckCircle2,
  verified_user: ShieldCheck,
  shield_with_heart: ShieldCheck,
  calculate: Calculator,
  calendar_month: Calendar,
  calendar_today: Calendar,
  calendar: Calendar,
  groups: Users,
  users: Users,

  // Operations & Roadmap
  precision_manufacturing: Factory,
  factory: Factory,
  tune: Sliders,
  psychology: Brain,
  published_with_changes: RefreshCw,
  timeline: TrendingUp,
  trending_up: TrendingUp,
  route: Milestone,
  alt_route: Split,
  split: Split,
  workflow: Workflow,
  layers: Layers,

  // Contact & Meta
  location_on: MapPin,
  map_pin: MapPin,
  mail: Mail,
  email: Mail,
  help: HelpCircle,
  info: HelpCircle,
  description: FileText,
  document: FileText,

  // Compliance & Standards
  gavel: Scale,
  eco: Leaf,
  leaf: Leaf,
  health_and_safety: HeartPulse,
  agriculture: Sprout,
  sprout: Sprout,
  settings_suggest: Settings2,
  settings: Settings2,
  award: Award,
  book: BookOpen,
  clipboard: ClipboardCheck,
  shield: Shield,
  sparkles: Sparkles,
};

/**
 * High-craft SVG icon component using Lucide icons.
 * Never outputs text ligatures, eliminating FOUC (flash of unstyled content) or raw text strings.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  icon: IconComponent,
  size = 24,
  color,
  className = '',
  variant = 'none',
}) => {
  let ResolvedIcon: React.ElementType = Sparkles;

  if (IconComponent) {
    ResolvedIcon = IconComponent;
  } else if (name) {
    const normalized = name.toLowerCase().trim();
    if (ICON_MAP[normalized]) {
      ResolvedIcon = ICON_MAP[normalized];
    } else {
      // Fallback to shield icon
      ResolvedIcon = Shield;
    }
  }

  const renderedIcon = (
    <ResolvedIcon
      size={size}
      strokeWidth={1.8}
      className={`shrink-0 transition-transform duration-200 ${className}`}
      style={color && !color.startsWith('text-') ? { color } : undefined}
    />
  );

  if (variant === 'none') {
    return <>{renderedIcon}</>;
  }

  // Pre-styled container badge variants
  const containerClasses: Record<string, string> = {
    badge: 'w-11 h-11 rounded-xl bg-stone-100/90 border border-stone-200/80 text-[#1f1f1f] flex items-center justify-center shadow-2xs hover:shadow-xs hover:border-[#B68A35]/40 transition-all duration-200',
    tile: 'w-12 h-12 rounded-2xl bg-white border border-border text-[#1f1f1f] flex items-center justify-center shadow-xs hover:shadow-md hover:border-[#B68A35] transition-all duration-200',
    filled: 'w-11 h-11 rounded-xl bg-[#1f1f1f] text-white flex items-center justify-center shadow-xs transition-all duration-200',
    gold: 'w-11 h-11 rounded-xl bg-[#B68A35]/10 border border-[#B68A35]/30 text-[#7d5800] flex items-center justify-center shadow-2xs hover:bg-[#B68A35]/15 transition-all duration-200',
    forest: 'w-12 h-12 rounded-xl bg-[#023625] text-[#B68A35] border border-[#023625] flex items-center justify-center shadow-xs transition-all duration-200',
  };

  return (
    <div className={containerClasses[variant] || containerClasses.badge}>
      {renderedIcon}
    </div>
  );
};

export default AppIcon;
