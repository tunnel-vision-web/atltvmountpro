import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

console.log("Seeding CRM Database with Bookings and Clients...");

// Helper to generate 15-char random id (lowercase alphanumeric)
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 15; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Helper to generate 40-char token key
function generateTokenKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 40; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

const mockBcryptPassword = '$2a$10$7v5/pT7L6Ua13iO2vH6dveF0c2C6R05mGqS1n45c09yGz9.jP9xY2'; // hash for '12345678'

// 1. Seed Clients
const clientsToSeed = [
  {
    name: "John Miller",
    email: "john.miller@example.com",
    phone: "4045550192",
    status: "Confirmed",
    channel: "Email",
    date: new Date().toISOString()
  },
  {
    name: "Alice Smith",
    email: "alice.smith@example.com",
    phone: "7705550183",
    status: "Pending",
    channel: "SMS",
    date: ""
  },
  {
    name: "Robert Davis",
    email: "robert.davis@example.com",
    phone: "6785550124",
    status: "Confirmed",
    channel: "WhatsApp",
    date: new Date().toISOString()
  },
  {
    name: "Jane Watson",
    email: "jane.watson@example.com",
    phone: "4045550145",
    status: "Opted_Out",
    channel: "Email",
    date: ""
  },
  {
    name: "Michael Chang",
    email: "michael.chang@example.com",
    phone: "7705550111",
    status: "Confirmed",
    channel: "SMS",
    date: new Date().toISOString()
  }
];

try {
  // Clear existing client data to avoid duplicates in this seed
  db.prepare("DELETE FROM clients").run();
  console.log("Cleared old clients.");

  const insertClient = db.prepare(`
    INSERT INTO clients (
      id, email, password, tokenKey, verified, emailVisibility, 
      Name, Phone_Number, Role, Type, OptIn_Status, OptIn_Channel, 
      OptIn_Date, DoubleOptIn_Token, created, updated
    ) VALUES (
      ?, ?, ?, ?, 1, 1, 
      ?, ?, 'Client', 'Client', ?, ?, 
      ?, ?, datetime('now'), datetime('now')
    )
  `);

  clientsToSeed.forEach(c => {
    const id = generateId();
    const tokenKey = generateTokenKey();
    const token = generateId(); // simple 15-char token for verification
    insertClient.run(
      id,
      c.email,
      mockBcryptPassword,
      tokenKey,
      c.name,
      c.phone,
      c.status,
      c.channel,
      c.date,
      token
    );
    console.log(`Client seeded: ${c.name} (${c.email})`);
  });
} catch (e) {
  console.error("Failed to seed clients:", e.message);
}

// 2. Seed Bookings
const bookingsToSeed = [
  {
    name: "John Miller",
    email: "john.miller@example.com",
    phone: "4045550192",
    date: "2026-06-20",
    time: "10:00 AM",
    desc: "Mount 65 inch TV on drywall with wire concealment in the living room."
  },
  {
    name: "Alice Smith",
    email: "alice.smith@example.com",
    phone: "7705550183",
    date: "2026-06-21",
    time: "02:00 PM",
    desc: "Mount 55 inch TV over brick fireplace, power outlet is already installed."
  },
  {
    name: "Robert Davis",
    email: "robert.davis@example.com",
    phone: "6785550124",
    date: "2026-06-22",
    time: "09:00 AM",
    desc: "Outdoor TV installation on wood siding. Needs weather-proof mount."
  },
  {
    name: "Jane Watson",
    email: "jane.watson@example.com",
    phone: "4045550145",
    date: "2026-06-25",
    time: "01:00 PM",
    desc: "Mount soundbar and 75 inch OLED TV on concrete wall with premium full-motion mount."
  }
];

try {
  // Clear old bookings
  db.prepare("DELETE FROM appointment_bookings").run();
  console.log("Cleared old bookings.");

  const insertBooking = db.prepare(`
    INSERT INTO appointment_bookings (
      id, Name, Email, Phone_Number, Preferred_Date, Preferred_Time, 
      Project_Description, created, updated
    ) VALUES (
      ?, ?, ?, ?, ?, ?, 
      ?, datetime('now'), datetime('now')
    )
  `);

  bookingsToSeed.forEach(b => {
    const id = generateId();
    insertBooking.run(
      id,
      b.name,
      b.email,
      b.phone,
      b.date,
      b.time,
      b.desc
    );
    console.log(`Booking seeded: ${b.name} on ${b.date}`);
  });
} catch (e) {
  console.error("Failed to seed bookings:", e.message);
}

console.log("Seeding Finished.");
