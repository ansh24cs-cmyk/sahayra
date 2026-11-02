// Firestore security-rules tests. They need the Firebase Emulator: run `npm run test:rules`.
// NOT executed by `npm test`, and not yet run by the author of this file.
import { readFileSync } from "node:fs"; import { test, before, after, beforeEach } from "node:test";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where } from "firebase/firestore";
const ADMIN = "admin-uid"; const rules = readFileSync("firestore.rules", "utf8").replace("REPLACE_WITH_ADMIN_UID", ADMIN);
let env;
before(async () => { env = await initializeTestEnvironment({ projectId: "sahayra-rules-test", firestore: { rules, host: "127.0.0.1", port: 8080 } }); });
after(async () => env.cleanup());
beforeEach(async () => { await env.clearFirestore(); await env.withSecurityRulesDisabled(async (ctx) => { const db = ctx.firestore();
  await setDoc(doc(db, "products/live"), { archived: false, name: "Live" }); await setDoc(doc(db, "products/hidden"), { archived: true, name: "Hidden" });
  await setDoc(doc(db, "users/alice/addresses/a1"), { city: "Pune" }); await setDoc(doc(db, "users/alice/wishlist/p1"), { productId: "p1" });
  await setDoc(doc(db, "orders/o1"), { userId: "alice", totalInr: 100 }); await setDoc(doc(db, "orders/o2"), { userId: "bob", totalInr: 50 }); await setDoc(doc(db, "coupons/SAVE"), { code: "SAVE" }); }); });
const as = (uid, claims) => env.authenticatedContext(uid, claims).firestore(); const anon = () => env.unauthenticatedContext().firestore();
test("public can read live products but not archived ones", async () => { await assertSucceeds(getDoc(doc(anon(), "products/live"))); await assertFails(getDoc(doc(anon(), "products/hidden"))); });
test("NO client can write products, not even the owner (writes are server-only)", async () => {
  const p = (db) => setDoc(doc(db, "products/new"), { archived: false, name: "x" });
  await assertFails(p(anon())); await assertFails(p(as("alice"))); await assertFails(p(as("alice", { admin: true }))); await assertFails(p(as(ADMIN))); await assertFails(p(as(ADMIN, { admin: true })));
});
test("customers read only their own addresses and wishlist", async () => {
  await assertSucceeds(getDoc(doc(as("alice"), "users/alice/addresses/a1"))); await assertFails(getDoc(doc(as("bob"), "users/alice/addresses/a1"))); await assertFails(getDoc(doc(anon(), "users/alice/addresses/a1")));
  await assertSucceeds(getDoc(doc(as("alice"), "users/alice/wishlist/p1"))); await assertFails(getDoc(doc(as("bob"), "users/alice/wishlist/p1")));
});
test("customers cannot write their own data directly (server-only writes)", async () => {
  await assertFails(setDoc(doc(as("alice"), "users/alice/addresses/a2"), { city: "x" })); await assertFails(setDoc(doc(as("alice"), "users/alice/wishlist/p2"), { productId: "p2" }));
  await assertFails(setDoc(doc(as("alice"), "users/alice"), { role: "admin" })); await assertFails(setDoc(doc(as("alice"), "users/alice"), { isAdmin: true }));
});
test("orders: owner reads own, never another's, and nobody on the client writes", async () => {
  await assertSucceeds(getDoc(doc(as("alice"), "orders/o1"))); await assertFails(getDoc(doc(as("alice"), "orders/o2")));
  await assertSucceeds(getDocs(query(collection(as("alice"), "orders"), where("userId", "==", "alice")))); await assertFails(getDocs(collection(as("alice"), "orders")));
  await assertFails(setDoc(doc(as("alice"), "orders/o1"), { userId: "alice", totalInr: 1 })); await assertFails(setDoc(doc(as("alice"), "orders/o3"), { userId: "alice", totalInr: 1 })); await assertFails(deleteDoc(doc(as("alice"), "orders/o1")));
});
test("owner can read every order; coupons and settings are owner-only", async () => {
  await assertSucceeds(getDoc(doc(as(ADMIN, { admin: true }), "orders/o2"))); await assertFails(getDoc(doc(as(ADMIN), "orders/o2")));
  await assertFails(getDoc(doc(as("alice"), "coupons/SAVE"))); await assertFails(getDoc(doc(anon(), "coupons/SAVE"))); await assertSucceeds(getDoc(doc(as(ADMIN, { admin: true }), "coupons/SAVE")));
});
test("auditLog and messages: owner may read, nobody may write or delete from a browser", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), "auditLog/a1"), { event: "admin_write" }); await setDoc(doc(ctx.firestore(), "messages/m1"), { name: "x" }); });
  const admin = as(ADMIN, { admin: true });
  await assertSucceeds(getDoc(doc(admin, "auditLog/a1"))); await assertSucceeds(getDoc(doc(admin, "messages/m1"))); await assertFails(setDoc(doc(admin, "auditLog/a1"), { event: "tampered" })); await assertFails(deleteDoc(doc(admin, "auditLog/a1"))); await assertFails(setDoc(doc(admin, "messages/m2"), { name: "y" }));
  await assertFails(getDoc(doc(as("alice"), "auditLog/a1"))); await assertFails(getDoc(doc(as("alice"), "messages/m1"))); await assertFails(setDoc(doc(anon(), "messages/m3"), { name: "spam" }));
});
test("unknown collections are default-deny, even for the owner", async () => { await assertFails(getDoc(doc(as(ADMIN, { admin: true }), "secrets/x"))); await assertFails(setDoc(doc(as(ADMIN, { admin: true }), "secrets/x"), { a: 1 })); });
