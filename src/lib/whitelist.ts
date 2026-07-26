import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';

export interface WhitelistedGuest {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'pending' | 'revoked';
  role: 'guest' | 'vip' | 'client' | 'admin';
  addedAt: string;
  notes?: string;
  verifiedCount?: number;
}

// Initial seed list of authorized guest emails
export const INITIAL_WHITELIST_SEEDS: Omit<WhitelistedGuest, 'id'>[] = [
  {
    email: 'christinavonnidigital@gmail.com',
    name: 'Christina Vonn Digital (Primary)',
    status: 'active',
    role: 'admin',
    addedAt: new Date().toISOString(),
    notes: 'Pre-registered Primary Account',
  },
  {
    email: 'christinagumpo@gmail.com',
    name: 'Christina Gumpo',
    status: 'active',
    role: 'admin',
    addedAt: new Date().toISOString(),
    notes: 'Pre-registered Developer Admin',
  },
  {
    email: 'guest@yitzak.co.za',
    name: 'Yitzak Guest Client',
    status: 'active',
    role: 'guest',
    addedAt: new Date().toISOString(),
    notes: 'Default Portal Guest Account',
  },
  {
    email: 'admin@yitzak.co.za',
    name: 'Yitzak Admin Desk',
    status: 'active',
    role: 'admin',
    addedAt: new Date().toISOString(),
    notes: 'Internal Verification Desk',
  },
  {
    email: 'christinagumpo@gmail.com',
    name: 'Christina Gumpo',
    status: 'active',
    role: 'admin',
    addedAt: new Date().toISOString(),
    notes: 'Pre-registered Executive Account',
  }
];

export function sanitizeEmailDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
}

/**
 * Check if an email address is pre-registered in the Firestore Whitelist.
 */
export async function checkEmailWhitelist(email: string): Promise<{
  isWhitelisted: boolean;
  guest?: WhitelistedGuest;
  source: 'firestore' | 'seed' | 'local';
}> {
  if (!email || !email.includes('@')) {
    return { isWhitelisted: false, source: 'local' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const docId = sanitizeEmailDocId(cleanEmail);

  // 1. Try Firestore First
  try {
    const docRef = doc(db, 'whitelisted_guests', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as WhitelistedGuest;
      if (data.status === 'active') {
        // Increment verification count asynchronously
        try {
          await setDoc(docRef, {
            verifiedCount: (data.verifiedCount || 0) + 1,
            lastVerifiedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('Could not update lastVerifiedAt:', e);
        }

        return {
          isWhitelisted: true,
          guest: { ...data, id: snap.id },
          source: 'firestore'
        };
      } else {
        return {
          isWhitelisted: false,
          guest: { ...data, id: snap.id },
          source: 'firestore'
        };
      }
    }
  } catch (err) {
    console.warn('Firestore whitelist check failed, falling back to seed/local checks:', err);
  }

  // 2. Check Seed / Pre-registered List
  const seedMatch = INITIAL_WHITELIST_SEEDS.find(
    item => item.email.toLowerCase() === cleanEmail
  );

  if (seedMatch) {
    // Attempt auto-sync to Firestore for future reads
    try {
      const docRef = doc(db, 'whitelisted_guests', docId);
      await setDoc(docRef, {
        ...seedMatch,
        id: docId,
        addedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Seed sync to Firestore skipped:', e);
    }

    return {
      isWhitelisted: true,
      guest: { ...seedMatch, id: docId },
      source: 'seed'
    };
  }

  // 3. Check LocalStorage fallback
  try {
    const localWhitelist: WhitelistedGuest[] = JSON.parse(
      localStorage.getItem('yitzak_whitelisted_guests') || '[]'
    );
    const localMatch = localWhitelist.find(
      item => item.email.toLowerCase() === cleanEmail && item.status === 'active'
    );
    if (localMatch) {
      return {
        isWhitelisted: true,
        guest: localMatch,
        source: 'local'
      };
    }
  } catch (e) {
    console.warn('LocalStorage whitelist check failed:', e);
  }

  return { isWhitelisted: false, source: 'local' };
}

/**
 * Pre-register or add a guest email to the Firestore Whitelist.
 */
export async function preRegisterGuest(
  email: string,
  name: string = 'Authorized Guest',
  notes: string = 'Pre-registered via Portal',
  role: 'guest' | 'vip' | 'client' | 'admin' = 'guest',
  status: 'active' | 'pending' | 'revoked' = 'active'
): Promise<WhitelistedGuest> {
  const cleanEmail = email.trim().toLowerCase();
  const docId = sanitizeEmailDocId(cleanEmail);

  const guestData: WhitelistedGuest = {
    id: docId,
    email: cleanEmail,
    name: name.trim() || 'Authorized Guest',
    status,
    role,
    addedAt: new Date().toISOString(),
    notes,
    verifiedCount: 0
  };

  // Save to Firestore
  try {
    const docRef = doc(db, 'whitelisted_guests', docId);
    await setDoc(docRef, guestData, { merge: true });
  } catch (err) {
    console.warn('Firestore write failed for whitelist pre-registration, saving to LocalStorage:', err);
  }

  // Also save to local storage as fallback/cache
  try {
    const existing: WhitelistedGuest[] = JSON.parse(
      localStorage.getItem('yitzak_whitelisted_guests') || '[]'
    );
    const filtered = existing.filter(i => i.email !== cleanEmail);
    filtered.push(guestData);
    localStorage.setItem('yitzak_whitelisted_guests', JSON.stringify(filtered));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }

  return guestData;
}

/**
 * Fetch all whitelisted guests from Firestore (with seed & local fallbacks).
 */
export async function fetchAllWhitelistedGuests(): Promise<WhitelistedGuest[]> {
  const guestMap = new Map<string, WhitelistedGuest>();

  // Add seeds first
  INITIAL_WHITELIST_SEEDS.forEach(seed => {
    const docId = sanitizeEmailDocId(seed.email);
    guestMap.set(seed.email.toLowerCase(), { ...seed, id: docId });
  });

  // Load from LocalStorage
  try {
    const localList: WhitelistedGuest[] = JSON.parse(
      localStorage.getItem('yitzak_whitelisted_guests') || '[]'
    );
    localList.forEach(item => {
      guestMap.set(item.email.toLowerCase(), item);
    });
  } catch (e) {
    console.warn('LocalStorage whitelist read error:', e);
  }

  // Load from Firestore
  try {
    const querySnap = await getDocs(collection(db, 'whitelisted_guests'));
    querySnap.forEach(docSnap => {
      const data = docSnap.data() as WhitelistedGuest;
      if (data && data.email) {
        guestMap.set(data.email.toLowerCase(), { ...data, id: docSnap.id });
      }
    });
  } catch (err) {
    console.warn('Firestore fetchAllWhitelistedGuests error:', err);
  }

  return Array.from(guestMap.values()).sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );
}

/**
 * Remove/Revoke a guest from the Firestore Whitelist.
 */
export async function removeGuestFromWhitelist(docId: string, email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  
  try {
    await deleteDoc(doc(db, 'whitelisted_guests', docId));
  } catch (e) {
    console.warn('Firestore deleteDoc failed:', e);
  }

  try {
    const localList: WhitelistedGuest[] = JSON.parse(
      localStorage.getItem('yitzak_whitelisted_guests') || '[]'
    );
    const updated = localList.filter(i => i.email.toLowerCase() !== cleanEmail);
    localStorage.setItem('yitzak_whitelisted_guests', JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage delete error:', e);
  }
}
