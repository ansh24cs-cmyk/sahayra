// Run locally ONCE, later phase, with server env vars set. Not exposed over HTTP. UNTESTED until Firebase is connected.
import { cert, initializeApp } from "firebase-admin/app"; import { getAuth } from "firebase-admin/auth";
const need = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY", "ADMIN_UID"];
const miss = need.filter((k) => !process.env[k]); if (miss.length) { console.error("Missing:", miss.join(", ")); process.exit(1); }
initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n") }) });
const auth = getAuth(); const uid = process.env.ADMIN_UID;
for (let page = await auth.listUsers(1000); ; ) {
  const other = page.users.find((u) => u.customClaims?.admin === true && u.uid !== uid);
  if (other) { console.error("Refusing: another account already holds the admin claim."); process.exit(1); }
  if (!page.pageToken) break; page = await auth.listUsers(1000, page.pageToken);
}
await auth.setCustomUserClaims(uid, { admin: true }); console.log("Admin claim set for the configured UID. Sign out and in again to refresh the token.");
