# PureCrest Security Specification & Dirty Dozen TDD

## 1. Data Invariants
1. **Default-Deny Baseline**: Every path not explicitly matched is denied for all reads and writes.
2. **Identity & Email Verification**: All authenticated mutations require `request.auth != null && request.auth.token.email_verified == true`.
3. **Bootstrapped & Registry Admin**: Admin privileges belong exclusively to the verified runtime owner email (`purecresthospitality@gmail.com`) or UIDs present in `/admins/{uid}`. Clients can never self-assign admin privileges on `/users/{userId}`.
4. **Booking Integrity**: A booking cannot exist without a valid `listingId` pointing to an existing document in `/listings/{listingId}`. Customer bookings must initialize with `status == 'pending'` and `userId == request.auth.uid`.
5. **Terminal State Locking**: Once a booking reaches `'completed'` or `'cancelled'`, non-admin users cannot transition or modify it.
6. **PII Isolation & Query Enforcement**: `/users/{userId}`, `/bookings/{bookingId}`, and `/inquiries/{inquiryId}` contain PII (`email`, `phone`). Both `get` and `list` enforce `resource.data.userId == request.auth.uid || isAdmin()` (or `userId == request.auth.uid`).
7. **Temporal & Immutable Field Integrity**: `createdAt` must equal `request.time` on creation and never change on update; `updatedAt` must equal `request.time` on both creation and update.
8. **Strict Key & Size Enforcement**: Every entity validation helper enforces `hasAll` + `hasOnly` on creation, `affectedKeys().hasOnly(...)` on update, and `.size()` bounds on every string and array.
9. **Owner Listing Submission Moderation**: Authenticated users may create `/listingSubmissions/{submissionId}` exclusively with `ownerUid == request.auth.uid`, `status == 'pending'`, `adminNotes == ''`, and `publishedListingId == ''`. Only Admins can approve/reject submissions or publish them into `/listings/{listingId}`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Shadow Field Injection on Booking Create**: `{ ..., "isPaid": true }` -> Blocked by `hasOnly(...)`.
2. **Self-Assigned Admin Role on User Profile**: `{ "uid": "u1", "role": "admin", ... }` -> Blocked by `hasOnly(...)` on `UserProfile`.
3. **Email Spoofing Without Verification**: `auth: { uid: "attacker", token: { email: "purecresthospitality@gmail.com", email_verified: false } }` -> Blocked by `email_verified == true`.
4. **Orphaned Booking With Non-Existent Listing**: `{ ..., "listingId": "nonexistent_999" }` -> Blocked by `exists(/databases/.../listings/nonexistent_999)`.
5. **Cross-User Booking Read / Scrape**: Signed-in user `u2` calls `list` or `get` on `/bookings` where `userId == "u1"` -> Blocked by `resource.data.userId == request.auth.uid || isAdmin()`.
6. **ID Poisoning**: Document ID `"x".repeat(300)` or `"../../admins/u1"` -> Blocked by `isValidId(id)`.
7. **Client-Forged Booking Status Jump**: Customer creates booking with `status: "confirmed"` -> Blocked by `incoming().status == 'pending'`.
8. **Terminal State Re-opening**: Customer attempts to change a `'cancelled'` booking back to `'pending'` -> Blocked by terminal state check.
9. **Client-Forged Timestamp Backdating**: Customer creates inquiry with `createdAt: Timestamp(2020-01-01)` -> Blocked by `incoming().createdAt == request.time`.
10. **Non-Admin CMS Tampering**: Customer attempts `update` on `/siteContent/main` or `/listings/{id}` -> Blocked by `isAdmin()`.
11. **Self-Approved Listing Submission**: Owner submits `/listingSubmissions/{id}` with `status: "approved"` -> Blocked by `incoming().status == 'pending'` and Admin-only update guard.
12. **PII Blanket Read on Users**: Signed-in user `u2` attempts `list` on `/users` -> Blocked because `list` on `/users` is denied for non-admins.
