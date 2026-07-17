# Security Specification & Test-Driven Development (TDD) for Yitzak Booking System

This document outlines the security architecture, data invariants, and adversarial "Dirty Dozen" payload tests designed to verify the security of the Yitzak Consulting Firestore rules.

## 1. Data Invariants

1. **Authentication Boundary**: No write operations (create, update, delete) are permitted without active Google Authentication and a verified email address (`request.auth.token.email_verified == true`).
2. **Identity Lock**: A user can only create or modify bookings where the `userId` field exactly matches their own `request.auth.uid`.
3. **Admin Escapement**: Only the bootstrapped administrator (`christinagumpo@gmail.com`) with a verified email has global read and write permissions to manage, confirm, or cancel any booking.
4. **Immutability of Key Fields**: Once a booking is created, the fields `userId`, `userEmail`, `createdAt`, and `pillar` are immutable and cannot be altered by non-admin users.
5. **Pillars and Status Enums**: The `pillar` field must be one of the pre-approved service pillars ("Compliance Mastery", "Strategic Training", "Institutional Advisory"), and `status` must strictly be one of `['pending', 'confirmed', 'cancelled']`.
6. **Temporal Integrity**: Creation and update timestamps must be strictly validated using the server-controlled `request.time`. Client-side backdating or clock spoofing is mathematically blocked.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads attempt to bypass authorization, pollute the database, spoof identities, or bypass temporal rules. All of these payloads must be explicitly rejected by the security rules with `PERMISSION_DENIED`.

### Malicious Payload 1: Identity Spoofing (Setting another user's UID on Create)
* **Goal**: An attacker attempts to create a booking on behalf of another user.
* **Payload**:
```json
{
  "userId": "victim_user_123",
  "userName": "Victim User",
  "userEmail": "victim@example.com",
  "date": "2026-07-20",
  "timeSlot": "10:00 - 11:00",
  "pillar": "Compliance Mastery",
  "status": "pending",
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Malicious Payload 2: Privilege Escalation (Self-Confirming status on Create)
* **Goal**: A regular user tries to schedule a booking and immediately mark it as `confirmed` instead of letting the administrator confirm it.
* **Payload**:
```json
{
  "userId": "attacker_uid",
  "userName": "Attacker",
  "userEmail": "attacker@example.com",
  "date": "2026-07-20",
  "timeSlot": "10:00 - 11:00",
  "pillar": "Compliance Mastery",
  "status": "confirmed",
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Malicious Payload 3: Temporal Spoofing (Injecting backdated createdAt timestamp)
* **Goal**: Attacker tries to make their booking appear as if it was created in the past to gain scheduling priority.
* **Payload**:
```json
{
  "userId": "attacker_uid",
  "userName": "Attacker",
  "userEmail": "attacker@example.com",
  "date": "2026-07-20",
  "timeSlot": "10:00 - 11:00",
  "pillar": "Compliance Mastery",
  "status": "pending",
  "createdAt": "2020-01-01T00:00:00Z",
  "updatedAt": "request.time"
}
```

### Malicious Payload 4: Injection of Shadow "Ghost" Fields (Anti-Update-Gap)
* **Goal**: Attacker attempts to add unauthorized keys like `isAdmin: true` to bypass downstream client checks.
* **Payload**:
```json
{
  "userId": "attacker_uid",
  "userName": "Attacker",
  "userEmail": "attacker@example.com",
  "date": "2026-07-20",
  "timeSlot": "10:00 - 11:00",
  "pillar": "Compliance Mastery",
  "status": "pending",
  "isAdmin": true,
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Malicious Payload 5: Denying Wallet (Resource Exhaustion via 1MB String Injection)
* **Goal**: Attacker tries to bloat the database by writing a massive 1MB string in the `notes` field.
* **Payload**:
```json
{
  "userId": "attacker_uid",
  "userName": "Attacker",
  "userEmail": "attacker@example.com",
  "date": "2026-07-20",
  "timeSlot": "10:00 - 11:00",
  "pillar": "Compliance Mastery",
  "status": "pending",
  "notes": "[A repeated character string of 50,000 characters...]",
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Malicious Payload 6: Invalid Service Pillar Injection (Schema Poisoning)
* **Goal**: Attacker tries to inject an invalid, custom pillar name to bypass standard business logic.
* **Payload**:
```json
{
  "userId": "attacker_uid",
  "userName": "Attacker",
  "userEmail": "attacker@example.com",
  "date": "2026-07-20",
  "timeSlot": "10:00 - 11:00",
  "pillar": "Highly Malicious Custom Consulting Service",
  "status": "pending",
  "createdAt": "request.time",
  "updatedAt": "request.time"
}
```

### Malicious Payload 7: Email Spoofing (Unverified Email Admin Escalation)
* **Goal**: Attacker logs in with an unverified email `christinagumpo@gmail.com` to gain admin permissions.
* **Payload**: Read or write operations where `request.auth.token.email == "christinagumpo@gmail.com"` but `request.auth.token.email_verified == false`.

### Malicious Payload 8: Immutable Field Hijacking (Altering pillar on Update)
* **Goal**: User attempts to update their existing booking to change the consulting pillar.
* **Payload**: An update that modifies the `pillar` field from "Compliance Mastery" to "Strategic Training".

### Malicious Payload 9: Shadow State Transition (Bypassing cancellation locks)
* **Goal**: A user tries to restore a cancelled booking back to `pending` or `confirmed` status without admin oversight.
* **Payload**: An update payload setting `status: "confirmed"` on a document where `existing().status == "cancelled"`.

### Malicious Payload 10: Anonymous Write Attack
* **Goal**: An unauthenticated or anonymous user attempts to write to the `bookings` collection.
* **Payload**: Any create operation where `request.auth == null` or `request.auth.providerId == "anonymous"`.

### Malicious Payload 11: Path Variable Poisoning (Malformed ID)
* **Goal**: Attacker targets a booking with a ridiculously long malformed ID or characters that cause storage indexing stress.
* **Payload**: Targeting booking document `/bookings/malformed-id-!!!!$$$$%%%%*****` with excessive length.

### Malicious Payload 12: Blanket Read Scraping
* **Goal**: An authenticated user attempts to run a query to list all bookings in the database without filtering by their own `userId`.
* **Payload**: Listing the `/bookings` collection without a query filter matching `resource.data.userId == request.auth.uid`.

---

## 3. The Test Runner Spec

A test suite verifying that all of the above payloads return `PERMISSION_DENIED` can be implemented using the `@firebase/rules-unit-testing` framework.

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { setDoc, getDoc, getDocs, collection, doc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gen-lang-client-0578677675',
    firestore: {
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Yitzak Booking Firestore Rules Test Suite', () => {
  // Test 1: Identity Spoofing must fail
  test('fails when user attempts to create booking for another user', async () => {
    const context = testEnv.authenticatedContext('attacker_uid', { email: 'attacker@example.com', email_verified: true });
    const db = context.firestore();
    const maliciousDoc = doc(db, 'bookings', 'booking_123');
    await expect(setDoc(maliciousDoc, {
      userId: 'victim_uid',
      userName: 'Victim',
      userEmail: 'victim@example.com',
      date: '2026-07-20',
      timeSlot: '10:00 - 11:00',
      pillar: 'Compliance Mastery',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    })).rejects.toThrow();
  });

  // Test 2: Self-confirming must fail
  test('fails when user attempts to set status to confirmed on creation', async () => {
    const context = testEnv.authenticatedContext('attacker_uid', { email: 'attacker@example.com', email_verified: true });
    const db = context.firestore();
    const maliciousDoc = doc(db, 'bookings', 'booking_124');
    await expect(setDoc(maliciousDoc, {
      userId: 'attacker_uid',
      userName: 'Attacker',
      userEmail: 'attacker@example.com',
      date: '2026-07-20',
      timeSlot: '10:00 - 11:00',
      pillar: 'Compliance Mastery',
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    })).rejects.toThrow();
  });

  // Additional tests omitted for brevity but represent the full implementation of the "Dirty Dozen" tests.
});
```
