import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

console.log("Starting CRM Database Migrations...");

// 1. ALTER TABLE clients to add new fields
const alterFields = [
  { name: 'OptIn_Status', sql: "ALTER TABLE clients ADD COLUMN OptIn_Status TEXT DEFAULT 'Pending'" },
  { name: 'OptIn_Channel', sql: "ALTER TABLE clients ADD COLUMN OptIn_Channel TEXT DEFAULT 'Email'" },
  { name: 'OptIn_Date', sql: "ALTER TABLE clients ADD COLUMN OptIn_Date TEXT DEFAULT ''" },
  { name: 'DoubleOptIn_Token', sql: "ALTER TABLE clients ADD COLUMN DoubleOptIn_Token TEXT DEFAULT ''" }
];

alterFields.forEach(f => {
  try {
    db.prepare(f.sql).run();
    console.log(`Column ${f.name} added to clients table.`);
  } catch (e) {
    console.log(`Column ${f.name} check/skipped:`, e.message);
  }
});

// 2. Update clients schema in _collections
try {
  const row = db.prepare("SELECT * FROM _collections WHERE name='clients'").get();
  if (row) {
    const fields = JSON.parse(row.fields);
    
    // Check if fields are already there
    const hasField = (name) => fields.some(f => f.name === name);
    
    if (!hasField('OptIn_Status')) {
      fields.push({"id":"text_optin_status","name":"OptIn_Status","type":"text","required":false,"system":false});
    }
    if (!hasField('OptIn_Channel')) {
      fields.push({"id":"text_optin_channel","name":"OptIn_Channel","type":"text","required":false,"system":false});
    }
    if (!hasField('OptIn_Date')) {
      fields.push({"id":"text_optin_date","name":"OptIn_Date","type":"text","required":false,"system":false});
    }
    if (!hasField('DoubleOptIn_Token')) {
      fields.push({"id":"text_optin_token","name":"DoubleOptIn_Token","type":"text","required":false,"system":false});
    }

    db.prepare("UPDATE _collections SET fields = ? WHERE name = 'clients'").run(JSON.stringify(fields));
    console.log("PocketBase clients metadata schema updated successfully.");
  }
} catch (e) {
  console.error("Failed to update clients schema metadata:", e.message);
}

// 3. Create crm_blasts table in SQLite
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS crm_blasts (
      id TEXT PRIMARY KEY,
      subject TEXT,
      body TEXT,
      audience TEXT,
      channel TEXT,
      sent_by TEXT,
      sent_date TEXT,
      stats TEXT,
      created TEXT,
      updated TEXT
    )
  `).run();
  console.log("crm_blasts table created successfully.");
} catch (e) {
  console.error("Failed to create crm_blasts table:", e.message);
}

// 4. Register crm_blasts collection in _collections
try {
  const exists = db.prepare("SELECT id FROM _collections WHERE name='crm_blasts'").get();
  if (!exists) {
    const fields = [
      {"id":"text3208210256","name":"id","type":"text","primaryKey":true,"required":true,"system":true},
      {"id":"text_blast_subject","name":"subject","type":"text","required":false,"system":false},
      {"id":"text_blast_body","name":"body","type":"text","required":true,"system":false},
      {"id":"text_blast_audience","name":"audience","type":"text","required":true,"system":false},
      {"id":"text_blast_channel","name":"channel","type":"text","required":true,"system":false},
      {"id":"text_blast_sent_by","name":"sent_by","type":"text","required":true,"system":false},
      {"id":"text_blast_sent_date","name":"sent_date","type":"text","required":true,"system":false},
      {"id":"json_blast_stats","name":"stats","type":"json","required":false,"system":false},
      {"id":"autodate2990389176","name":"created","type":"autodate","onCreate":true,"onUpdate":false,"presentable":false,"system":false},
      {"id":"autodate3332085495","name":"updated","type":"autodate","onCreate":true,"onUpdate":true,"presentable":false,"system":false}
    ];

    db.prepare(`
      INSERT INTO _collections (id, system, type, name, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
      VALUES ('pbc_crm_blasts', 0, 'base', 'crm_blasts', ?, '[]', '', '', '', '@request.auth.id != ""', '@request.auth.id != ""', '{}', datetime('now'), datetime('now'))
    `).run(JSON.stringify(fields));
    console.log("crm_blasts collection registered in _collections metadata.");
  } else {
    console.log("crm_blasts collection metadata already registered.");
  }
} catch (e) {
  console.error("Failed to register crm_blasts metadata:", e.message);
}

console.log("Database Migration Finished.");
