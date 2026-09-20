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
  phone: string;
  email: string;
  website: string;
}): string {
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
        <div>Tel: <a href="tel:${details.phone.replace(/\\s+/g, '')}" style="color: #023625; text-decoration: none; font-weight: 500;">${details.phone}</a></div>
        <div>Email: <a href="mailto:${details.email}" style="color: #023625; text-decoration: none; font-weight: 500;">${details.email}</a></div>
        <div>Web: <a href="https://${details.website}" style="color: #B68A35; text-decoration: none; font-weight: 600;">${details.website}</a></div>
      </div>

      <div style="margin-top: 8px; font-size: 10px; color: #777777; border-top: 1px solid #E5E9E6; padding-top: 6px;">
        Food Safety Advisory &bull; Quality Management &bull; FoodChain ID Authorized Partner
      </div>
    </td>
  </tr>
</table>`;
}
