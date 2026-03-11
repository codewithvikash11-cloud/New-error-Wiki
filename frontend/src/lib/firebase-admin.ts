import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

let db: FirebaseFirestore.Firestore;

if (!getApps().length) {
    let serviceAccount;

    try {
        const parentRoot = path.resolve(process.cwd(), '../serviceAccountKey.json');
        const localRoot = path.resolve(process.cwd(), './serviceAccountKey.json');

        if (fs.existsSync(parentRoot)) {
            serviceAccount = JSON.parse(fs.readFileSync(parentRoot, 'utf8'));
        } else if (fs.existsSync(localRoot)) {
            serviceAccount = JSON.parse(fs.readFileSync(localRoot, 'utf8'));
        }

        if (serviceAccount) {
            initializeApp({
                credential: cert(serviceAccount)
            });
            console.log('Firebase Admin Initialized Successfully.');
        } else {
            console.error('No serviceAccountKey.json found.');
        }
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

db = getFirestore();

export { db };
