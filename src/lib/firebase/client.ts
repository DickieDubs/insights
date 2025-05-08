// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

function initializeFirebase() {
    if (app && firestore) {
        return { app, firestore };
    }

    const missingVars = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'measurementId' && key !== 'authDomain') // authDomain also not strictly needed if only firestore
        .map(([key]) => key);

    if (missingVars.length > 0) {
        const errorMsg = `CRITICAL: Firebase configuration is missing or invalid for: ${missingVars.join(', ')}. Check your environment variables (NEXT_PUBLIC_...). Firebase cannot be initialized.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    try {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        firestore = getFirestore(app);
    } catch (error) {
        console.error("Error during Firebase initialization:", error);
        app = null;
        firestore = null;
        throw error;
    }
    return { app, firestore };
}

export const getFirebaseApp = (): FirebaseApp => {
    const { app: initializedApp } = initializeFirebase();
    return initializedApp!;
};

export const getFirebaseFirestore = (): Firestore => {
    const { firestore: initializedFirestore } = initializeFirebase();
    return initializedFirestore!;
}