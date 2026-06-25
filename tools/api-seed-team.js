import fs from 'node:fs';

const baseUrl = process.argv[2] || "http://127.0.0.1:8090";
const identity = process.argv[3] || "admin@atltvmountpro.com";
const password = process.argv[4] || "password123";

const team = [
  {
    id: "techmarcusthmp1",
    name: "Marcus Thompson",
    bio: "Lead technician with 8 years of experience specializing in TV mounting, home theater installations, and AV equipment setup.",
    skills: ["TV Mounting", "Cable Management", "Home Theater", "AV Setup"],
    photo: "/images/team/team-1.jpg",
    featured: true
  },
  {
    id: "techjamesrodrg2",
    name: "James Rodriguez",
    bio: "Senior tech with 6 years of experience delivering flawless drywall repairs and professional interior painting across metro Atlanta.",
    skills: ["Drywall Repair", "Painting", "Texture Matching", "Priming"],
    photo: "/images/team/team-2.jpg",
    featured: true
  },
  {
    id: "techkevinpatel3",
    name: "Kevin Patel",
    bio: "Experienced technician with 5 years specializing in custom carpentry builds and precision flooring installation.",
    skills: ["Carpentry", "Flooring", "Custom Shelving", "Trim Work"],
    photo: "/images/team/team-3.jpg",
    featured: true
  },
  {
    id: "techandrewillm4",
    name: "Andre Williams",
    bio: "Certified technician with 4 years handling fixture installations, minor plumbing repairs, and light electrical upgrades safely and efficiently.",
    skills: ["Plumbing", "Light Electrical", "Fixture Installation", "Drain Cleaning"],
    photo: "/images/team/team-4.jpg",
    featured: true
  },
  {
    id: "techdariusjaks5",
    name: "Darius Jackson",
    bio: "Versatile handyman with 7 years across all service categories. Go-to tech for complex multi-trade jobs and same-day emergency calls.",
    skills: ["TV Mounting", "Drywall Repair", "Carpentry", "Same-Day Service"],
    photo: "/images/team/team-5.jpg",
    featured: true
  },
  {
    id: "techcarlosmndz6",
    name: "Carlos Mendez",
    bio: "Flooring and painting specialist with a keen eye for detail. Known for delivering showroom-quality finishes on every project.",
    skills: ["Flooring", "Painting", "Surface Prep", "Color Consultation"],
    photo: "/images/team/team-6.jpg",
    featured: true
  }
];

async function run() {
  try {
    console.log(`Targeting PocketBase API: ${baseUrl}`);
    console.log(`Authenticating superuser: ${identity}...`);

    const authRes = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, password })
    });

    if (!authRes.ok) {
      throw new Error(`Authentication failed: ${await authRes.text()}`);
    }

    const authData = await authRes.json();
    const token = authData.token;
    console.log("Authenticated successfully.");

    // Fetch existing team members to avoid primary key conflicts
    console.log("Checking existing team members...");
    const listRes = await fetch(`${baseUrl}/api/collections/team_members/records?limit=100`, {
      headers: { "Authorization": token }
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      console.log(`Found ${listData.items.length} existing team members. Cleaning them up...`);
      for (const item of listData.items) {
        const delRes = await fetch(`${baseUrl}/api/collections/team_members/records/${item.id}`, {
          method: "DELETE",
          headers: { "Authorization": token }
        });
        if (delRes.ok) {
          console.log(`Deleted team member: ${item.name} (${item.id})`);
        }
      }
    }

    console.log("Seeding team members via API...");
    for (const member of team) {
      const createRes = await fetch(`${baseUrl}/api/collections/team_members/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(member)
      });

      if (!createRes.ok) {
        console.error(`Failed to create team member ${member.name}: ${await createRes.text()}`);
      } else {
        const created = await createRes.json();
        console.log(`Successfully created team member: ${created.name} (${created.id})`);
      }
    }

    console.log("API Seeding finished successfully.");
  } catch (err) {
    console.error("Error during API seeding:", err.message);
  }
}

run();
