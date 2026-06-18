# React + Vite Deployment Troubleshooting Guide
**Hostinger · GitHub CI/CD · PocketBase Backend**

---

## 1. Root Cause Diagnosis

The live site issue is **almost certainly deployment/publish-path related - not PocketBase.**

PocketBase is a backend service. A frontend deployment failure (blank page, 403, assets not loading) occurs before the app even attempts to communicate with the backend. Resolve the deployment configuration first; only investigate PocketBase connectivity after the app is confirmed to be serving correctly.

### What a 403 on the Live URL Means

A **403 Forbidden** response at the live URL indicates that Hostinger can successfully reach the site but **is not serving the app from the correct root directory.** The web server found the directory but lacks the expected `index.html` entry point - which means the `dist/` output either wasn't generated, wasn't published to the correct path, or a stale site configuration is pointing to the wrong location.

---

## 2. Verify Hostinger Deployment Settings

Confirm every value below in your Hostinger deployment configuration. A single incorrect field is enough to cause a failed or misconfigured build.

| Setting | Required Value |
|---|---|
| **Framework preset** | Vite |
| **Branch** | `main` |
| **Node version** | `22.x` |
| **Root directory** | `./` |
| **Build command** | `npm run build` |
| **Package manager** | npm |
| **Output directory** | `dist` |

> ⚠️ **Output directory is critical.** Vite writes its production build to `dist/` by default. If this field is blank, incorrect, or set to `build/` (a React Create App convention), the deployment pipeline will publish the wrong directory - or nothing at all.

---

## 3. Environment Variables

No environment variables were added to this deployment. This is **not the likely root cause** of the current issue. If PocketBase connectivity problems arise after the app is confirmed live, revisit this section and add the appropriate `VITE_` prefixed variables (e.g. `VITE_PB_URL`).

> Vite only exposes variables prefixed with `VITE_` to the client bundle. Standard `REACT_APP_` prefixes do not apply.

---

## 4. Build Warnings - Compatibility Issues to Address

The following build warnings are **not blocking the build** but represent real compatibility problems that should be resolved before the next production release.

### ⚠️ React 19 Peer Dependency Conflicts

Several dependencies in this project declare peer dependency requirements against React 18 and will produce warnings (or silent failures) when resolved against React 19.

**Fix - Pin React to 18.3.1:**

In `package.json`, replace any `"latest"` or `"^19.x"` version references:

```json
"react": "18.3.1",
"react-dom": "18.3.1"
```

Then follow the clean reinstall steps in Section 5.

### ⚠️ `react-helmet` / `react-side-effect` Compatibility

`react-helmet` is unmaintained and incompatible with React 18+. It will produce warnings and may behave incorrectly.

**Fix - Replace with `react-helmet-async`:**

```bash
npm uninstall react-helmet
npm install react-helmet-async
```

Update all imports:

```js
// Before
import { Helmet } from 'react-helmet';

// After
import { Helmet, HelmetProvider } from 'react-helmet-async';
```

Wrap your app root with `<HelmetProvider>`:

```jsx
import { HelmetProvider } from 'react-helmet-async';

<HelmetProvider>
  <App />
</HelmetProvider>
```

---

## 5. Clean Reinstall & Redeploy

After making any dependency changes, always perform a clean reinstall rather than a standard `npm install`. Stale lockfile entries are a common source of silent build failures.

```bash
# 1. Remove installed packages and lockfile
rm -rf node_modules package-lock.json

# 2. Reinstall from package.json
npm install

# 3. Verify the build succeeds locally before pushing
npm run build

# 4. Confirm dist/ was generated
ls dist/
# Expected: index.html + assets/

# 5. Commit and push to main to trigger redeployment
git add .
git commit -m "fix: clean dependency reinstall, pin React 18, replace react-helmet"
git push origin main
```

> ✅ Never push a `node_modules/` directory to the repository. Confirm `.gitignore` includes `node_modules/` and `dist/`.

---

## 6. Check Deployment Logs

After pushing, monitor the deployment pipeline in hPanel:

1. Navigate to **Hosting → Your Plan → Git**
2. Open the most recent deployment entry
3. Confirm the build log shows:
   - Dependencies installed without errors
   - `vite build` completed successfully
   - `dist/` directory created and published to the web root
4. Any error here is the authoritative signal - it will identify whether the failure is a build error, a missing output directory, or a publish failure

If the build log shows success but the site still returns 403, the publish path is misconfigured (see Section 7).

---

## 7. Stale Website Configuration

> **This is a likely culprit if the app was previously set up differently on Hostinger.**

If this site was originally configured as a static site, a PHP site, or a different Node.js app on Hostinger, the old configuration may conflict with the current deployment.

**Steps to resolve:**

1. In hPanel, go to **Hosting → Websites**
2. Locate the domain associated with this project
3. **Remove** the existing website entry
4. **Re-add** it as a new Node.js app with the correct settings from Section 2
5. Trigger a fresh deployment from the Git panel

This ensures there is no stale document root, `.htaccess`, or publish-path override from a previous configuration interfering with the current setup.

---

## 8. Troubleshooting Checklist

Work through this list top-to-bottom before escalating.

- [x] Deployment settings match the table in Section 2 exactly
- [x] Output directory is set to `dist`
- [x] `node_modules` and `package-lock.json` deleted and regenerated locally
- [x] `react` and `react-dom` pinned to `18.3.1` in `package.json`
- [x] `react-helmet` replaced/removed (removed; SEO handled via lightweight custom hook)
- [x] Local `npm.cmd run build` completes without errors
- [x] `dist/index.html` exists after local build
- [x] Changes committed and pushed to `main`
- [ ] Hostinger deployment log shows successful build and publish
- [ ] If previously configured differently: old website entry removed and re-added as Node.js app
- [ ] Live URL returns 200 and renders the app shell

---

## 9. Quick Reference - Expected Build Output

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

If `dist/` does not contain `index.html` after running `npm run build`, the Vite config has an issue. Check `vite.config.js` for a custom `build.outDir` value that may override the default.

---

*Last updated: June 2026 · Applies to: React 18, Vite 5+, Hostinger Business Web Hosting, PocketBase 0.x*
