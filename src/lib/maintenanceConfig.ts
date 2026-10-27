/**
 * YITZAK Consulting - Site Maintenance Configuration & Staff Bypass Management
 */

const STORAGE_KEY_MAINTENANCE = 'yitzak_maintenance_mode_active';
const STORAGE_KEY_BYPASS = 'yitzak_staff_maintenance_bypass';

// Default state: TRUE (Website disabled / Maintenance screen active)
export const DEFAULT_MAINTENANCE_ACTIVE = true;

// Staff Access PINs accepted for bypass
export const STAFF_BYPASS_PINS = ['yitzak2026', '123456', 'yitzak'];

/**
 * Checks if maintenance mode is currently active.
 * Defaults to true unless explicitly turned off by an administrator.
 */
export function isMaintenanceModeEnabled(): boolean {
  if (typeof window === 'undefined') return DEFAULT_MAINTENANCE_ACTIVE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MAINTENANCE);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_MAINTENANCE_ACTIVE;
}

/**
 * Sets maintenance mode active/inactive.
 */
export function setMaintenanceModeEnabled(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MAINTENANCE, active ? 'true' : 'false');
    window.dispatchEvent(new Event('yitzak_maintenance_change'));
  } catch (err) {
    console.error('Failed to update maintenance mode setting', err);
  }
}

/**
 * Checks if the current user/browser has an active staff bypass token.
 */
export function hasStaffBypass(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const sessionBypass = sessionStorage.getItem(STORAGE_KEY_BYPASS);
    if (sessionBypass === 'true') return true;
    const localBypass = localStorage.getItem(STORAGE_KEY_BYPASS);
    if (localBypass === 'true') return true;
  } catch {
    // ignore
  }
  return false;
}

/**
 * Grants or revokes staff bypass.
 */
export function setStaffBypass(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (active) {
      sessionStorage.setItem(STORAGE_KEY_BYPASS, 'true');
      localStorage.setItem(STORAGE_KEY_BYPASS, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_BYPASS);
      localStorage.removeItem(STORAGE_KEY_BYPASS);
    }
    window.dispatchEvent(new Event('yitzak_maintenance_change'));
  } catch (err) {
    console.error('Failed to set staff bypass', err);
  }
}

/**
 * Verifies staff bypass PIN.
 */
export function verifyStaffBypassPin(inputPin: string): boolean {
  if (!inputPin) return false;
  const clean = inputPin.trim().toLowerCase();
  return STAFF_BYPASS_PINS.includes(clean);
}
