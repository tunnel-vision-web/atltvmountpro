import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

console.log("Seeding system users into database...");

// Standard bcrypt hash for password "password"
const defaultPasswordHash = '$2y$10$9s6H6wJ19i.r7V4U0sOmeOfDmg8s5vJ1pM0b0vJ1pM0b0vJ1pM0b0'; // dummy bcrypt

const users = [
  {
    id: 'atladminuser1',
    username: 'atladmin',
    email: 'info@atltvmountpro.com',
    role: 'Admin',
    custom_permissions: '{}',
    tokenKey: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678'
  },
  {
    id: 'atlmoduser111',
    username: 'atlmoderator',
    email: 'moderator@atltvmountpro.com',
    role: 'Moderator',
    custom_permissions: JSON.stringify({
      canView: ["projects", "orders", "team", "profile", "finance", "media"],
      canEdit: ["projects", "orders", "team", "finance", "media"],
      canDelete: ["projects", "orders", "team", "media"]
    }),
    tokenKey: 'bcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678a'
  },
  {
    id: 'atlviewuser111',
    username: 'atlviewer',
    email: 'viewer@atltvmountpro.com',
    role: 'Viewer',
    custom_permissions: JSON.stringify({
      canView: ["projects", "orders", "team", "profile", "finance", "media"],
      canEdit: [],
      canDelete: []
    }),
    tokenKey: 'cdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678ab'
  }
];

users.forEach(user => {
  try {
    // Check if user already exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(user.email);
    if (existing) {
      console.log(`User ${user.email} already exists in DB. Skipping.`);
      return;
    }

    db.prepare(`
      INSERT INTO users (id, username, email, role, custom_permissions, verified, password, tokenKey, emailVisibility, created, updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.username,
      user.email,
      user.role,
      user.custom_permissions,
      1, // verified
      defaultPasswordHash,
      user.tokenKey,
      1, // emailVisibility
      new Date().toISOString(),
      new Date().toISOString()
    );
    console.log(`Successfully seeded user: ${user.username} (${user.email}) as ${user.role}`);
  } catch (err) {
    console.error(`Failed to seed user ${user.username}:`, err.message);
  }
});

console.log("Seeding process finished.");
