import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Default Firebase Configuration template
// User can replace env vars or edit this file when connecting to live Firebase Project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhB4bCjlJvzocDpzwMC8wRknnbnB6M2qc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nwsp-science-week.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nwsp-science-week",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nwsp-science-week.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1094516860150",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1094516860150:web:fd698ea4043baedf32f8d7"
};

// Helper to check if Firebase is configured with real credentials
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey && 
    firebaseConfig.projectId && 
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
};

let app;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured()) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully!");
  } catch (error) {
    console.warn("Firebase initialization warning (using local fallback):", error);
  }
} else {
  console.log("ℹ️ Firebase credentials not provided. Using high-performance LocalStorage Engine with instant offline sync.");
}

export { db };
