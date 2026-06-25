const baseUrl = process.argv[2] || "http://127.0.0.1:8090";
const identity = process.argv[3] || "admin@atltvmountpro.com";
const password = process.argv[4] || "password123";

const usersToReset = [
  { id: "atladminuser1", email: "info@atltvmountpro.com" },
  { id: "atlmoduser111", email: "moderator@atltvmountpro.com" },
  { id: "atlviewuser111", email: "viewer@atltvmountpro.com" }
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

    for (const user of usersToReset) {
      console.log(`Resetting password for ${user.email} (${user.id})...`);
      const updateRes = await fetch(`${baseUrl}/api/collections/users/records/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          password: "password",
          passwordConfirm: "password"
        })
      });

      if (!updateRes.ok) {
        console.error(`Failed to reset password for ${user.email}: ${await updateRes.text()}`);
      } else {
        console.log(`Successfully reset password for ${user.email} to: password`);
      }
    }

    console.log("Password reset completed successfully.");
  } catch (err) {
    console.error("Error during password reset:", err.message);
  }
}

run();
