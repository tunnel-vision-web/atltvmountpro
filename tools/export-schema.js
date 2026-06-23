import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

try {
  const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');
  const collections = db.prepare("SELECT id, name, type, system, fields, indexes, listRule, viewRule, createRule, updateRule, deleteRule, options FROM _collections").all();

  collections.forEach(c => {
    c.system = Boolean(c.system);
    c.fields = JSON.parse(c.fields || '[]');
    c.indexes = JSON.parse(c.indexes || '[]');
    c.options = JSON.parse(c.options || '{}');
  });

  fs.writeFileSync('pb_schema.json', JSON.stringify(collections, null, 2));
  console.log("Schema exported successfully to pb_schema.json!");
} catch (err) {
  console.error("Export failed:", err.message);
}
