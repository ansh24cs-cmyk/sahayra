# Sahayra auth: what works now and what needs Firebase

**Implemented (no credentials needed):** all auth screens and validation, auth state model, customer guard (UX only), server-side admin gate (deny by default), session-cookie route, `requireAdminApi` / `requireUserApi`, config checks, unit tests.
**Needs live Firebase (not yet verified):** sign-up, sign-in, reset and verification emails, session cookies, admin claim. Until configured, forms show a setup notice; there is no mock auth.

## Later phase
1. Firebase console: create project, enable Email/Password, create Firestore.
2. Copy web config into `.env.local` (see `.env.example`); add a service account's values for the server-only variables.
3. Create ONE user for the admin, copy its UID into `ADMIN_UID`.
4. Run `node scripts/provision-admin.mjs` locally once (refuses if any other account holds the claim).
5. Sign out/in, then open `/admin/login`. Test with the Firebase Emulator Suite before production.
6. Deploy `firestore.rules` after replacing the UID placeholder. Add authorised domains in Firebase Auth.
