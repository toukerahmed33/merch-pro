# Standard Group Procurement System — Operational & Deployment Guide

This document summarizes the complete end-to-end capabilities, state transition logic, and structural security rules for the production-ready Standard Group Procurement Systems applet.

---

## 📋 Table of Contents
1. [End-to-End Procurement Flow Guidelines](#1-end-to-end-procurement-flow-guidelines)
2. [Consultant Evaluation & Selection System](#2-consultant-evaluation--selection-system)
3. [Comprehensive Reporting & Multi-Document Export](#3-comprehensive-reporting--multi-document-export)
4. [Hardened Firebase Security Rules Specifications](#4-hardened-firebase-security-rules-specifications)
5. [Production Compilation & Optimizations](#5-production-compilation--optimizations)
6. [Step-by-Step Guide: Deploying to Firebase Hosting & Custom Domains](#6-step-by-step-guide-deploying-to-firebase-hosting--custom-domains)

---

## 1. End-to-End Procurement Flow Guidelines
The application operates on an authentic, highly dense multi-state transactional sequence designed for heavy industrial apparel purchasing (e.g., woven denims, knit fiber raw materials):

1. **Strategic Procurement Plan**: Sourcing begins by mapping out high-quantity seasonal buying goals (e.g., PLN models, quantity, budget limits). Monthly allocations are tracked inside dynamic interactive charts.
2. **Launch RFQ Request**: Sourcing coordinators draft and publish formal RFQs (Request For Quotation) documenting exact GSM requirements, fabric compositions, yarn-counts, and terms & conditions.
3. **Sequential Approvals & Signoffs**: RFQs are submitted to a multi-level sequential approval committee. Sourcing Leads, Procurement Managers, and CFOs must approve the target RFQ before it is dispatched.
4. **Outbound Vendor Dispatching**: Sourcing specialists identify compliant suppliers on our rating tier list matching compliance certs (Trade License, BIN, TIN, Solvency) and dispatch RFQs. In-app simulation records and outbound SMTP email logs are created.
5. **Bid Quotation Returns**: Suppliers bid on open RFQs, loading their unit pricing, shortest lead time, and customized advance payment clauses.
6. **Notice Of Award (NOA) Generation**: Sourcing committee selects the preferred quotation, automatically prompting a Notice of Award. Once the seller signs the NOA with a simulating electronic signature (storing IP Address and timestamp), the platform drafts a legally binding Purchase Contract.
7. **Purchase Contract Electronic Signature**: Sourcing Lead and Supplier Representative co-sign the Contract.
8. **Production Work Order & QC Inspection**: Mutual contract execution triggers a production Work Order (`Issued` status). Quality control (QC) inspectors conduct rigorous audit check runs. If defect ratios remain under AQL bounds, the order changes status to `QC Passed`.
9. **Three-Way Invoice Matching & Payments**: Financial dispatchers verify the Three-Way matching ledger. Invoice amount, Purchase Order (PO) amount, and actual delivered quantities are matched. Sourcing Leads, Managers, and CFOs proceed with digital disburser release approvals.

---

## 2. Consultant Evaluation & Selection System
For specialized non-goods consulting actions (such as commissioning carbon tracking, ESG roadmaps, and Enterprise SaaS ERP integrations):
* **Terms of Reference (ToR)**: Procurement creators establish standardized ToR rules specifying specific weight distributions (e.g., 70% Technical vs 30% Financial).
* **Bids Score Sheets**: Evaluators grade competing consultants across key technical criteria (e.g., industry experience, proposed methodology, team strength) and inputs their financial proposals.
* **Autonomous Calculation Engine**: The system dynamically calculates composite scores based on customized ToR weights, preventing manual spreadsheet errors.
* **Automated Sourcing Awarding**: Approving the top consultant automatically marks the Parent ToR status as "Awarded."

---

## 3. Comprehensive Reporting & Multi-Document Export
We have added a complete CSV spreadsheet export utility for **all transactional documents** inside the Comprehensive Reporting & Audit tab. Sourcing leaders can download full ledgers matching exactly their current page filters:
* **Sourcing Plans & Forecasts** (`procurement`)
* **Vendors Performance & Compliance** (`vendors`)
* **Consultants Evaluation Ledger** (`tors`)
* **Requests for Quotation (RFQs)** (`rfqs`)
* **Quotations (Received Bids)** (`quotations`)
* **Committee Sourcing Approvals** (`approvals`)
* **Notices of Sourcing Award (NOAs)** (`noas`)
* **Sourcing Purchase Contracts** (`contracts`)
* **Production Work Orders** (`workorders`)
* **QC Inspections Audit Trail** (`inspections`)
* **Invoice matching & Payments Ledger** (`payments`)

Each downloaded CSV uses RFC-compliant formatting containing exact keys, stringified cells, and status indicators.

---

## 4. Hardened Firebase Security Rules Specifications
Firestore security rules are fortified under attributes checking (`firestore.rules` deployed successfully):
* **Strict Email Verification Gates**: No writes (`create`, `update`, `delete`) are allowed unless `isEmailVerified()` is validated.
* **Path Variable ID Validation**: High-stakes ID targets are checked via a regex `isValidId()` helper, preventing ID spoofing or Denial of Wallet attacks.
* **Full Collection Enforcements**: Missing rule matches for `tors` and `evaluations` collections have been fully implemented, resolving the previous vulnerability where new consultant features would be blocked by the global safety net block.
* **Immutable Auditing**: Users cannot alter `createdAt` timestamps or tamper with historical records after creation.

---

## 5. Production Compilation & Optimizations
The source code is optimized for rapid client delivery and production build:
* **Pre-Render Safe**: Server-side rendering (SSR) vs client execution paths are fully decoupled.
* **No Image LCP flickers**: Large background visuals are loaded dynamically or matched through lightweight vector icons directly using standard `lucide-react` assets.
* **Zero build errors**: Next.js production build completes with strict TypeScript safety rules verified.

---

## 6. Step-by-Step Guide: Deploying to Firebase Hosting & Custom Domains

Deploy your system to production on Firebase Hosting with a custom domain using these production guidelines:

### Step 6.1: Prerequisite Global Configuration
Make sure you have Node.js and the Firebase CLI installed on your machine.
```bash
# Install Firebase CLI globally
npm install -g firebase-tools
```
Ensure you have authenticated with your Google Account:
```bash
firebase login
```

### Step 6.2: Set Up and Initialize Firebase in Your Workspace
Navigate to your project root and run:
```bash
firebase init
```
During the interactive setup prompts:
1. **Which Firebase CLI features do you want to set up?**
   Select `Hosting: Configure files for Firebase Hosting and (optionally) set up GitHub Actions deploys`.
2. **Project Setup**:
   Select `Use an existing project` and select your project (`ai-studio-8865c314-9148-497b-b0cc-1fe475d8912e` or current project ID).
3. **What do you want to use as your public directory?**
   Enter `out` (since Next.js static production export generates the site in the `out/` folder, or `public` if using fallback modes).
4. **Configure as a single-page app (rewrite all URLs to /index.html)?**
   Match `Yes` to guarantee Next.js client-side sub-routing operates without 404s.
5. **Set up automatic builds and deploys with GitHub?**
   `No` (optional).

### Step 6.3: Next.js Static Export Configuration
Open your project's `next.config.ts` (or `next.config.js`) and ensure output mode is set to `'export'`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Forces static HTML/CSS/JS generation on build
  images: {
    unoptimized: true, // Required for next/image inside fully static exports
  },
};

export default nextConfig;
```

### Step 6.4: Execute Production Build & Static Export
Run the package build script which compiles the application and outputs the production artifact to the `out` directory:
```bash
npm run build
```

### Step 6.5: Deploying Your Site to Production Hosting
With your static build successful, initiate direct Deployment:
```bash
firebase deploy --only hosting
```
Upon successful execution, the CLI prints your live hosting URL:
`Host URL: https://<your-project-id>.web.app`

### Step 6.6: Configuring a Custom Domain (e.g. `sourcing.standardgroup.com.bd`)
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Select your project and navigate to **Hosting** under the Build menu.
3. Click the **Add Custom Domain** button.
4. Input your target custom domain (e.g., `sourcing.standardgoup.com.bd`).
5. Choose whether to configure redirect behavior or direct mapping.
6. **DNS Verification**:
   Firebase will supply a unique **TXID DNS record** or point to standard A-records.
   Log into your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare, or corporate DNS manager) and add the records:
   * **Type**: `TXT` (First step for ownership verification) | **Value**: `google-site-verification=...`
7. **Mapping Traffic (A Records)**:
   Once ownership is verified, Firebase Hosting supplies two IP addresses.
   Add these as standard A records in your registrar panel pointing your subdomain or domain:
   * **Type**: `A` | **Host**: `sourcing` | **Value**: `<Firebase IP 1>`
   * **Type**: `A` | **Host**: `sourcing` | **Value**: `<Firebase IP 2>`
8. **Automatic SSL Provisioning**:
   Within 1 to 24 hours, Google will provision a free global SSL certificate (Let's Encrypt Partnership) for your domain automatically. Traffic is now encrypted and ready for Enterprise use!
