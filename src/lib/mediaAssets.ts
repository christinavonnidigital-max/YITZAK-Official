/**
 * Media and Hero Image Asset Management
 * Handles local caching, upload processing, and persistence for primary site imagery.
 */

export const TRAINING_HERO_STORAGE_KEY = 'yitzak_training_hero_img';
export const DEFAULT_TRAINING_HERO = '/training-outcomes.png';
export const FALLBACK_TRAINING_HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh8qjKo1mwyVEx2R4hcz_37lRzkxGHkT6V-oq1p6-aNLPzSIK1PeKocPwmsavBw-jzyWVB7YGBWC7mQGezHM9vJgXqXzW6XP-LZ0F3KVj7xjUPf9A30emofQLCDZzMztfEV_elrnRp7EgBGuSsJrD3EK0M9h-zOPiHOpehrbBdtNYBmiSgUTd0LjaWVrc-kU93-69KQ9lqCIkb1UTr7OvswZEbEAmW5BkzB5_ThEx55RADoHMnem4L';

/**
 * Retrieves the stored custom training hero image from localStorage or returns default
 */
export function getStoredTrainingHero(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return DEFAULT_TRAINING_HERO;
  }
  try {
    const saved = localStorage.getItem(TRAINING_HERO_STORAGE_KEY);
    return saved || DEFAULT_TRAINING_HERO;
  } catch {
    return DEFAULT_TRAINING_HERO;
  }
}

/**
 * Saves a new custom training hero image to localStorage and notifies active listeners
 */
export function saveCustomTrainingHero(imageDataUrl: string): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }
  try {
    localStorage.setItem(TRAINING_HERO_STORAGE_KEY, imageDataUrl);
    window.dispatchEvent(new CustomEvent('yitzak-training-hero-updated', { detail: { imageUrl: imageDataUrl } }));
    return true;
  } catch (err) {
    console.warn('Could not save custom training hero image to localStorage:', err);
    return false;
  }
}

/**
 * Resets the training hero image back to default
 */
export function resetTrainingHero(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(TRAINING_HERO_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('yitzak-training-hero-updated', { detail: { imageUrl: DEFAULT_TRAINING_HERO } }));
  } catch (err) {
    console.warn('Could not reset training hero image:', err);
  }
}

/**
 * Reads a File object and optimizes it as a web-ready image data URL (max 1920x1080)
 */
export function processImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read image file'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // High quality web JPEG or PNG compression to preserve clarity while fitting in localStorage
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressed);
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}
