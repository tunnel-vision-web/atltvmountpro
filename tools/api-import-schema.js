import fs from 'node:fs';

async function run() {
  try {
    // 1. Authenticate as superuser
    console.log("Authenticating as superuser...");
    const authRes = await fetch("http://127.0.0.1:8090/api/collections/_superusers/auth-with-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: "admin@atltvmountpro.com",
        password: "password123"
      })
    });
    
    if (!authRes.ok) {
      throw new Error(`Auth failed: ${await authRes.text()}`);
    }
    
    const authData = await authRes.json();
    const token = authData.token;
    console.log("Authenticated successfully.");

    // 2. Read and filter pb_schema.json
    const schemaRaw = fs.readFileSync('pb_schema.json', 'utf8');
    const collections = JSON.parse(schemaRaw);

    // Normalize system field to boolean
    collections.forEach(c => {
      c.system = (c.system === 1 || c.system === true);
    });

    // Filter out read-only system collections that start with "_"
    // Note: "users" has name "users", so it will be kept.
    const filteredCollections = collections.filter(c => {
      return !c.name.startsWith("_");
    });

    console.log("Filtered collections to import:", filteredCollections.map(c => c.name));

    // 3. Import schema via API
    console.log("Sending import request to PocketBase...");
    const importRes = await fetch("http://127.0.0.1:8090/api/collections/import", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify(filteredCollections)
    });

    if (!importRes.ok) {
      throw new Error(`Import failed: ${await importRes.text()}`);
    }

    console.log("Import success:", await importRes.text());
  } catch (err) {
    console.error("Error importing schema:", err.message);
  }
}

run();
