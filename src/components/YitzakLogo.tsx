import React, { useState } from 'react';

interface YitzakLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number | string;
  color?: string; // e.g., 'currentColor', '#023625', or 'white'
  lightMode?: boolean; // If true, uses white on dark backgrounds
  src?: string; // Custom image URL if provided
}

/**
 * Official YITZAK Shield Emblem.
 * Renders the authentic high-resolution YITZAK brand emblem icon.
 */
export const YitzakShieldIcon: React.FC<{ size?: number | string; color?: string; className?: string }> = ({
  size = 36,
  color = 'currentColor',
  className = ''
}) => {
  const numSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 36;
  const isWhite = color === 'white' || color === '#FFFFFF' || color === '#fff';
  const isGold = color === '#B68A35' || color === '#DFC181' || color?.toLowerCase().includes('gold');

  const iconSrc = isGold ? '/YITZAK-icon-gold.png' : '/YITZAK-icon-green.png';

  return (
    <img
      src={iconSrc}
      alt="YITZAK Emblem"
      width={numSize}
      height={numSize}
      style={{ width: numSize, height: numSize }}
      className={`object-contain select-none shrink-0 ${isWhite ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
};

export const YitzakLogo: React.FC<YitzakLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 36,
  color,
  lightMode = false,
  src = '/YITZAK-logo-green.png'
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const brandColor = color || (lightMode ? '#FFFFFF' : '#023625');
  const textColor = lightMode ? 'text-white' : 'text-[#023625]';
  const numSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 36;

  // Render official uploaded PNG image logo when available
  if (src && !imgFailed) {
    return (
      <img
        src={src}
        alt="YITZAK Logo"
        loading="eager"
        fetchPriority="high"
        decoding="sync"
        style={{ height: numSize, width: 'auto' }}
        className={`object-contain ${lightMode ? 'brightness-0 invert' : ''} ${className}`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <YitzakShieldIcon size={numSize} color={brandColor} className="shrink-0 transition-colors" />
      {!iconOnly && (
        <span
          className={`font-sans font-black tracking-[0.12em] uppercase ${textColor}`}
          style={{
            fontSize: `${numSize * 0.68}px`,
            lineHeight: 1
          }}
        >
          YITZAK
        </span>
      )}
    </div>
  );
};

export default YitzakLogo;

