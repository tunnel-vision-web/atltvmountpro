# Go-Live Plan & Launch Readiness Roadmap
**Atlanta TV Mount PRO · Production Launch Plan**

This document outlines the comprehensive go-live roadmap, daily schedule, and checklist for deploying the Atlanta TV Mount PRO platform, including personalized dashboards, recruitment onboarding flows, and the technical support/accountability ecosystem.

---

## 1. Daily Implementation Schedule

To ensure a smooth release and keep changes manageable, development is structured into a **9-Day Schedule** mapping the core and support components:
 
 ```mermaid
 gantt
      title Go-Live Implementation Schedule
      dateFormat  YYYY-MM-DD
      section Phase 1: Core Admin & Metrics
      Admin Layout, Viewport Modals, Overview  :active, day1, 2026-06-18, 1d
      Financial Overview Metrics               :active, day1, 2026-06-18, 1d
      section Phase 2: Personalization & Checklists
      User-Specific Dashboard Filtering        :day2, 2026-06-19, 1d
      Interactive Onboarding Checklists        :day2, 2026-06-19, 1d
      section Phase 3: Support Logging
      Public Landing Page Support Form         :day3, 2026-06-20, 1d
      Client Dashboard Ticket Logging          :day3, 2026-06-20, 1d
      section Phase 4: Support Control Desk
      Admin Support Desk & Re-Dispatch         :day4, 2026-06-21, 1d
      Technician Rating (TQS) & Suspensions    :day4, 2026-06-21, 1d
      section Phase 5: Stripe Sandbox
      Hostinger Stripe Backend & Checkout      :day5, 2026-06-22, 1d
      Refund/Credit Processing Hooks           :day5, 2026-06-22, 1d
      section Phase 6: Sub-Tabs & Referrals
      Profile Tab Split (Users/Profile/Perms)  :day6, 2026-06-23, 1d
      Invite User System & CMS Footer          :day6, 2026-06-23, 1d
      section Phase 7: Go-Live
      Capacitor Mobile Packaging               :day7, 2026-06-24, 1d
      Hostinger Server Deployment & SSL        :day7, 2026-06-24, 1d
      section Phase 8: Store & Uniforms
      Apparel Store & Cart Checkout Drawer     :day8, 2026-06-25, 1d
      Uniform Onboarding & Paycheck Deduct     :day8, 2026-06-25, 1d
      section Phase 9: AI Assistance
      AI-Driven Admin "How-To" Guide           :day9, 2026-06-26, 1d
      section Phase 10: Autonomous Testing
      AI Testing Agent & Admin Trigger Desk    :day10, 2026-06-27, 1d
      section Phase 11: Partner Site SSO & CRM
      Partner SSO & Webhook Sync               :day11, 2026-06-28, 1d
 ```
 
 ### Day 1: Core Admin & Metrics (Completed)
- **Modals Viewport Boundaries**: Configured max height (`max-h-[90vh]`) and vertical scrollbar rules on all dialogs in [AdminPage.jsx](file:///C:/Users/judit/workspace/atltvmountpro_main/atltvmountpro-main/src/pages/AdminPage.jsx) (`TechFormDialog`, `UserFormDialog`, `editingOrder`, `selectedOrder`, and `selectedApplication`).
- **Overview Dashboard tab**: Created the default landing tab in the admin panel layout.
- **Financial Analytics Panel**: Integrated Gross Revenue, Number of Sales (Paid Invoices), Average Sale Value, and Outstanding Balance calculations, fully filterable by the timeframe dropdown selector.
 
 ### Day 2: Personalization & Onboarding Checklists
- **Dashboard Personalization**: Segment the Client Dashboard (`ClientDashboard.jsx`) to load views relevant to the user type:
   - **Customers**: Active and past bookings, invoicing receipts, and ticket options.
   - **Active Technicians**: Assigned daily routes, earnings tables, and availability scheduler.
   - **Recruits**: Step-by-step onboarding progress trackers.
- **Interactive Checklists**: 
   - **Pre-Approval checklist**: Submit Application status, double opt-in email check, background check consent, identity card photo upload, and phone screening status.
   - **Post-Approval checklist**: Safety handbook quiz, payout accounts settings, liability insurance upload, and bio photo setup.
 
 ### Day 3: Support Ticket Submission & Auto-Matching
- **Public Support Route (`/support`)**: Add a public support page with a clean form (Name, Email, Phone, Booking ID, Category, Description, and photo attachments) accessible from the landing page.
- **Intelligent Auto-Matching**: Match submitted tickets against active bookings by Email/Booking ID, linking them automatically to the booking and original technician. Unmatched entries are flagged as "unlinked" for manual admin triaging.
- **Header & Footer Links**: Update navigation headers and footers to link to `/support`.
 
 ### Day 4: Admin Support Desk & Performance Suspension
- **Admin Support Panel**: Create a dedicated Support Desk tab inside the admin portal sidebar to view, manage, and close tickets.
- **TQS Scoring & Accountability**: Linked ticket category results to deduct Technician Quality Score (TQS) points (e.g. -10 for workmanship complaints, -25 for no-shows).
- **Auto-Suspension Gate**: If a technician's score drops below 75 or they receive 2 complaints within 30 days, flag their profile `isSuspended: true`, locking them out of accepting bookings.
- **Re-Dispatch repair**: Provide options to assign repair jobs to another technician, issuing a premium repair payout.
 
 ### Day 5: Payments, Escrow & Refund Hooks
- **Stripe Checkout Sandbox**: Connect the checkout flows and Hostinger Stripe webhooks.
- **Escrow Hold lock**: Place payouts in escrow for 48 hours post-service. If an issue is logged, freeze the technician payout until ticket resolution.
- **Refund Hooks**: Trigger Stripe API refunds from the Admin support screen (full or partial) and update ledger entries.
 
 ### Day 6: Profile Segmentation & Referrals
- **Sub-Tabs Division**: Split the Admin "Profile & Users" tab into three distinct views:
   - **Users**: List of all system users with full editing capabilities.
   - **Profile**: Private admin card showing personal details and master key resets.
   - **Permissions**: granual checkbox access controls.
- **Invite Referral System**: Prefilled invite links for technicians to join the team, shared via SMS, WhatsApp, or email.
 
 ### Day 7: Mobile Apps & Live Hostinger Deploy
- **Mobile Packaging**: Set up Capacitor configuration and link App Store and Google Play badges on the homepage.
- **Production Server setup**: Deploy build assets to Hostinger via Git pipelines, enable SSL certificate paths, and set up database backups.

### Day 8: E-Commerce Store & Uniform Onboarding
- **Public storefront (`/store`)**: Added a category-filtered shop selling branded polo shirts ($19.99 for customers, $10.00 for technicians) and mounting accessories with a slide-out cart drawer.
- **Stripe Sandbox & Order Records**: Embedded checkout drawer supporting shipping speed choices and processing sandbox payments, logging order items and addresses into `atltv_store_orders` in localStorage.
- **Technician Uniform Onboarding**: Integrated a 6th step into the approved recruit's checklist for uniform ordering (sizing, shipping speeds). Orders are logged in `atltv_uniform_orders` and total cost ($30 + shipping fee) is automatically deducted from their first paycheck as a negative commission row in their earnings ledger.
- **Admin Store Manager**: Created an admin manager sub-panel with product CRUD, category creation, customer order status toggles, and technician uniform shipment tracking.

### Day 9: AI-Driven Admin "How-To" Guide & Assistant (Tivo)
- **AI Backend Assistant (Tivo)**: A context-aware chatbot and action assistant embedded in the Admin portal that answers operational questions, suggests guides, and assists in navigation. It is branded as a friendly android named Tivo, represented by an icon in a flat design style using theme colors (dark blue, black, and amber accents) depicting a robot with a digital TV head holding a wrench, showing a happy digital smiley face on its screen.
  
  ![Tivo Assistant Icon](file:///C:/Users/judit/.gemini/antigravity/brain/7c398f6a-2be9-4277-8e0a-f77c62109990/tivo_flat_icon_1782228698511.png)

- **Context-Aware Integration**: The assistant reads the active tab state (`activeTab`, `storeSubTab`, role permissions, etc.) and suggests relevant help articles, e.g., if on the "Integrations" sub-tab, it provides instructions on retrieving API keys or triggering catalog syncs.
- **AI Frontend Model Integration**: Connects to the local/server LLM endpoint, feeding it the current page schema, user role, and operation history to produce natural language guidance and step-by-step walk-throughs.
- **Deep-Linked Quick Actions**: Allows Tivo to perform direct actions on behalf of the user, such as "Take me to CRM tab", "Show pending uniform orders", or "Run Wholesale2B sync" with single-click triggers.
 
### Day 10: AI Testing Agent & Admin Trigger Desk
- **Autonomous QA Agent**: Implement an advanced AI testing agent configured to assimilate client, technician, recruit, and admin user types, traversing all workflows on both the front and backend (E2E testing).
- **Dual-Mode Sandbox & Live Runs**: Setup the agent with dual testing boundaries:
  - **Local/Staging Sandbox**: Full E2E flows with sandbox credentials and mock services.
  - **Production Smoke Testing**: Non-destructive live testing (e.g. read-only checks, simulated ticket logs with auto-cleanup flags) to verify production system integrity without polluting live ledger transactions.
- **Admin Control Desk**: Embed a manual execution dashboard inside the Admin portal allowing administrators to trigger agent sweeps, select target personas, view real-time traversal live-feeds, and check comprehensive reports directly from the UI.

### Day 11: Partner Site SSO & CRM Data Synchronization (Phase 11)
- **Single Sign-On Integration**: Configured PocketBase custom OIDC client auth mapping pointing to Intermaven Identity Provider routes. Added "Login with Intermaven" button in the customer and technician entry modals.
- **Unified CRM Sync Webhooks**: Configured automated payload dispatch to Intermaven `/api/crm/ingest` during bookings confirmation, support ticket logging, and quote inquiries creation.
- **Iframe Widget Mounting**: Added "Partner Apps" panel in the admin sidebar to embed Intermaven's Brand Kit and Social AI tools with postMessage communication logic.
 
 ---
 
 ## 2. Launch Readiness Checklist

- [ ] Production compilation (`npm run build`) completes successfully.
- [ ] Connect PocketBase server with live API credentials (`VITE_POCKETBASE_API_URL`).
- [ ] Verify SSL configurations and Hostinger Node.js application startup files.
- [ ] Run backend migrations to create the `support_tickets` and `onboarding_status` tables.
- [ ] Seed base system users (Admins, Accountants, Moderators) with custom dashboard permissions.
- [ ] Set Stripe variables (`VITE_STRIPE_PUBLIC_KEY`) in the client `.env` files.
- [ ] Validate AI Testing Agent suite connectivity and verify trigger sweeps from the Admin portal.

---

## 3. Hardware & AV E-Commerce Integration Strategy

To support the public storefront and technician fulfillment, a dual-integration strategy will be deployed for product sourcing, inventory synchronization, and order fulfillment:

### Phase 1: Client-Facing AV & Accessory Dropshipping
For high-margin, lightweight accessories sold directly to clients (TV wall mounts, HDMI cables, soundbar brackets, and LED backlights):
- **Integration Partners**: **Wholesale2B** and **Petra Industries** (with brand options like Monoprice and Peerless-AV).
- **Workflow & APIs**:
  - Implement a background cron job (Node.js/PocketBase) that queries the supplier's product feeds.
  - Automatically sync product details, images, stock levels, and retail pricing directly into our `atltv_store_products` database.
  - Configure blind/white-label shipping via the supplier API during checkout so items are shipped directly to clients under the "Atlanta TV Mount PRO" brand.

### Phase 2: Pro Procurement for Heavy Consumables & Installation Tools
For tools and heavy consumables (drywall mud, joint compound, paint, screws, wall anchors, and drills) where standard dropshipping is cost-prohibitive due to weight:
- **Consumables & Fasteners**: Partner with industrial distributors like **Grainger** or **McMaster-Carr** using their B2B punchout APIs (cXML/EDI) to order fasteners and custom hardware in bulk or next-day shipping.
- **Local On-Demand Procurement**: Integrate with **Home Depot Pro** / **Lowe's Pro** APIs. When a job is booked or a technician logs a site request for drywall mud or paint:
  - The system automatically adds the items to a job-specific purchase order.
  - The order is placed programmatically via the Home Depot Pro / Lowe's Pro API for local store pickup or flatbed delivery directly to the customer's site.
- **Hand Tools & Safety Gear**: Establish dealer accounts with specialized wholesale suppliers like **Grip Tight Tools** to supply technician toolkits.

---

## 4. Secure 2030 OTP-Based Password Reset Protocol

To protect customer, technician, and administrator accounts while avoiding obsolete email link expiration issues, a unified **OTP-based Verification & Reset Protocol** is implemented:

### Workflow & Security Gates:
1. **Entry Portals**:
   - **Administrators**: Standalone reset route integrated into the `/admin` login view.
   - **Clients & Technicians**: Unified auth modal (`ClientAuthModal`) triggered from the header and onboarding pages.
2. **Identification & Code Generation**:
   - The user requests a reset by entering their registered email.
   - For real accounts, the system triggers the PocketBase SMTP reset request (`pb.collection("users" | "clients").requestPasswordReset(email)`) alongside a 6-digit OTP verification code.
   - For mock/demo accounts (ending in `@example.com` or containing `mock`), the system simulates the dispatch and outputs a bypass toast notification to ensure developer flexibility.
3. **Multi-Input Verification**:
   - Displays a secure 6-digit inline verification panel with auto-focus shifting and backspace navigation logic.
   - Validates the input against the cryptographically generated OTP (or standard bypass code `123456`).
4. **Credential Upgrades**:
   - On successful verification, allows the user to define a new password (min 8 characters).
   - Updates the live database (or `localStorage` mock users ledger `atltv_local_users`), returning the user to the standard Sign In flow.


---

## 5. Partner Music Portal Rebranding & Regional Localization Sync

To support global rollout and multicultural creative workflows, the partner music portal integrations and regional rules have been updated:
1. **Branding & Domain Update**:
   - The partner music ecosystem portal previously known as `intermavenmusic.com` or `music.intermaven.io` has been rebranded to **TuneMavens** (`tunemavens.com`).
   - The portal is hosted on a **Hostinger VPS** using Nginx reverse proxy and Certbot SSL, matching the core deployment architecture.
2. **Regional Payment & Visual Localization**:
   - For Western locations (US, Canada, UK, Europe), all references to M-Pesa are hidden and replaced with local options (Venmo, Cash App, Zelle in US/CA; card, Apple Pay, Google Pay in UK/EU).
   - Cloned multicultural Western cityscape (Atlanta) and creative studio backgrounds are served dynamically via the `imageRegistry.js` proxy based on the user's geo-detected country.
3. **SSO & Integration Sync**:
   - The SSO and webhook flows configured on PocketBase have been updated to point to the new OIDC client routes at `tunemavens.com` (formerly `music.intermaven.io`), ensuring seamless cross-platform authentication handshakes.


