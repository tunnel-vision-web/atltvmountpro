import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

try {
  // 1. Get users table columns info
  const pragma = db.prepare("PRAGMA table_info(users)").all();
  console.log("USERS SCHEMA:");
  pragma.forEach(col => console.log(` - ${col.name}: ${col.type}`));

  // 2. Get existing user rows
  const rows = db.prepare("SELECT id, username, email, role, custom_permissions, created FROM users").all();
  console.log("\nEXISTING USERS:", rows);
} catch (e) {
  console.error("Error:", e.message);
}
