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
 * Official YITZAK Shield Emblem Vector.
 * Uses exact mathematical path coordinates matching official YITZAK brand guidelines.
 */
export const YitzakShieldIcon: React.FC<{ size?: number | string; color?: string; className?: string }> = ({
  size = 36,
  color = 'currentColor',
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill={color}>
        {/* Outer Shield Border */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="
            M 100 12
            C 132 28, 164 36, 185 48
            C 185 122, 158 190, 100 230
            C 42 190, 15 122, 15 48
            C 36 36, 68 28, 100 12 Z

            M 100 34
            C 126 47, 151 54, 166 64
            C 166 122, 144 176, 100 210
            C 56 176, 34 122, 34 64
            C 49 54, 74 47, 100 34 Z
          "
        />

        {/* Center Checkmark */}
        <path d="M 56 116 L 86 150 L 150 72 L 136 61 L 86 130 L 67 107 Z" />

        {/* Left Leaf Motif */}
        <path d="M 100 198 C 72 184, 48 170, 42 144 C 58 147, 80 168, 100 198 Z" />

        {/* Right Leaf Motif */}
        <path d="M 100 198 C 128 184, 152 170, 158 144 C 142 147, 120 168, 100 198 Z" />
      </g>
    </svg>
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

