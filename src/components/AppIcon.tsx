import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface AppIconProps {
  /** Google Material Symbol name (e.g. 'verified', 'school', 'psychology', 'settings_suggest') OR Lucide icon name */
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
  /** Fill toggle for Material Symbols (0 = outline, 1 = filled) */
  fill?: boolean;
  /** Weight for Material Symbols (100 to 700, default 400) */
  weight?: number;
}

/**
 * High-craft icon component supporting Google Material Symbols (size 24, #1f1f1f default)
 * and Lucide vector icons with crisp rendering and optional polished badge wrappers.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  icon: IconComponent,
  size = 24,
  color,
  className = '',
  variant = 'none',
  fill = false,
  weight = 400,
}) => {
  // If an explicit Lucide component is passed
  let renderedIcon: React.ReactNode = null;

  if (IconComponent) {
    renderedIcon = (
      <IconComponent
        size={size}
        strokeWidth={1.8}
        className={`shrink-0 transition-transform duration-200 ${className}`}
        style={color && !color.startsWith('text-') ? { color } : undefined}
      />
    );
  } else if (name) {
    // Check if name is a Material Symbol name or a Lucide icon name
    const lucideName = name.charAt(0).toUpperCase() + name.slice(1);
    const PotentialLucide = (LucideIcons as any)[lucideName] || (LucideIcons as any)[name];

    if (PotentialLucide && !name.includes('_')) {
      renderedIcon = (
        <PotentialLucide
          size={size}
          strokeWidth={1.8}
          className={`shrink-0 transition-transform duration-200 ${className}`}
          style={color && !color.startsWith('text-') ? { color } : undefined}
        />
      );
    } else {
      // Render as Google Material Symbol
      const style: React.CSSProperties = {
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        ...(color && !color.startsWith('text-') ? { color } : {}),
      };

      renderedIcon = (
        <span
          className={`material-symbols-outlined select-none inline-flex items-center justify-center shrink-0 transition-all duration-200 ${className}`}
          style={style}
          aria-hidden="true"
        >
          {name}
        </span>
      );
    }
  }

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
