/**
 * Firestore security-rules test suite for the Yitzak Consulting booking system.
 *
 * Implements the "Dirty Dozen" adversarial payloads from security_spec.md, plus
 * positive-control tests and regression tests for the fixes applied to
 * firestore.rules:
 *   - Admin can modify any user's booking (identity lock no longer trapped on
 *     the admin branch).
 *   - A booking with `calendarEventId: null` is accepted on create.
 *   - referral_clicks and whitelisted_guests have explicit, scoped rules.
 *   - Ghost-field injection is rejected on booking/inquiry/newsletter create.
 *   - Newsletter create enforces a server timestamp and a status enum.
 *
 * Run against the Firestore emulator:
 *   npm run test:rules
 * which wraps this in `firebase emulators:exec --only firestore`.
 */
import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest';

const PROJECT_ID = 'yitzak-rules-test';
const ADMIN_EMAIL = 'christinagumpo@gmail.com';

let testEnv: RulesTestEnvironment;

// ---- context helpers --------------------------------------------------------
const adminDb = () =>
  testEnv.authenticatedContext('admin_uid', {
    email: ADMIN_EMAIL,
    email_verified: true,
  }).firestore();

const claimAdminDb = () =>
  testEnv.authenticatedContext('claim_admin_uid', {
    email: 'ops@yitzak.co.za',
    email_verified: true,
    admin: true,
  }).firestore();

const userDb = () =>
  testEnv.authenticatedContext('user_uid', {
    email: 'user@example.com',
    email_verified: true,
  }).firestore();

const attackerDb = () =>
  testEnv.authenticatedContext('attacker_uid', {
    email: 'attacker@example.com',
    email_verified: true,
  }).firestore();

const unverifiedAdminDb = () =>
  testEnv.authenticatedContext('unverified_uid', {
    email: ADMIN_EMAIL,
    email_verified: false,
  }).firestore();

const guestDb = () => testEnv.unauthenticatedContext().firestore();

// ---- payload builders -------------------------------------------------------
function validBooking(overrides: Record<string, unknown> = {}) {
  return {
    userId: 'user_uid',
    userName: 'Regular User',
    userEmail: 'user@example.com',
    date: '2026-07-20',
    timeSlot: '10:00 - 11:00',
    pillar: 'Compliance Mastery',
    notes: 'Please prepare compliance docs.',
    status: 'pending',
    isGuestBooking: false,
    calendarEventId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

/** Seed a document bypassing rules (for update/read/delete scenarios). */
async function seed(path: string, id: string, data: Record<string, unknown>) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path, id), data);
  });
}

const seededBooking = (overrides: Record<string, unknown> = {}) => ({
  userId: 'user_uid',
  userName: 'Regular User',
  userEmail: 'user@example.com',
  date: '2026-07-20',
  timeSlot: '10:00 - 11:00',
  pillar: 'Compliance Mastery',
  notes: '',
  status: 'pending',
  isGuestBooking: false,
  calendarEventId: null,
  createdAt: Timestamp.fromDate(new Date('2026-07-01T09:00:00Z')),
  updatedAt: Timestamp.fromDate(new Date('2026-07-01T09:00:00Z')),
  ...overrides,
});

// ---- setup ------------------------------------------------------------------
beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// ---- The "Dirty Dozen" ------------------------------------------------------
describe('Dirty Dozen — all must be PERMISSION_DENIED', () => {
  test('1. Identity spoofing: creating a booking for another user', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'bookings', 'b1'), validBooking({ userId: 'victim_uid', userEmail: 'user@example.com' })),
    );
  });

  test('2. Privilege escalation: self-confirming status on create', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'bookings', 'b2'), validBooking({ status: 'confirmed' })),
    );
  });

  test('3. Temporal spoofing: backdated createdAt', async () => {
    await assertFails(
      setDoc(
        doc(userDb(), 'bookings', 'b3'),
        validBooking({ createdAt: Timestamp.fromDate(new Date('2020-01-01T00:00:00Z')) }),
      ),
    );
  });

  test('4. Ghost field injection: unknown key isAdmin', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'bookings', 'b4'), validBooking({ isAdmin: true })),
    );
  });

  test('5. Resource exhaustion: oversized notes', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'bookings', 'b5'), validBooking({ notes: 'x'.repeat(5001) })),
    );
  });

  test('6. Schema poisoning: invalid pillar', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'bookings', 'b6'), validBooking({ pillar: 'Highly Malicious Custom Service' })),
    );
  });

  test('7. Unverified-email admin escalation cannot read others bookings', async () => {
    await seed('bookings', 'b7', seededBooking());
    await assertFails(getDoc(doc(unverifiedAdminDb(), 'bookings', 'b7')));
  });

  test('8. Immutable-field hijack: altering pillar on update', async () => {
    await seed('bookings', 'b8', seededBooking());
    await assertFails(
      updateDoc(doc(userDb(), 'bookings', 'b8'), { pillar: 'Strategic Training', updatedAt: serverTimestamp() }),
    );
  });

  test('9. Shadow state transition: cancelled -> confirmed by user', async () => {
    await seed('bookings', 'b9', seededBooking({ status: 'cancelled' }));
    await assertFails(
      updateDoc(doc(userDb(), 'bookings', 'b9'), { status: 'confirmed', updatedAt: serverTimestamp() }),
    );
  });

  test('10. Anonymous write to bookings', async () => {
    await assertFails(setDoc(doc(guestDb(), 'bookings', 'b10'), validBooking()));
  });

  test('11. Malformed document ID', async () => {
    await assertFails(setDoc(doc(userDb(), 'bookings', 'malformed-id-!!!!$$$$'), validBooking()));
  });

  test('12. Blanket read scraping: unfiltered list by non-admin', async () => {
    await seed('bookings', 'own', seededBooking());
    await seed('bookings', 'other', seededBooking({ userId: 'someone_else', userEmail: 'x@example.com' }));
    await assertFails(getDocs(collection(userDb(), 'bookings')));
  });
});

// ---- Positive controls + regression tests ----------------------------------
describe('bookings — legitimate operations', () => {
  test('owner can create a valid pending booking (calendarEventId null)', async () => {
    await assertSucceeds(setDoc(doc(userDb(), 'bookings', 'ok1'), validBooking()));
  });

  test('owner can create a booking with a string calendarEventId', async () => {
    await assertSucceeds(
      setDoc(doc(userDb(), 'bookings', 'ok2'), validBooking({ calendarEventId: 'gcal_event_123' })),
    );
  });

  test('REGRESSION #2: booking with calendarEventId null is not rejected', async () => {
    await assertSucceeds(
      setDoc(doc(userDb(), 'bookings', 'ok3'), validBooking({ calendarEventId: null })),
    );
  });

  test('owner can cancel their own booking', async () => {
    await seed('bookings', 'c1', seededBooking());
    await assertSucceeds(
      updateDoc(doc(userDb(), 'bookings', 'c1'), { status: 'cancelled', updatedAt: serverTimestamp() }),
    );
  });

  test('owner can sync calendarEventId after creation', async () => {
    await seed('bookings', 'c2', seededBooking());
    await assertSucceeds(
      updateDoc(doc(userDb(), 'bookings', 'c2'), { calendarEventId: 'gcal_late', updatedAt: serverTimestamp() }),
    );
  });

  test('owner can filter their own bookings by userId', async () => {
    await seed('bookings', 'own', seededBooking());
    await assertSucceeds(getDocs(query(collection(userDb(), 'bookings'), where('userId', '==', 'user_uid'))));
  });

  test('REGRESSION #1: email-admin can confirm another user\'s booking', async () => {
    await seed('bookings', 'a1', seededBooking());
    await assertSucceeds(
      updateDoc(doc(adminDb(), 'bookings', 'a1'), { status: 'confirmed', updatedAt: serverTimestamp() }),
    );
  });

  test('REGRESSION #1: claim-admin can confirm another user\'s booking', async () => {
    await seed('bookings', 'a2', seededBooking());
    await assertSucceeds(
      updateDoc(doc(claimAdminDb(), 'bookings', 'a2'), { status: 'confirmed', updatedAt: serverTimestamp() }),
    );
  });

  test('admin can read any booking and list all bookings', async () => {
    await seed('bookings', 'a3', seededBooking({ userId: 'someone', userEmail: 'z@example.com' }));
    await assertSucceeds(getDoc(doc(adminDb(), 'bookings', 'a3')));
    await assertSucceeds(getDocs(collection(adminDb(), 'bookings')));
  });

  test('admin can delete a booking; user cannot', async () => {
    await seed('bookings', 'd1', seededBooking());
    await assertFails(deleteDoc(doc(userDb(), 'bookings', 'd1')));
    await assertSucceeds(deleteDoc(doc(adminDb(), 'bookings', 'd1')));
  });

  test('attacker cannot read a booking they do not own', async () => {
    await seed('bookings', 'x1', seededBooking());
    await assertFails(getDoc(doc(attackerDb(), 'bookings', 'x1')));
  });

  test('non-boolean isGuestBooking is rejected on create', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'bookings', 'gb1'), validBooking({ isGuestBooking: 'x'.repeat(1000) })),
    );
  });
});

// ---- inquiries --------------------------------------------------------------
describe('inquiries', () => {
  const validInquiry = (overrides: Record<string, unknown> = {}) => ({
    name: 'Jane',
    email: 'jane@example.com',
    subject: 'Consulting request',
    message: 'Hello, I would like to book a consultation.',
    userId: null,
    status: 'unread',
    createdAt: serverTimestamp(),
    ...overrides,
  });

  test('guest can submit a valid inquiry', async () => {
    await assertSucceeds(setDoc(doc(guestDb(), 'inquiries', 'inq_ok'), validInquiry()));
  });

  test('signed-in user can submit an inquiry with their uid', async () => {
    await assertSucceeds(setDoc(doc(userDb(), 'inquiries', 'inq_ok2'), validInquiry({ userId: 'user_uid' })));
  });

  test('inquiry with a client string createdAt is rejected', async () => {
    await assertFails(
      setDoc(doc(guestDb(), 'inquiries', 'inq_bad'), validInquiry({ createdAt: '2020-01-01T00:00:00Z' })),
    );
  });

  test('inquiry ghost field is rejected', async () => {
    await assertFails(
      setDoc(doc(guestDb(), 'inquiries', 'inq_ghost'), validInquiry({ isAdmin: true })),
    );
  });

  test('non-admin cannot read inquiries', async () => {
    await seed('inquiries', 'inq_seed', { ...validInquiry(), createdAt: Timestamp.now() });
    await assertFails(getDoc(doc(userDb(), 'inquiries', 'inq_seed')));
    await assertSucceeds(getDoc(doc(adminDb(), 'inquiries', 'inq_seed')));
  });
});

// ---- newsletter_subscriptions ----------------------------------------------
describe('newsletter_subscriptions', () => {
  const validSub = (overrides: Record<string, unknown> = {}) => ({
    email: 'subscriber@example.com',
    createdAt: serverTimestamp(),
    status: 'active',
    ...overrides,
  });

  test('guest can subscribe with a server timestamp', async () => {
    await assertSucceeds(setDoc(doc(guestDb(), 'newsletter_subscriptions', 'sub_ok'), validSub()));
  });

  test('REGRESSION #5: client-controlled string createdAt is rejected', async () => {
    await assertFails(
      setDoc(doc(guestDb(), 'newsletter_subscriptions', 'sub_bad'), validSub({ createdAt: '2020-01-01T00:00:00Z' })),
    );
  });

  test('REGRESSION #5: out-of-enum status is rejected', async () => {
    await assertFails(
      setDoc(doc(guestDb(), 'newsletter_subscriptions', 'sub_status'), validSub({ status: 'admin' })),
    );
  });

  test('REGRESSION #5: ghost field is rejected', async () => {
    await assertFails(
      setDoc(doc(guestDb(), 'newsletter_subscriptions', 'sub_ghost'), validSub({ role: 'admin' })),
    );
  });

  test('malformed email is rejected', async () => {
    await assertFails(
      setDoc(doc(guestDb(), 'newsletter_subscriptions', 'sub_email'), validSub({ email: 'not-an-email' })),
    );
  });

  test('only admin can read subscriptions', async () => {
    await seed('newsletter_subscriptions', 'sub_seed', { email: 'a@b.com', createdAt: Timestamp.now(), status: 'active' });
    await assertFails(getDoc(doc(guestDb(), 'newsletter_subscriptions', 'sub_seed')));
    await assertSucceeds(getDoc(doc(adminDb(), 'newsletter_subscriptions', 'sub_seed')));
  });
});

// ---- referral_clicks --------------------------------------------------------
describe('referral_clicks', () => {
  const validClick = (overrides: Record<string, unknown> = {}) => ({
    id: 'ref_1',
    referralCode: 'PARTNER-42',
    schemeName: 'FoodChain ID Academy',
    targetUrl: 'https://academy.example.com',
    trackingUrl: 'https://academy.example.com?utm_term=PARTNER-42',
    userId: 'user_uid',
    userName: 'Regular User',
    userEmail: 'user@example.com',
    userCompany: 'Acme',
    userPhone: '+27000000000',
    coordinateEnrollment: false,
    status: 'click_logged',
    createdAt: serverTimestamp(),
    ...overrides,
  });

  test('owner can log their own referral click', async () => {
    await assertSucceeds(setDoc(doc(userDb(), 'referral_clicks', 'ref_ok'), validClick()));
  });

  test('cannot log a referral click for another user', async () => {
    await assertFails(setDoc(doc(userDb(), 'referral_clicks', 'ref_spoof'), validClick({ userId: 'victim' })));
  });

  test('cannot log a referral click under another person\'s email', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'referral_clicks', 'ref_email'), validClick({ userEmail: 'someone-else@example.com' })),
    );
  });

  test('referral ghost field is rejected', async () => {
    await assertFails(
      setDoc(doc(userDb(), 'referral_clicks', 'ref_ghost'), validClick({ isAdmin: true })),
    );
  });

  test('anonymous referral write is rejected', async () => {
    await assertFails(setDoc(doc(guestDb(), 'referral_clicks', 'ref_anon'), validClick()));
  });

  test('owner and admin can read; other users cannot', async () => {
    await seed('referral_clicks', 'ref_seed', { ...validClick(), createdAt: Timestamp.now() });
    await assertSucceeds(getDoc(doc(userDb(), 'referral_clicks', 'ref_seed')));
    await assertSucceeds(getDoc(doc(adminDb(), 'referral_clicks', 'ref_seed')));
    await assertFails(getDoc(doc(attackerDb(), 'referral_clicks', 'ref_seed')));
  });

  test('only admin can update referral status; owner cannot', async () => {
    await seed('referral_clicks', 'ref_up', { ...validClick(), createdAt: Timestamp.now() });
    await assertFails(
      updateDoc(doc(userDb(), 'referral_clicks', 'ref_up'), { status: 'converted', updatedAt: serverTimestamp() }),
    );
    await assertSucceeds(
      updateDoc(doc(adminDb(), 'referral_clicks', 'ref_up'), { status: 'converted', updatedAt: serverTimestamp() }),
    );
  });
});

// ---- whitelisted_guests -----------------------------------------------------
describe('whitelisted_guests', () => {
  const validGuest = (overrides: Record<string, unknown> = {}) => ({
    email: 'guest@yitzak.co.za',
    name: 'Yitzak Guest',
    status: 'active',
    role: 'guest',
    addedAt: new Date().toISOString(),
    notes: 'Portal guest',
    verifiedCount: 0,
    ...overrides,
  });

  test('admin can add a whitelisted guest', async () => {
    await assertSucceeds(setDoc(doc(adminDb(), 'whitelisted_guests', 'guest_1'), validGuest()));
  });

  test('non-admin cannot add a whitelisted guest (no self-promotion to admin)', async () => {
    await assertFails(
      setDoc(doc(attackerDb(), 'whitelisted_guests', 'attacker_1'), validGuest({ email: 'attacker@example.com', role: 'admin' })),
    );
  });

  test('anonymous user cannot write to the whitelist', async () => {
    await assertFails(setDoc(doc(guestDb(), 'whitelisted_guests', 'g_anon'), validGuest()));
  });

  test('non-admin cannot read the whitelist; admin can', async () => {
    await seed('whitelisted_guests', 'g_seed', validGuest());
    await assertFails(getDoc(doc(userDb(), 'whitelisted_guests', 'g_seed')));
    await assertSucceeds(getDoc(doc(adminDb(), 'whitelisted_guests', 'g_seed')));
  });

  test('admin can delete a whitelisted guest; non-admin cannot', async () => {
    await seed('whitelisted_guests', 'g_del', validGuest());
    await assertFails(deleteDoc(doc(userDb(), 'whitelisted_guests', 'g_del')));
    await assertSucceeds(deleteDoc(doc(adminDb(), 'whitelisted_guests', 'g_del')));
  });
});
