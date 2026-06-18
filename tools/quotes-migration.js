import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

console.log("Starting Quotes Database Migrations...");

// 1. Create quote_inquiries table in SQLite
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS quote_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      phone TEXT,
      service_type TEXT,
      project_details TEXT,
      estimated_quote REAL,
      status TEXT DEFAULT 'Pending',
      created TEXT,
      updated TEXT
    )
  `).run();
  console.log("quote_inquiries table created successfully.");
} catch (e) {
  console.error("Failed to create quote_inquiries table:", e.message);
}

// 2. Register quote_inquiries collection in _collections
try {
  const exists = db.prepare("SELECT id FROM _collections WHERE name='quote_inquiries'").get();
  if (!exists) {
    const fields = [
      {"id":"text3208210256","name":"id","type":"text","primaryKey":true,"required":true,"system":true},
      {"id":"text_quote_name","name":"name","type":"text","required":true,"system":false},
      {"id":"text_quote_email","name":"email","type":"text","required":true,"system":false},
      {"id":"text_quote_phone","name":"phone","type":"text","required":true,"system":false},
      {"id":"text_quote_service_type","name":"service_type","type":"text","required":false,"system":false},
      {"id":"text_quote_details","name":"project_details","type":"text","required":false,"system":false},
      {"id":"num_quote_est","name":"estimated_quote","type":"number","required":false,"system":false},
      {"id":"text_quote_status","name":"status","type":"text","required":false,"system":false},
      {"id":"autodate2990389176","name":"created","type":"autodate","onCreate":true,"onUpdate":false,"presentable":false,"system":false},
      {"id":"autodate3332085495","name":"updated","type":"autodate","onCreate":true,"onUpdate":true,"presentable":false,"system":false}
    ];

    db.prepare(`
      INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
      VALUES ('pbc_quote_inquiries', 0, 'base', 'quote_inquiries', ?, '[]', '', '', '', '', '', '{}', datetime('now'), datetime('now'))
    `).run(JSON.stringify(fields));
    console.log("quote_inquiries collection registered in _collections metadata.");
  } else {
    console.log("quote_inquiries collection metadata already registered.");
  }
} catch (e) {
  console.error("Failed to register quote_inquiries metadata:", e.message);
}

console.log("Database Migration Finished.");
