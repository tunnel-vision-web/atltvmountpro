# ATL TV Mount PRO

React + Vite marketing site for ATL TV Mount PRO.

## Project setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build:
   ```bash
   npm run start
   ```

## Environment variables

Create a `.env` file at the repo root with:

```env
VITE_POCKETBASE_API_URL=https://your-pocketbase.example.com
VITE_API_SERVER_URL=https://your-api.example.com
```

If you do not set these variables, defaults are used:
- PocketBase: `/hcgi/platform`
- API server: `/hcgi/api`

## Key improvements applied

- **Admin Side Panel Navigation**: Replaced top header layout in the Admin page with a modern, collapsible left-hand sidebar navigation featuring flat Lucide icons.
- **Orders & Bookings Management**: Added a tracking dashboard for online appointment bookings (`appointment_bookings` PocketBase collection) and dynamic quote estimator submissions (`quote_inquiries` PocketBase collection). Includes status filters (Pending, Confirmed, Completed, Cancelled), client search, detail views, and record deletion.
- **Team Technician Management**: Created a dynamic directory manager for technicians. Admin users can create, edit, and delete tech profiles (name, skills, bio, photo URL) stored in `team_members` PocketBase collection.
- **Dynamic Team Page Rendering**: Updated the public `/team` page to fetch from PocketBase dynamically, automatically falling back to static lists if PocketBase is not configured or offline.
- **Profile & User Management**: Added settings to reset admin access keys, edit administrator profile details, and manage supplementary users inside the admin console.
- **Hybrid Storage Fallbacks**: Added local storage replication so all new features work seamlessly out of the box in mock mode even when PocketBase services or API backends are unavailable.
- Renamed modal state context from `AuthContext` to `UIContext`
- Updated context imports and hook usage to `useUI` / `UIProvider`
- Made PocketBase endpoint configurable via `VITE_POCKETBASE_API_URL`
- Made API server URL configurable via `VITE_API_SERVER_URL`
- Added default `<title>` and `<meta name="description">` to `index.html`
- Expanded Vite `allowedHosts` to include local development hosts
- Removed `|| true` from the build script so build failures are visible
- Fixed `generate-llms.js` route extraction logic for Map usage

## Notes

- No `README.md` existed before; added it for onboarding and env setup.
- Dual LocalStorage / PocketBase fallbacks are integrated to ensure preview stability under any configuration.
