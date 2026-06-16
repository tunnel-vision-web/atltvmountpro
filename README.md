# Atlanta TV Mount Pro

React + Vite marketing site and administrative portal for Atlanta TV Mount Pro.

## Project Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   cmd /c "set PORT=3000&& set BASE_PATH=/&& npm run build"
   ```

4. **Preview the production build**:
   ```bash
   npm run start
   ```

---

## Environment Variables

Create a `.env` file at the repository root with:

```env
VITE_POCKETBASE_API_URL=http://localhost:8090
VITE_API_SERVER_URL=http://localhost:3000
```

If you do not set these variables, defaults are used:
- PocketBase: `/hcgi/platform`
- API server: `/hcgi/api`

---

## Key Features & Improvements Added

### 1. Unified Projects Showcase
- **Projects Showcase Manager**: Full CRUD dashboard under the Admin **Projects Showcase** tab.
- **Automatic Local Seeding**: Seeds 6 default projects (with descriptions, tags, and thumbnails) on initial admin login.
- **"Featured on Landing Page" Toggle**: Intuitive toggle to select spotlight projects on the landing page, marked with a "Featured" badge in tables and dynamically loaded in the homepage's showcase grid (falling back to the first 3 if none are selected).
- **Hybrid Storage Fallbacks**: Public project lists (`/projects`) and details page (`/projects/:id`) fall back to local storage cache before returning errors when offline or in mock mode.

### 2. Dynamic Core Services via CMS
- **CMS Services Page Module**: Fully managed list of services stored under a `services` CMS page configuration.
- **Services CMS Editor**: Custom CMS editor panel to add new services, delete custom ones, edit title, taglines, summary descriptions, detailed specifications, benefits bullet lists, images, videos, and Lucide icon mappings.
- **Dynamic Icon Mapping**: Automatically maps CMS icon identifier strings to Lucide React components dynamically, allowing admins to change service icons at will.
- **Dynamic Public Pages**: Both the homepage services grid and the public `/services` page load service lists dynamically from the CMS hook.

### 3. Finance & Accountant Suite
- **Ledger & Invoices Panel**: Access-controlled billing page that lists all invoices generated from jobs.
- **Digitized Calculations**: Auto-calculates Subtotal, 7% Georgia Sales Tax, and Total on invoice creation, edits, and payments.
- **Digital Receipts**: Generates automatic digital receipts for paid invoices containing transaction IDs, payment methods, and payment dates.
- **Invoice & Receipt Viewers**: Pop-up modals that allow viewing, downloading, and printing invoices or receipts.
- **Tax Reporting & Analytics**: Accountant-friendly reports detailing gross revenue, net service revenue, sales tax collected, outstanding liabilities, and payment breakdown metrics filtered by year and quarter.

### 4. Role-Based Access Control (RBAC)
- **Role Permissions**:
  - `Admin`: Unlocked access to all dashboards (CRM, CMS, Finance, Projects, Team, Profile, Media).
  - `Moderator`: Access to CRM, Projects, and Team. Page content edits, finance, and user administration are locked.
  - `Accountant`: Access strictly gated to the Finance and Tax Reporting suite. Sidebar options for other modules are hidden.
  - `Viewer`: Read-only access across the entire admin panel. Edits, deletions, status changes, and creation forms are disabled.
- **Mock Account Quick-Switching**: Built-in login triggers using mock credentials (`admin123`, `mod123`, `view123`, `tax123`) to preview roles instantly in local/offline modes.

---

## Technical & Architecture Policies

### 1. Offline & Mock Stability (Dual-Fallback Strategy)
- All network fetches (projects, bookings, quote inquiries, team techs, and CMS pages) must use a catch block that queries the local storage database (e.g. `atltvmountpro_local_projects`, `atltvmountpro_cms_data`).
- Changes made in the admin panel are synchronously saved to local storage caches, ensuring mock mode and backend-offline states work seamlessly.

### 2. Database Schema & Cache Migrations
- Whenever CMS page schemas change, a migration script must be added inside the hook loader (e.g., `getLocalCMS()` in `useCMS.js`) to automatically patch missing nodes or correct legacy path configurations on client browsers instantly.

### 3. Dynamic Icons Mapping
- Services and elements containing customizable icons store their icon name as a string (e.g., `"Tv"`, `"Wrench"`).
- Resolved dynamically on render via `* as Icons` from `"lucide-react"` to prevent bundle bloating and allow easy addition of new icon keys in select boxes.

---

## UI & Design System Policies

### 1. Aesthetic Identity
- **Dark-Mode Glassmorphism**: High-end styling matching the dark blue/black glassmorphic palette. Use rounded container styles (`rounded-xl` / `rounded-2xl`), semi-transparent borders (`border-border`), and vibrant hover indicators.
- **Responsive Navigation**: Sidebar navigation must collapse into a mobile drawer (sheet) on smaller screens with a clean overlay to preserve workspace space.

### 2. Animations & Interaction States
- All interactive elements (buttons, project cards, service rows, list actions) should include hover effects (e.g. `hover:-translate-y-0.5`, transition durations) and micro-interactions on click (`active:scale-[0.98]`) to feel responsive.

### 3. Print Optimizations (`@media print`)
- Financial documents (invoices, receipts, tax reports) must feature a tailored `@media print` style block that:
  - Hides sidebars, action buttons, close dialog controls, and headers.
  - Adjusts background colors and border outlines to ensure legibility on white paper.
  - Adjusts spacing and dimensions to prevent cutoffs or excessive blank space when printing.
