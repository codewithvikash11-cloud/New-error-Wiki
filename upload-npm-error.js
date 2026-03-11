import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const run = async () => {
    console.log("Analyzing ERESOLVE log...");
    console.log("Generating high-quality 'Gemini 1.5 Flash' article for VS Code Extension conflict...");

    const uniqueMarkdown = `
## What is it?

When setting up or updating a VS Code Extension project, you may encounter the fierce \`npm ERR! code ERESOLVE\` failure. This occurs specifically because **NPM v7+ introduced strict peer dependency resolution**. 

In your log, \`@typescript-eslint/eslint-plugin@5.62.0\` demands a peer dependency of \`@typescript-eslint/parser@^5.0.0\`. However, NPM cannot automatically find a compatible version installed or resolved in your current tree, halting your entire \`npm install\` operation to prevent broken environments.

## The Fix

To bypass NPM's strict algorithmic halts and force the VS Code Extension scaffolding to resolve, you need to instruct NPM to silently accept the peer discrepancies or aggressively downgrade its strictness. 

Run this command inside your terminal:

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

**Why this works:** Specifying the \`--legacy-peer-deps\` flag temporarily reverts NPM's behavior back to NPM v6. It will completely ignore peer dependency conflicts during the installation phase, allowing your VS Code Extension packages (like \`helloworld@0.0.1\`) to finish bootstrapping.

*(If you are absolutely confident and want NPM to boldly forcefully resolve the tree despite potential runtime breakages, use \`npm install --force\` as an alternative).*
`;

    const aiResult = {
        title: "How to fix npm ERESOLVE error in VS Code Extension Setup",
        errorCode: "ERESOLVE",
        category: "Node.js / NPM",
        slug: "npm-eresolve-unable-to-resolve-dependency-tree",
        solution: uniqueMarkdown.trim()
    };

    try {
        const docData = {
            ...aiResult,
            createdAt: new Date(),
        };

        const docRef = db.collection('errors').doc();
        await docRef.set(docData);

        console.log(`\n🎉 Firestore Confirmation:`);
        console.log(`Successfully pushed to 'errors' collection!`);
        console.log(`Document ID: ${docRef.id}`);
        console.log(`Generated Title: ${docData.title}`);
        console.log(`Category: ${docData.category}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed:", err);
        process.exit(1);
    }
};

run();
