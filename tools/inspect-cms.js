import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

try {
  const pragma = db.prepare("PRAGMA table_info(cms_pages)").all();
  console.log("CMS_PAGES SCHEMA:");
  pragma.forEach(col => console.log(` - ${col.name}: ${col.type}`));

  const rows = db.prepare("SELECT page, data FROM cms_pages").all();
  rows.forEach(r => {
    console.log(`\nPAGE: ${r.page}`);
    try {
      const parsed = JSON.parse(r.data);
      console.log("CONTENT KEYS:", Object.keys(parsed));
      if (r.page === 'home') {
        console.log("HOME HERO FIELDS:", {
          heroTitle: parsed.heroTitle,
          heroDescription: parsed.heroDescription,
          heroImage: parsed.heroImage,
          heroVideo: parsed.heroVideo
        });
      }
    } catch {
      console.log("Raw data (not JSON):", r.data.substring(0, 100));
    }
  });
} catch (e) {
  console.error("Error:", e.message);
}
