# Development & Git Deployment Protocol
**Atlanta TV Mount PRO · Core Engineering & Release Policies**

This protocol governs all local code modifications, database schema updates, and Git pushes to the `main` branch to guarantee 100% build stability and zero live server downtime.

---

## 📋 The Three Golden Rules

### 1. Always Test Compile Locally Before Pushing
Never push changes directly to `main` without validating that the bundle builds cleanly. Hostinger will run the build script automatically on the server, and a syntax or typescript error will cause the live website to break or fail to update.
* **Verification Command**:
  ```bash
  npm.cmd run build
  ```
* **Protocol**: Only commit and push files if the output says `✓ built in X.XXs` and generates the `dist/` directory successfully.

### 2. Export and Sync PocketBase Schema Changes
If your local development requires modifications to the database (adding tables, renaming fields, altering validation rules, or changing permissions):
1. Make the changes inside your local PocketBase Admin UI (`http://127.0.0.1:8090/_/`).
2. Run the schema exporter tool from the project root:
   ```bash
   node tools/export-schema.js
   ```
3. Stage and commit the updated `pb_schema.json` alongside your code modifications.
4. Log into the live PocketBase Admin panel online, navigate to **Settings → Import collections**, load the updated `pb_schema.json`, and click **Import**.
* **Protocol**: Schema changes must be imported into the production database *before* or *immediately after* the Git code is deployed on the server.

### 3. Maintain Strict Environment Isolation
To prevent local testing credentials or addresses from leaking into production, keep development and production configurations separated:
* **Local Development**: Configured in [.env](file:///C:/Users/judit/workspace/atltvmountpro_main/atltvmountpro-main/.env)
  * Points to local database: `VITE_POCKETBASE_API_URL=http://127.0.0.1:8090`
* **Production Build**: Configured in [.env.production](file:///C:/Users/judit/workspace/atltvmountpro_main/atltvmountpro-main/.env.production)
  * Points to live server reverse proxy: `VITE_POCKETBASE_API_URL=/hcgi/platform`
* **Protocol**: Never edit or merge the contents of `.env.production` into `.env`. Do not include database keys or credentials in either file.

### 4. Execute AI Agent Traversal Validation
Prior to any release or database migration, trigger the AI Testing Agent.
* **Sandbox Verification**: Execute the full customer/technician/recruit traversal loops locally. Ensure all mocked transactions succeed.
* **Production Verification**: Post-deployment, execute a manual Production Smoke Test sweep from the Admin Trigger Desk. Verify that the agent runs successfully and that all system-smoke data is auto-purged without error.

---

## 🛠️ Quick Diagnostics Checklist
* **404 Page Not Found on live sub-routes?** Ensure [public/.htaccess](file:///C:/Users/judit/workspace/atltvmountpro_main/atltvmountpro-main/public/.htaccess) is present in the repository so Apache routes requests back to `index.html`.
* **API Calls failing with CORS or Network Error in Production?** Verify that the production server build has compiled with `.env.production` active and that the PocketBase API is running behind `/hcgi/platform`.
