/**
 * Favicon Management and Dynamic Icon Generation Utilities
 * Supports client-side image resizing, live browser tab updating,
 * and downloading formatted icon assets.
 */

export const FAVICON_STORAGE_KEY = 'yitzak_custom_favicon';
export const DEFAULT_FAVICON = '/favicon.ico?v=4';
export const DEFAULT_APPLE_TOUCH = '/apple-touch-icon.png?v=4';

/**
 * Dynamically updates all favicon and touch-icon link tags in the document head
 */
export function applyFaviconToDocument(iconUrl: string) {
  if (typeof document === 'undefined') return;

  // Primary icon selectors
  const selectors = [
    { rel: 'icon', type: 'image/png' },
    { rel: 'shortcut icon', type: 'image/x-icon' },
    { rel: 'apple-touch-icon', sizes: '180x180' },
  ];

  selectors.forEach(({ rel, type, sizes }) => {
    let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      if (type) link.type = type;
      if (sizes) link.sizes = sizes;
      document.head.appendChild(link);
    }
    // Append timestamp query parameter to bust browser cache if needed
    link.href = iconUrl;
  });
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
