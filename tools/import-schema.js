import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

try {
  const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');
  
  // Read schema
  const schemaRaw = fs.readFileSync('pb_schema.json', 'utf8');
  const collections = JSON.parse(schemaRaw);

  console.log("Importing collections into PocketBase...");

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO _collections (id, name, type, system, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options, created, updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  collections.forEach(c => {
    // Skip importing default collections if they are already system default
    const existing = db.prepare("SELECT id FROM _collections WHERE name = ?").get(c.name);
    if (existing && c.system) {
      console.log(`Skipping system collection: ${c.name}`);
      return;
    }

    insertStmt.run(
      c.id,
      c.name,
      c.type,
      c.system ? 1 : 0,
      JSON.stringify(c.fields || []),
      JSON.stringify(c.indexes || []),
      c.listRule,
      c.viewRule,
      c.createRule,
      c.updateRule,
      c.deleteRule,
      JSON.stringify(c.options || {}),
      new Date().toISOString(),
      new Date().toISOString()
    );
    console.log(`Imported collection: ${c.name}`);
  });

  console.log("Schema import completed successfully!");

} catch (err) {
  console.error("Import failed:", err.message);
}
