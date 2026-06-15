import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

try {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='appointment_bookings'").get();
  console.log("APPOINTMENT BOOKINGS SQL:");
  console.log(row.sql);

  // Let's also check the _collections entry to see the field configurations
  const colRow = db.prepare("SELECT * FROM _collections WHERE name='appointment_bookings'").get();
  console.log("\nCOLLECTION METADATA FIELDS:");
  console.log(JSON.stringify(JSON.parse(colRow.fields), null, 2));
} catch (e) {
  console.error("Error inspecting columns:", e.message);
}
