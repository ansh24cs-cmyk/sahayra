// SERVER ONLY. Import from route handlers and server actions, never from "use client" files.
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
const adminApp = () => getApps().length ? getApp() : initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n") }) });
export const adminDb = () => getFirestore(adminApp());
export const adminAuth = () => getAuth(adminApp());
// Admin authorisation lives in lib/auth/server.ts (UID + trusted custom claim). Do not add UID-only checks here.
