/**
 * Dirty Dozen Security Payload Verification Cases for PureCrest Firestore Rules.
 * Validates client-side payload sanitization invariants against firebase-blueprint.json.
 */

export interface DirtyDozenCase {
  name: string;
  collection: string;
  expectedOutcome: 'PERMISSION_DENIED';
  rationale: string;
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    name: 'Shadow field injection on booking creation',
    collection: 'bookings',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidBooking enforces keys().hasOnly(...) rejecting arbitrary fields like isPaid.',
  },
  {
    name: 'Self-assigned admin role on user profile',
    collection: 'users',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidUserProfile excludes role/isAdmin from allowed keys.',
  },
  {
    name: 'Unverified email spoofing bootstrapped admin',
    collection: 'siteContent',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isVerifiedUser requires request.auth.token.email_verified == true.',
  },
  {
    name: 'Orphaned booking referencing missing listing',
    collection: 'bookings',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'Create rule checks exists(/databases/$(database)/documents/listings/$(incoming().listingId)).',
  },
  {
    name: 'Cross-user booking enumeration',
    collection: 'bookings',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'allow list restricts resource.data.userId == request.auth.uid || isAdmin().',
  },
  {
    name: 'Document ID poisoning with path traversal or oversized key',
    collection: 'listings',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidId enforces ^[a-zA-Z0-9_\\-]+$ and <= 128 chars.',
  },
  {
    name: 'Client-forged confirmed booking status',
    collection: 'bookings',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'Customer booking create mandates incoming().status == pending.',
  },
  {
    name: 'Terminal state re-opening on cancelled booking',
    collection: 'bookings',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'Customer updates require existing().status in [pending, confirmed].',
  },
  {
    name: 'Backdated client timestamp on inquiry create',
    collection: 'inquiries',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'Rules mandate createdAt == request.time and updatedAt == request.time.',
  },
  {
    name: 'Non-admin CMS siteContent mutation',
    collection: 'siteContent',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'siteContent create/update/delete require isAdmin().',
  },
  {
    name: 'Value poisoning on allowed booking status key',
    collection: 'bookings',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'isValidBooking(incoming()) wraps the entire allow update block.',
  },
  {
    name: 'Blanket list read on private user profiles',
    collection: 'users',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'users allow list is restricted exclusively to isAdmin().',
  },
  {
    name: 'Owner self-approval on listingSubmissions',
    collection: 'listingSubmissions',
    expectedOutcome: 'PERMISSION_DENIED',
    rationale: 'listingSubmissions create mandates status == pending and updates are restricted to isAdmin().',
  },
];
