import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

console.log("Starting Users Migration for Custom Permissions...");

try {
  db.prepare("ALTER TABLE users ADD COLUMN custom_permissions TEXT DEFAULT '{}'").run();
  console.log("Column custom_permissions added to users table.");
} catch (e) {
  console.log("Column custom_permissions check/skipped:", e.message);
}

try {
  const row = db.prepare("SELECT * FROM _collections WHERE name='users'").get();
  if (row) {
    const fields = JSON.parse(row.fields);
    const hasField = fields.some(f => f.name === 'custom_permissions');
    if (!hasField) {
      fields.push({
        "id": "json_custom_permissions",
        "name": "custom_permissions",
        "type": "json",
        "required": false,
        "system": false
      });
      db.prepare("UPDATE _collections SET fields = ? WHERE name = 'users'").run(JSON.stringify(fields));
      console.log("PocketBase users metadata updated successfully.");
    } else {
      console.log("custom_permissions already in users metadata.");
    }
  }
} catch (e) {
  console.error("Failed to update users metadata:", e.message);
}

console.log("Users Migration Finished.");
