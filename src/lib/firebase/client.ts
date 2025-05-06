
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth'; // Import GoogleAuthProvider
// import { getFirestore, Firestore } from 'firebase/firestore'; // Add if Firestore is needed
// import { getStorage, FirebaseStorage } from 'firebase/storage'; // Add if Storage is needed
// Optionally import Analytics
// import { getAnalytics, Analytics } from "firebase/analytics";

const firebaseConfig = {
  // Read config from environment variables prefixed with NEXT_PUBLIC_
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleAuthProvider: GoogleAuthProvider | null = null; // Added
// let firestore: Firestore | null = null;
// let storage: FirebaseStorage | null = null;
// let analytics: Analytics | null = null; // Add if Analytics is needed


// Function to initialize Firebase and Auth safely
function initializeFirebase() {
    // Return immediately if already initialized
    if (app && auth && googleAuthProvider) { // Also check other services if they are initialized here
        return { app, auth, googleAuthProvider }; // , firestore, storage, analytics };
    }

    // CRITICAL CHECKS: Validate essential config values
    const missingVars = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value && key !== 'measurementId') // measurementId is optional
        .map(([key]) => key);

    if (missingVars.length > 0) {
        const errorMsg = `CRITICAL: Firebase configuration is missing or invalid for: ${missingVars.join(', ')}. Check your environment variables (NEXT_PUBLIC_...). Firebase cannot be initialized.`;
        console.error(errorMsg);
        // Throw a specific error to halt execution
        throw new Error(errorMsg);
    }


    try {
        // Initialize Firebase App only if it doesn't exist
        if (!getApps().length) {
            // console.log("Initializing Firebase App..."); // Debug log (optional)
            app = initializeApp(firebaseConfig);
        } else {
            // console.log("Getting existing Firebase App..."); // Debug log (optional)
            app = getApp();
        }

        // Initialize Firebase Auth
        // console.log("Getting Firebase Auth instance..."); // Debug log (optional)
        auth = getAuth(app);
        googleAuthProvider = new GoogleAuthProvider(); // Initialize GoogleAuthProvider

        // Initialize other services if needed
        // firestore = getFirestore(app);
        // storage = getStorage(app);
        // Check if running in the browser before initializing Analytics
        // if (typeof window !== "undefined") {
        //    analytics = getAnalytics(app);
        //}


        // console.log("Firebase initialized successfully."); // Debug log (optional)

    } catch (error) {
        console.error("Error during Firebase initialization:", error);
        // Ensure instances are null if initialization fails
        app = null;
        auth = null;
        googleAuthProvider = null;
        // firestore = null;
        // storage = null;
        // analytics = null;
        // Re-throw the error to indicate failure
        throw error;
    }

    // Return the initialized instances (or null if failed, though error is thrown)
    return { app, auth, googleAuthProvider }; //, firestore, storage, analytics };
}

// Export getter functions to ensure initialization and handle potential errors
export const getFirebaseApp = (): FirebaseApp => {
    const { app: initializedApp } = initializeFirebase();
    // The check inside initializeFirebase ensures app is non-null if no error was thrown
    return initializedApp!;
};

export const getFirebaseAuth = (): Auth => {
    const { auth: initializedAuth } = initializeFirebase();
     // The check inside initializeFirebase ensures auth is non-null if no error was thrown
    return initializedAuth!;
};

export const getGoogleAuthProvider = (): GoogleAuthProvider => {
    const { googleAuthProvider: initializedProvider } = initializeFirebase();
    return initializedProvider!;
}

// export const getFirebaseFirestore = (): Firestore => {
//     const { firestore: initializedFirestore } = initializeFirebase();
//     if (!initializedFirestore) throw new Error("Firestore is not initialized.");
//     return initializedFirestore;
// }

// export const getFirebaseStorage = (): FirebaseStorage => {
//     const { storage: initializedStorage } = initializeFirebase();
//     if (!initializedStorage) throw new Error("Storage is not initialized.");
//     return initializedStorage;
// }

// export const getFirebaseAnalytics = (): Analytics | null => {
//    // Ensure Analytics is initialized only on the client
//    if (typeof window === "undefined") return null;
//    const { analytics: initializedAnalytics } = initializeFirebase();
//    return initializedAnalytics;
//}


// Note: Direct export of potentially null 'app' and 'auth' is removed
// to encourage use of the safer getter functions.
// export { app, auth }; // Avoid this
