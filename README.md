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
- Node + npm are not currently installed in this environment, so I could not run the local build.
