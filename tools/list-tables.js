import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("TABLES IN DATABASE:");
  console.log(tables.map(t => t.name));
} catch (e) {
  console.error("Failed to list tables:", e.message);
}
