import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

console.log("Starting Bookings Database Migrations...");

// 1. ALTER TABLE appointment_bookings to add new fields
const alterFields = [
  { name: 'status', sql: "ALTER TABLE appointment_bookings ADD COLUMN status TEXT DEFAULT 'Pending'" },
  { name: 'assignedTechId', sql: "ALTER TABLE appointment_bookings ADD COLUMN assignedTechId TEXT DEFAULT ''" },
  { name: 'assignedTechName', sql: "ALTER TABLE appointment_bookings ADD COLUMN assignedTechName TEXT DEFAULT ''" },
  { name: 'service_type', sql: "ALTER TABLE appointment_bookings ADD COLUMN service_type TEXT DEFAULT 'TV Mounting'" }
];

alterFields.forEach(f => {
  try {
    db.prepare(f.sql).run();
    console.log(`Column ${f.name} added to appointment_bookings table.`);
  } catch (e) {
    console.log(`Column ${f.name} check/skipped:`, e.message);
  }
});

// 2. Update appointment_bookings schema in _collections
try {
  const row = db.prepare("SELECT * FROM _collections WHERE name='appointment_bookings'").get();
  if (row) {
    const fields = JSON.parse(row.fields);
    
    // Check if fields are already there
    const hasField = (name) => fields.some(f => f.name === name);
    
    if (!hasField('status')) {
      fields.push({"id":"text_status","name":"status","type":"text","required":false,"system":false});
    }
    if (!hasField('assignedTechId')) {
      fields.push({"id":"text_assigned_tech_id","name":"assignedTechId","type":"text","required":false,"system":false});
    }
    if (!hasField('assignedTechName')) {
      fields.push({"id":"text_assigned_tech_name","name":"assignedTechName","type":"text","required":false,"system":false});
    }
    if (!hasField('service_type')) {
      fields.push({"id":"text_service_type","name":"service_type","type":"text","required":false,"system":false});
    }

    db.prepare("UPDATE _collections SET fields = ? WHERE name = 'appointment_bookings'").run(JSON.stringify(fields));
    console.log("PocketBase appointment_bookings metadata schema updated successfully.");
  }
} catch (e) {
  console.error("Failed to update appointment_bookings schema metadata:", e.message);
}

console.log("Database Migration Finished.");
