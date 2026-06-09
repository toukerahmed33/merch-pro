# Security Specifications & Hardened TDD for Apparel Sourcing App

## 1. Data Invariants
1. **Authenticated Users ONLY**: No anonymous or unauthenticated access is permitted. Users must have a validated, verified email address (`email_verified == true`).
2. **Strict Identity Bounds**: Sourcing fields (e.g., requestedBy) must perfectly match the authenticated user UID or verified author details.
3. **Immutable Auditing**: Historic audit structures (such as `createdAt` or initial creator uids) cannot be modified after initial creation.
4. **Valid Formats and Scopes**: Integers, numbers (such as cost, ratings, and compliance), dates, and status codes must comply with defined boundaries.

## 2. The "Dirty Dozen" Payloads
These payloads represent malicious attempts to bypass security rules:
- **P1: Unauthenticated Create**: Registering a vendor without being signed in.
- **P2: email_verified Bypassing**: Creating an RFQ with `email_verified: false` in token.
- **P3: Spoofed Lead Writer ID**: Creating a quotation with a mismatched `vendorId`.
- **P4: Modifying Immutable createdAt**: Tampering with existing work orders' historical timestamps.
- **P5: State Shortcutting**: Forcing a work order status straight to `Completed` instead of progressing from `Issued`.
- **P6: PII Scraping**: Attempting to query `vendors` or private records with custom admin parameters.
- **P7: Ghost Field Injection**: Writing a vendor with an unwhitelisted property `isPromoted: true`.
- **P8: ID Poisoning Attack**: Trying to write a document with an ID exceeding 128 characters or containing junk symbols.
- **P9: Non-numeric Defect Rates**: Writing a QC inspection report with string value `"low"` for `defectRate`.
- **P10: Out-of-bounds Rating**: Submitting a compliance score of `15.0` on a 10.0 max scale.
- **P11: Budget Spoofing**: Attempting to alter locked budget values on procurement plans.
- **P12: Blanket List Read**: Listing all approvals without specifying user ownership limits.

## 3. Test Runner
We implement Firestore rules testing to ensure all Dirty Dozen payloads return `PERMISSION_DENIED`.
All rules must enforce high-security gates prior to relational document checks.
