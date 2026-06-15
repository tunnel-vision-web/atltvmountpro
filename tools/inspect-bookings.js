import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

try {
  const countRow = db.prepare("SELECT COUNT(id) as cnt FROM appointment_bookings").get();
  console.log("BOOKINGS COUNT:", countRow.cnt);
  
  const rows = db.prepare("SELECT * FROM appointment_bookings LIMIT 10").all();
  console.log("BOOKINGS SAMPLES:");
  console.log(JSON.stringify(rows, null, 2));
} catch (e) {
  console.error("Failed to query bookings:", e.message);
}
