import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let db: FirebaseFirestore.Firestore | any;

if (!getApps().length) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.warn("Missing Firebase Environment Variables. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
    } else {
        try {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                })
            });
            console.log('Firebase Admin Initialized Successfully with Environment Variables.');
        } catch (error) {
            console.error('Firebase Admin Initialization Error:', error);
        }
    }
}

try {
    if (getApps().length > 0) {
        db = getFirestore();
    }
} catch (error) {
    console.warn("Firestore not initialized at build time.");
}

export { db };
