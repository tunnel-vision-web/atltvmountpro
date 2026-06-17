import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

try {
  const rows = db.prepare("SELECT id, email, role, custom_permissions FROM users").all();
  console.log("USERS IN DATABASE:");
  console.log(rows);
} catch (e) {
  console.error("Error inspecting users:", e.message);
}
