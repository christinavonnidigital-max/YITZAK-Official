/**
 * YITZAK Institutional Branding Assets & Vector Generators
 */

export interface BrandColorToken {
  name: string;
  role: string;
  hex: string;
  rgb: string;
  hsl: string;
  textColor: string;
}

export const BRAND_COLOR_TOKENS: BrandColorToken[] = [
  {
    name: 'Institutional Forest Green',
    role: 'Primary Authority & Identity',
    hex: '#023625',
    rgb: 'rgb(2, 54, 37)',
    hsl: 'hsl(160, 93%, 11%)',
    textColor: '#FFFFFF'
  },
  {
    name: 'Antique Gold',
    role: 'Advisory, Accreditations & Accents',
    hex: '#B68A35',
    rgb: 'rgb(182, 138, 53)',
    hsl: 'hsl(40, 55%, 46%)',
    textColor: '#FFFFFF'
  },
  {
    name: 'Deep Forest',
    role: 'Deep Canvas & Dark Hero Headers',
    hex: '#012117',
    rgb: 'rgb(1, 33, 23)',
    hsl: 'hsl(161, 94%, 7%)',
    textColor: '#FFFFFF'
  },
  {
    name: 'Warm Off-White Surface',
    role: 'Page Background & Editorial Surface',
    hex: '#F6F8F6',
    rgb: 'rgb(246, 248, 246)',
    hsl: 'hsl(120, 10%, 97%)',
    textColor: '#023625'
  },
  {
    name: 'Dark Slate Charcoal',
    role: 'High-Legibility Body Typography',
    hex: '#2D3142',
    rgb: 'rgb(45, 49, 66)',
    hsl: 'hsl(229, 19%, 22%)',
    textColor: '#FFFFFF'
  },
  {
    name: 'Border & Divider Mist',
    role: 'Subtle Structural Separators',
    hex: '#E5E9E6',
    rgb: 'rgb(229, 233, 230)',
    hsl: 'hsl(135, 8%, 91%)',
    textColor: '#023625'
  }
];

export function getShieldSvgString(color = '#023625'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <g fill="${color}">
    <!-- Outer Shield Border -->
    <path fill-rule="evenodd" clip-rule="evenodd" d="M 100 12 C 132 28, 164 36, 185 48 C 185 122, 158 190, 100 230 C 42 190, 15 122, 15 48 C 36 36, 68 28, 100 12 Z M 100 34 C 126 47, 151 54, 166 64 C 166 122, 144 176, 100 210 C 56 176, 34 122, 34 64 C 49 54, 74 47, 100 34 Z" />
    <!-- Center Checkmark -->
    <path d="M 56 116 L 86 150 L 150 72 L 136 61 L 86 130 L 67 107 Z" />
    <!-- Left Leaf Motif -->
    <path d="M 100 198 C 72 184, 48 170, 42 144 C 58 147, 80 168, 100 198 Z" />
    <!-- Right Leaf Motif -->
    <path d="M 100 198 C 128 184, 152 170, 158 144 C 142 147, 120 168, 100 198 Z" />
  </g>
</svg>`;
}

export function getHorizontalLogoSvgString(variant: 'primary' | 'inverted' | 'gold'): string {
  const isDark = variant === 'inverted';
  const isGold = variant === 'gold';
  const shieldColor = isGold ? '#B68A35' : (isDark ? '#FFFFFF' : '#023625');
  const textColor = isDark ? '#FFFFFF' : '#023625';
  const subtextColor = '#B68A35';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 110" width="460" height="110">
  <g transform="translate(10, 15) scale(0.333)">
    <g fill="${shieldColor}">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M 100 12 C 132 28, 164 36, 185 48 C 185 122, 158 190, 100 230 C 42 190, 15 122, 15 48 C 36 36, 68 28, 100 12 Z M 100 34 C 126 47, 151 54, 166 64 C 166 122, 144 176, 100 210 C 56 176, 34 122, 34 64 C 49 54, 74 47, 100 34 Z" />
      <path d="M 56 116 L 86 150 L 150 72 L 136 61 L 86 130 L 67 107 Z" />
      <path d="M 100 198 C 72 184, 48 170, 42 144 C 58 147, 80 168, 100 198 Z" />
      <path d="M 100 198 C 128 184, 152 170, 158 144 C 142 147, 120 168, 100 198 Z" />
    </g>
  </g>
  <text x="96" y="58" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="900" font-size="38" fill="${textColor}" letter-spacing="4">YITZAK</text>
  <text x="98" y="79" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="11" fill="${subtextColor}" letter-spacing="2.8">CONSULTING &amp; ADVISORY</text>
</svg>`;
}

export function downloadSvgFile(svgString: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadFileFromUrl(url: string, filename: string) {
  if (typeof window === 'undefined') return;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateEmailSignatureHtml(details: {
  name: string;
  title: string;
  phone?: string;
  email: string;
  website: string;
  includePhone?: boolean;
}): string {
  const cleanPhone = (details.phone || '').trim();
  const showPhone = Boolean(details.includePhone !== false && cleanPhone.length > 0);
  const phoneRow = showPhone
    ? `<div>Tel: <a href="tel:${cleanPhone.replace(/\\s+/g, '')}" style="color: #023625; text-decoration: none; font-weight: 500;">${cleanPhone}</a></div>`
    : '';

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 13px; color: #2D3142; line-height: 1.5;">
  <tr>
    <td style="padding-right: 18px; vertical-align: middle; border-right: 2px solid #B68A35;">
      <a href="https://${details.website}" target="_blank" rel="noopener">
        <img src="https://${details.website}/YITZAK-icon-green.png" alt="YITZAK" width="56" height="67" style="display: block; border: 0;" />
      </a>
    </td>
    <td style="padding-left: 18px; vertical-align: middle;">
      <div style="font-size: 16px; font-weight: bold; color: #023625; letter-spacing: 0.5px;">${details.name}</div>
      <div style="font-size: 12px; font-weight: 600; color: #B68A35; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">${details.title}</div>
      <div style="font-size: 13px; font-weight: bold; color: #023625; margin-top: 4px;">Yitzak Consulting</div>
      
      <div style="margin-top: 8px; font-size: 12px; color: #555555; line-height: 1.4;">
        ${phoneRow}<div>Email: <a href="mailto:${details.email}" style="color: #023625; text-decoration: none; font-weight: 500;">${details.email}</a></div>
        <div>Web: <a href="https://${details.website}" style="color: #B68A35; text-decoration: none; font-weight: 600;">${details.website}</a></div>
      </div>

      <div style="margin-top: 8px; font-size: 10px; color: #777777; border-top: 1px solid #E5E9E6; padding-top: 6px;">
        Food Safety Advisory &bull; Quality Management &bull; FoodChain ID Authorized Partner
      </div>
    </td>
  </tr>
</table>`;
}

/* =========================================================================
 * Official Emblem & Accreditation Seal Assets & Persistence
 * ========================================================================= */

export type SealVariant = 'seal' | 'gold_crest';

export const DEFAULT_OFFICIAL_EMBLEM = '/YITZAK-icon-green.png';
export const DEFAULT_GOLD_EMBLEM = '/YITZAK-icon-gold.png';
export const DEFAULT_ACCREDITATION_SEAL = '/YITZAK-accreditation-seal.png';

const STORAGE_KEY_CUSTOM_EMBLEM = 'yitzak_custom_official_emblem';
const STORAGE_KEY_CUSTOM_SEAL = 'yitzak_custom_accreditation_seal';
const STORAGE_KEY_CUSTOM_GOLD_CREST = 'yitzak_custom_gold_crest';
const STORAGE_KEY_SEAL_VARIANT = 'yitzak_seal_variant';

export function getStoredSealVariant(): SealVariant {
  if (typeof window === 'undefined') return 'seal';
  try {
    const val = localStorage.getItem(STORAGE_KEY_SEAL_VARIANT);
    return val === 'gold_crest' ? 'gold_crest' : 'seal';
  } catch {
    return 'seal';
  }
}

export function saveSealVariant(variant: SealVariant): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SEAL_VARIANT, variant);
    const activeUrl = variant === 'gold_crest' ? getStoredGoldCrest() : getStoredMedallionSeal();
    window.dispatchEvent(new CustomEvent('yitzak-seal-updated', { detail: { sealUrl: activeUrl, variant } }));
  } catch (e) {
    console.error('Failed to save seal variant:', e);
  }
}

export function getStoredMedallionSeal(): string {
  if (typeof window === 'undefined') return DEFAULT_ACCREDITATION_SEAL;
  try {
    const val = localStorage.getItem(STORAGE_KEY_CUSTOM_SEAL);
    return val && val.trim().length > 0 ? val : DEFAULT_ACCREDITATION_SEAL;
  } catch {
    return DEFAULT_ACCREDITATION_SEAL;
  }
}

export function getStoredGoldCrest(): string {
  if (typeof window === 'undefined') return DEFAULT_GOLD_EMBLEM;
  try {
    const val = localStorage.getItem(STORAGE_KEY_CUSTOM_GOLD_CREST);
    return val && val.trim().length > 0 ? val : DEFAULT_GOLD_EMBLEM;
  } catch {
    return DEFAULT_GOLD_EMBLEM;
  }
}

export function getStoredCustomEmblem(): string {
  if (typeof window === 'undefined') return DEFAULT_OFFICIAL_EMBLEM;
  try {
    const val = localStorage.getItem(STORAGE_KEY_CUSTOM_EMBLEM);
    return val && val.trim().length > 0 ? val : DEFAULT_OFFICIAL_EMBLEM;
  } catch {
    return DEFAULT_OFFICIAL_EMBLEM;
  }
}

export function saveCustomEmblem(dataUrl: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_EMBLEM, dataUrl);
    window.dispatchEvent(new CustomEvent('yitzak-emblem-updated', { detail: { emblemUrl: dataUrl } }));
    return true;
  } catch (e) {
    console.error('Failed to save custom emblem:', e);
    return false;
  }
}

export function resetCustomEmblem(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_EMBLEM);
    window.dispatchEvent(new CustomEvent('yitzak-emblem-updated', { detail: { emblemUrl: DEFAULT_OFFICIAL_EMBLEM } }));
  } catch (e) {
    console.error('Failed to reset custom emblem:', e);
  }
}

export function getStoredCustomSeal(): string {
  if (typeof window === 'undefined') return DEFAULT_ACCREDITATION_SEAL;
  try {
    const variant = getStoredSealVariant();
    if (variant === 'gold_crest') {
      return getStoredGoldCrest();
    }
    return getStoredMedallionSeal();
  } catch {
    return DEFAULT_ACCREDITATION_SEAL;
  }
}

export function saveCustomSeal(dataUrl: string, variant?: SealVariant): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const effectiveVariant = variant || getStoredSealVariant();
    if (effectiveVariant === 'gold_crest') {
      localStorage.setItem(STORAGE_KEY_CUSTOM_GOLD_CREST, dataUrl);
      localStorage.setItem(STORAGE_KEY_SEAL_VARIANT, 'gold_crest');
    } else {
      localStorage.setItem(STORAGE_KEY_CUSTOM_SEAL, dataUrl);
      localStorage.setItem(STORAGE_KEY_SEAL_VARIANT, 'seal');
    }
    window.dispatchEvent(new CustomEvent('yitzak-seal-updated', { detail: { sealUrl: dataUrl, variant: effectiveVariant } }));
    return true;
  } catch (e) {
    console.error('Failed to save custom seal:', e);
    return false;
  }
}

export function resetCustomSeal(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_SEAL);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_GOLD_CREST);
    localStorage.removeItem(STORAGE_KEY_SEAL_VARIANT);
    window.dispatchEvent(new CustomEvent('yitzak-seal-updated', { detail: { sealUrl: DEFAULT_ACCREDITATION_SEAL, variant: 'seal' } }));
  } catch (e) {
    console.error('Failed to reset custom seal:', e);
  }
}

export function getAccreditationSealSvgString(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDF2C7"/>
      <stop offset="25%" stop-color="#E5C158"/>
      <stop offset="50%" stop-color="#B68A35"/>
      <stop offset="75%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#8C661D"/>
    </linearGradient>
    <linearGradient id="shieldGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3CE"/>
      <stop offset="50%" stop-color="#C59B45"/>
      <stop offset="100%" stop-color="#734F0C"/>
    </linearGradient>
    <radialGradient id="sealBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#034d35"/>
      <stop offset="85%" stop-color="#023625"/>
      <stop offset="100%" stop-color="#012117"/>
    </radialGradient>
    <path id="topTextArc" d="M 80 250 A 170 170 0 0 1 420 250" fill="none" />
    <path id="bottomTextArc" d="M 420 250 A 170 170 0 0 1 80 250" fill="none" />
    <filter id="sealShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <g filter="url(#sealShadow)">
    <circle cx="250" cy="250" r="236" fill="#B68A35" stroke="#FDF2C7" stroke-width="2"/>
    <circle cx="250" cy="250" r="231" fill="none" stroke="#66460B" stroke-width="1.5" stroke-dasharray="3, 3"/>
    <circle cx="250" cy="250" r="225" fill="url(#sealBg)" stroke="url(#goldGradient)" stroke-width="5"/>
    <circle cx="250" cy="250" r="195" fill="none" stroke="url(#goldGradient)" stroke-width="1.5" stroke-dasharray="4, 2"/>
  </g>

  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="13" fill="url(#goldGradient)" letter-spacing="3.5">
    <textPath href="#topTextArc" startOffset="50%" text-anchor="middle">
      &#9733; YITZAK EXECUTIVE ADVISORY &#9733;
    </textPath>
  </text>

  <text font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="11.5" fill="url(#goldGradient)" letter-spacing="3">
    <textPath href="#bottomTextArc" startOffset="50%" text-anchor="middle">
      &#8226; ACCREDITATION &amp; GOVERNANCE SEAL &#8226;
    </textPath>
  </text>

  <circle cx="250" cy="250" r="144" fill="#012117" stroke="url(#goldGradient)" stroke-width="3.5"/>
  <circle cx="250" cy="250" r="138" fill="none" stroke="#B68A35" stroke-width="1" opacity="0.6"/>

  <g stroke="url(#goldGradient)" fill="url(#goldGradient)" stroke-width="1.5">
    <path d="M 160 270 C 152 230 162 195 185 165" fill="none" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 165 255 C 150 252 145 242 152 238 C 160 236 166 244 165 255 Z"/>
    <path d="M 160 235 C 145 230 142 218 150 215 C 158 214 163 222 160 235 Z"/>
    <path d="M 162 212 C 148 205 147 192 156 190 C 164 191 167 200 162 212 Z"/>
    <path d="M 170 190 C 158 180 160 168 169 168 C 176 170 176 180 170 190 Z"/>
    <path d="M 183 170 C 175 160 180 148 189 150 C 195 154 191 164 183 170 Z"/>
  </g>

  <g stroke="url(#goldGradient)" fill="url(#goldGradient)" stroke-width="1.5">
    <path d="M 340 270 C 348 230 338 195 315 165" fill="none" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 335 255 C 350 252 355 242 348 238 C 340 236 334 244 335 255 Z"/>
    <path d="M 340 235 C 355 230 358 218 350 215 C 342 214 337 222 340 235 Z"/>
    <path d="M 338 212 C 352 205 353 192 344 190 C 336 191 333 200 338 212 Z"/>
    <path d="M 330 190 C 342 180 340 168 331 168 C 324 170 324 180 330 190 Z"/>
    <path d="M 317 170 C 325 160 320 148 311 150 C 305 154 309 164 317 170 Z"/>
  </g>

  <g transform="translate(200, 168) scale(0.5)">
    <g fill="url(#shieldGold)">
      <path fill-rule="evenodd" clip-rule="evenodd" d="
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
      "/>
      <path d="M 60 114 L 88 146 L 146 76 L 134 66 L 88 128 L 70 106 Z"/>
      <path d="M 100 196 C 74 182, 52 168, 46 142 C 62 145, 82 166, 100 196 Z"/>
      <path d="M 100 196 C 126 182, 148 168, 154 142 C 138 145, 118 166, 100 196 Z"/>
    </g>
  </g>

  <g filter="url(#sealShadow)">
    <path d="M 166 292 L 250 285 L 334 292 L 324 316 L 250 311 L 176 316 Z" fill="url(#goldGradient)" stroke="#66460B" stroke-width="1"/>
    <text x="250" y="305" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="11" fill="#012117" text-anchor="middle" letter-spacing="2">
      VERIFIED &#8226; 2026
    </text>
  </g>

  <g fill="url(#goldGradient)">
    <polygon points="250,330 253,337 260,337 254,341 256,348 250,344 244,348 246,341 240,337 247,337" />
    <polygon points="228,333 230,339 236,339 231,343 233,349 228,345 223,349 225,343 220,339 226,339" />
    <polygon points="272,333 274,339 280,339 275,343 277,349 272,345 267,349 269,343 264,339 270,339" />
  </g>
</svg>`;
}

