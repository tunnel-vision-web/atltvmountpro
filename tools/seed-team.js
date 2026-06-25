import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:\\BOCM\\Software\\pocketbase_0.39.3_windows_amd64\\pb_data\\data.db');

console.log("Seeding technician team members into local database...");

const team = [
  {
    id: "techmarcusthmp1",
    name: "Marcus Thompson",
    bio: "Lead technician with 8 years of experience specializing in TV mounting, home theater installations, and AV equipment setup.",
    skills: JSON.stringify(["TV Mounting", "Cable Management", "Home Theater", "AV Setup"]),
    photo: "/images/team/team-1.jpg",
    featured: 1
  },
  {
    id: "techjamesrodrg2",
    name: "James Rodriguez",
    bio: "Senior tech with 6 years of experience delivering flawless drywall repairs and professional interior painting across metro Atlanta.",
    skills: JSON.stringify(["Drywall Repair", "Painting", "Texture Matching", "Priming"]),
    photo: "/images/team/team-2.jpg",
    featured: 1
  },
  {
    id: "techkevinpatel3",
    name: "Kevin Patel",
    bio: "Experienced technician with 5 years specializing in custom carpentry builds and precision flooring installation.",
    skills: JSON.stringify(["Carpentry", "Flooring", "Custom Shelving", "Trim Work"]),
    photo: "/images/team/team-3.jpg",
    featured: 1
  },
  {
    id: "techandrewillm4",
    name: "Andre Williams",
    bio: "Certified technician with 4 years handling fixture installations, minor plumbing repairs, and light electrical upgrades safely and efficiently.",
    skills: JSON.stringify(["Plumbing", "Light Electrical", "Fixture Installation", "Drain Cleaning"]),
    photo: "/images/team/team-4.jpg",
    featured: 1
  },
  {
    id: "techdariusjaks5",
    name: "Darius Jackson",
    bio: "Versatile handyman with 7 years across all service categories. Go-to tech for complex multi-trade jobs and same-day emergency calls.",
    skills: JSON.stringify(["TV Mounting", "Drywall Repair", "Carpentry", "Same-Day Service"]),
    photo: "/images/team/team-5.jpg",
    featured: 1
  },
  {
    id: "techcarlosmndz6",
    name: "Carlos Mendez",
    bio: "Flooring and painting specialist with a keen eye for detail. Known for delivering showroom-quality finishes on every project.",
    skills: JSON.stringify(["Flooring", "Painting", "Surface Prep", "Color Consultation"]),
    photo: "/images/team/team-6.jpg",
    featured: 1
  }
];

try {
  // Clear existing team members to avoid duplicates
  db.prepare("DELETE FROM team_members").run();
  console.log("Cleared old team members.");

  const insert = db.prepare(`
    INSERT INTO team_members (id, name, bio, skills, photo, featured, created, updated)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  team.forEach(t => {
    insert.run(t.id, t.name, t.bio, t.skills, t.photo, t.featured);
    console.log(`Seeded team member: ${t.name}`);
  });
  console.log("Seeding team members completed successfully.");
} catch (e) {
  console.error("Error seeding team members:", e.message);
}
