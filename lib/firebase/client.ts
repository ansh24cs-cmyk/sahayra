// Plain module (no "use client"): safe for server and client. Public keys only.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};
export const firebaseReady = Boolean(cfg.apiKey && cfg.projectId);
const app = () => (getApps().length ? getApp() : initializeApp(cfg));
export const getClientAuth = () => (firebaseReady ? getAuth(app()) : null);
