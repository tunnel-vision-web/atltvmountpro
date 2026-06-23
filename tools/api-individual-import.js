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

    // 2. Read pb_schema.json
    const schemaRaw = fs.readFileSync('pb_schema.json', 'utf8');
    const collections = JSON.parse(schemaRaw);

    // Normalize system fields to boolean
    collections.forEach(c => {
      c.system = (c.system === 1 || c.system === true);
      if (c.fields) {
        c.fields.forEach(f => {
          f.system = (f.system === 1 || f.system === true);
          f.required = (f.required === 1 || f.required === true);
          if (f.hidden !== undefined) f.hidden = (f.hidden === 1 || f.hidden === true);
          if (f.presentable !== undefined) f.presentable = (f.presentable === 1 || f.presentable === true);
        });
      }
    });

    // 3. Create or update each collection
    for (const c of collections) {
      if (c.name.startsWith("_") && c.name !== "users" && c.name !== "_pb_users_auth_") {
        // Skip system collections
        continue;
      }

      if (c.name === "users") {
        console.log(`Updating users collection fields...`);
        const getRes = await fetch("http://127.0.0.1:8090/api/collections/users", {
          headers: { "Authorization": token }
        });
        if (!getRes.ok) {
          console.error(`Failed to fetch users collection: ${await getRes.text()}`);
          continue;
        }
        const currentUsersCol = await getRes.json();
        
        // Add our custom fields if not present
        const customFields = c.fields.filter(f => !f.system);
        customFields.forEach(f => {
          if (!currentUsersCol.fields.some(cf => cf.name === f.name)) {
            currentUsersCol.fields.push(f);
            console.log(`Adding custom field to users: ${f.name}`);
          }
        });

        const updateRes = await fetch(`http://127.0.0.1:8090/api/collections/users`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          },
          body: JSON.stringify({
            fields: currentUsersCol.fields
          })
        });

        if (!updateRes.ok) {
          console.error(`Failed to update users collection: ${await updateRes.text()}`);
        } else {
          console.log(`Successfully updated users collection.`);
        }
        continue;
      }

      console.log(`Creating collection: ${c.name}...`);
      const createRes = await fetch("http://127.0.0.1:8090/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(c)
      });

      if (!createRes.ok) {
        console.error(`Failed to create collection ${c.name}: ${await createRes.text()}`);
      } else {
        console.log(`Successfully created collection: ${c.name}`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
