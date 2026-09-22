/**
 * YITZAK Institutional Administrator Authentication & Password Security
 * Manages administrator portal credentials with default fallback to '123456'
 * for institutional accounts, and strict email-only initial password setup for
 * designated admin accounts like Christinavonnidigital@gmail.com.
 */

export const DEFAULT_ADMIN_PASSWORD = '123456';
const STORAGE_KEY_PASSWORD = 'yitzak_admin_password';
const STORAGE_KEY_UPDATED_AT = 'yitzak_admin_password_updated_at';

// Accounts that explicitly must NEVER receive or use the default '123456' password.
// They must set their password via 6-digit email OTP verification.
export const ACCOUNTS_WITHOUT_DEFAULT_PASSWORD: string[] = [
  'christinavonnidigital@gmail.com'
];

export interface PasswordChangeResult {
  success: boolean;
  message: string;
}

export interface PasswordVerificationResult {
  valid: boolean;
  errorMessage?: string;
}

function getEmailStorageKey(email?: string): string {
  if (!email) return STORAGE_KEY_PASSWORD;
  const clean = email.toLowerCase().trim();
  return `${STORAGE_KEY_PASSWORD}_${clean}`;
}

function getEmailUpdatedAtKey(email?: string): string {
  if (!email) return STORAGE_KEY_UPDATED_AT;
  const clean = email.toLowerCase().trim();
  return `${STORAGE_KEY_UPDATED_AT}_${clean}`;
}

/**
 * Checks if the given account is explicitly barred from using the 123456 default password.
 */
export function isAccountWithoutDefaultPassword(email?: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return ACCOUNTS_WITHOUT_DEFAULT_PASSWORD.includes(clean);
}

/**
 * Checks whether an administrator has already configured a custom password.
 */
export function hasCustomPasswordConfigured(email?: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const key = getEmailStorageKey(email);
    const stored = localStorage.getItem(key);
    if (stored && stored.trim()) return true;

    // Fall back to general stored password if not an exempt account
    if (!isAccountWithoutDefaultPassword(email)) {
      const general = localStorage.getItem(STORAGE_KEY_PASSWORD);
      return Boolean(general && general.trim() && general !== DEFAULT_ADMIN_PASSWORD);
    }
    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Retrieve the active administrator password for an account.
 * For Christinavonnidigital@gmail.com, returns null if they have not yet set one.
 */
export function getStoredAdminPassword(email?: string): string | null {
  if (typeof window === 'undefined') {
    return isAccountWithoutDefaultPassword(email) ? null : DEFAULT_ADMIN_PASSWORD;
  }
  try {
    const key = getEmailStorageKey(email);
    const specificStored = localStorage.getItem(key);
    if (specificStored && specificStored.trim()) {
      return specificStored;
    }

    if (isAccountWithoutDefaultPassword(email)) {
      return null;
    }

    const generalStored = localStorage.getItem(STORAGE_KEY_PASSWORD);
    return generalStored && generalStored.trim() ? generalStored : DEFAULT_ADMIN_PASSWORD;
  } catch (_) {
    return isAccountWithoutDefaultPassword(email) ? null : DEFAULT_ADMIN_PASSWORD;
  }
}

/**
 * Checks if the administrator is still using the initial default password ('123456').
 * Always returns false for accounts where the default password is excluded.
 */
export function isDefaultAdminPassword(email?: string): boolean {
  if (isAccountWithoutDefaultPassword(email)) return false;
  return getStoredAdminPassword(email) === DEFAULT_ADMIN_PASSWORD;
}

/**
 * Get timestamp of when password was last changed.
 */
export function getAdminPasswordLastUpdated(email?: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const specificKey = getEmailUpdatedAtKey(email);
    const specific = localStorage.getItem(specificKey);
    if (specific) return specific;

    return localStorage.getItem(STORAGE_KEY_UPDATED_AT);
  } catch (_) {
    return null;
  }
}

/**
 * Validate an entered password against the stored administrator password for the given email.
 */
export function verifyAdminPassword(inputPassword: string, email?: string): PasswordVerificationResult {
  if (!inputPassword) {
    return { valid: false, errorMessage: 'Please enter your password.' };
  }

  const cleanEmail = email?.toLowerCase().trim();

  // If this account cannot use the default 123456 password
  if (isAccountWithoutDefaultPassword(cleanEmail)) {
    const stored = getStoredAdminPassword(cleanEmail);
    if (!stored) {
      return {
        valid: false,
        errorMessage: `No password has been set yet for ${cleanEmail}. Please switch to '6-Digit Email Code' or click 'Set Password via Email' below.`
      };
    }

    if (inputPassword === DEFAULT_ADMIN_PASSWORD && stored !== DEFAULT_ADMIN_PASSWORD) {
      return {
        valid: false,
        errorMessage: `Default password (123456) is disabled for ${cleanEmail}. Please use your custom password or reset it via email.`
      };
    }

    if (inputPassword === stored) {
      return { valid: true };
    }
    return {
      valid: false,
      errorMessage: "Incorrect password. Click 'Change Password' below to reset it via email."
    };
  }

  // Standard institutional accounts
  const current = getStoredAdminPassword(email);
  if (inputPassword === current) {
    return { valid: true };
  }

  return {
    valid: false,
    errorMessage: isDefaultAdminPassword(email)
      ? "Incorrect password. (Initial default is 123456). Click 'Change Password' below to set a custom password."
      : "Incorrect password. Click 'Change Password' below to reset it via email."
  };
}

/**
 * Change administrator password requiring verification of the current password.
 */
export function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  email?: string
): PasswordChangeResult {
  const verification = verifyAdminPassword(currentPassword, email);
  if (!verification.valid) {
    return {
      success: false,
      message: verification.errorMessage || 'The current password you entered is incorrect.'
    };
  }

  const cleanNew = newPassword.trim();
  if (cleanNew.length < 6) {
    return {
      success: false,
      message: 'Your new password must be at least 6 characters long.'
    };
  }

  if (cleanNew === currentPassword) {
    return {
      success: false,
      message: 'New password must be different from your current password.'
    };
  }

  if (cleanNew !== confirmPassword.trim()) {
    return {
      success: false,
      message: 'The new password and confirmation password do not match.'
    };
  }

  try {
    const key = getEmailStorageKey(email);
    const updatedKey = getEmailUpdatedAtKey(email);
    localStorage.setItem(key, cleanNew);
    const now = new Date().toISOString();
    localStorage.setItem(updatedKey, now);

    if (!email || !isAccountWithoutDefaultPassword(email)) {
      localStorage.setItem(STORAGE_KEY_PASSWORD, cleanNew);
      localStorage.setItem(STORAGE_KEY_UPDATED_AT, now);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('yitzak-admin-password-changed', {
          detail: { email, updatedAt: now }
        })
      );
    }

    return {
      success: true,
      message: 'Password successfully updated! Your new credentials are now active.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Could not save password: ' + (err?.message || 'Unknown error')
    };
  }
}

/**
 * Direct update (e.g. after successful 6-digit email OTP verification or admin override).
 */
export function setAdminPasswordDirectly(newPassword: string, email?: string): PasswordChangeResult {
  const cleanNew = newPassword.trim();
  if (cleanNew.length < 6) {
    return {
      success: false,
      message: 'Your new password must be at least 6 characters long.'
    };
  }

  try {
    const key = getEmailStorageKey(email);
    const updatedKey = getEmailUpdatedAtKey(email);
    localStorage.setItem(key, cleanNew);
    const now = new Date().toISOString();
    localStorage.setItem(updatedKey, now);

    if (!email || !isAccountWithoutDefaultPassword(email)) {
      localStorage.setItem(STORAGE_KEY_PASSWORD, cleanNew);
      localStorage.setItem(STORAGE_KEY_UPDATED_AT, now);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('yitzak-admin-password-changed', {
          detail: { email, updatedAt: now }
        })
      );
    }

    return {
      success: true,
      message: 'Password successfully updated! You can now log in with your new password.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Could not save password: ' + (err?.message || 'Unknown error')
    };
  }
}

/**
 * Restore default password '123456' for standard accounts.
 */
export function resetAdminPasswordToDefault(email?: string): void {
  if (isAccountWithoutDefaultPassword(email)) return;
  try {
    const key = getEmailStorageKey(email);
    const updatedKey = getEmailUpdatedAtKey(email);
    localStorage.setItem(key, DEFAULT_ADMIN_PASSWORD);
    localStorage.removeItem(updatedKey);

    localStorage.setItem(STORAGE_KEY_PASSWORD, DEFAULT_ADMIN_PASSWORD);
    localStorage.removeItem(STORAGE_KEY_UPDATED_AT);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('yitzak-admin-password-changed', {
          detail: { email, updatedAt: null, isDefault: true }
        })
      );
    }
  } catch (_) {}
}
