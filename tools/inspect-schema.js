import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

try {
  const rows = db.prepare("SELECT name FROM _collections").all();
  console.log("COLLECTIONS:", rows.map(r => r.name));
} catch (e) {
  console.error("Error:", e.message);
}
