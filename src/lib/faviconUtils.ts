/**
 * Favicon Management and Dynamic Icon Generation Utilities
 * Supports client-side image resizing, live browser tab updating,
 * and downloading formatted icon assets.
 */

export const FAVICON_STORAGE_KEY = 'yitzak_custom_favicon';
export const DEFAULT_FAVICON = '/favicon.svg?v=5';
export const DEFAULT_APPLE_TOUCH = '/apple-touch-icon.png?v=5';

/**
 * Dynamically updates all favicon and touch-icon link tags in the document head
 */
export function applyFaviconToDocument(iconUrl: string) {
  if (typeof document === 'undefined') return;

  const targetDoc = document;

  try {
    // 1. Remove all existing favicon links to force browser tab repaint
    const existingLinks = targetDoc.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    );
    existingLinks.forEach((el) => {
      try {
        el.remove();
      } catch {}
    });

    const isData = iconUrl.startsWith('data:');
    const isSvg = iconUrl.includes('.svg') || iconUrl.includes('image/svg+xml');
    const cacheBuster = isData ? '' : `${iconUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
    const finalHref = isData ? iconUrl : `${iconUrl}${cacheBuster}`;

    // 2. Add primary SVG icon if SVG (modern Chrome, Edge, Firefox prioritize this)
    if (isSvg) {
      const svgLink = targetDoc.createElement('link');
      svgLink.rel = 'icon';
      svgLink.type = 'image/svg+xml';
      svgLink.href = finalHref;
      targetDoc.head.appendChild(svgLink);
    }

    // 3. Add standard icon link
    const iconLink = targetDoc.createElement('link');
    iconLink.rel = 'icon';
    iconLink.type = isSvg ? 'image/svg+xml' : 'image/png';
    iconLink.sizes = 'any';
    iconLink.href = finalHref;
    targetDoc.head.appendChild(iconLink);

    // 4. Add shortcut icon link for older engines / Windows
    const shortcutLink = targetDoc.createElement('link');
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.type = isSvg ? 'image/svg+xml' : 'image/x-icon';
    shortcutLink.href = finalHref;
    targetDoc.head.appendChild(shortcutLink);

    // 5. Add Apple touch icon
    const touchLink = targetDoc.createElement('link');
    touchLink.rel = 'apple-touch-icon';
    touchLink.sizes = '180x180';
    touchLink.href = finalHref;
    targetDoc.head.appendChild(touchLink);

    // Try same-origin parent document if in an iframe
    try {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window && window.parent.document) {
        const parentDoc = window.parent.document;
        const parentExisting = parentDoc.querySelectorAll<HTMLLinkElement>(
          'link[rel="icon"], link[rel="shortcut icon"]'
        );
        parentExisting.forEach((el) => {
          try { el.remove(); } catch {}
        });
        const parentLink = parentDoc.createElement('link');
        parentLink.rel = 'icon';
        parentLink.href = finalHref;
        parentDoc.head.appendChild(parentLink);
      }
    } catch {
      // Cross-origin iframe parent access expectedly blocked by sandbox security
    }
  } catch (err) {
    console.warn('Error applying favicon to document:', err);
  }
}

/**
 * Retrieves the stored custom favicon data URL from localStorage if set
 */
export function getStoredFavicon(): string | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(FAVICON_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves the custom favicon to localStorage and updates the active document
 */
export function saveCustomFavicon(dataUrl: string) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(FAVICON_STORAGE_KEY, dataUrl);
  } catch (err) {
    console.warn('Could not save favicon to localStorage:', err);
  }
  applyFaviconToDocument(dataUrl);
}

/**
 * Resets the favicon back to the default institutional crest
 */
export function resetFaviconToDefault() {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(FAVICON_STORAGE_KEY);
    } catch {}
  }
  applyFaviconToDocument(DEFAULT_FAVICON);
}

/**
 * Resizes an image source to a square canvas and returns a PNG data URL
 */
export async function resizeImageToSquare(
  imageSource: string,
  targetSize: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSource);
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSource;
  });
}

/**
 * Triggers a native browser file download for a data URL or blob
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
