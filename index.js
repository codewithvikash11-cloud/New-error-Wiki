import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure GEMINI_API_KEY is present
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.error('❌ Error: Please provide a valid GEMINI_API_KEY in your .env file.');
    process.exit(1);
}

// 1. Initialize Firebase Admin SDK
try {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('serviceAccountKey.json file not found in the root directory.');
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    initializeApp({
        credential: cert(serviceAccount)
    });
    console.log('✅ Firebase Admin SDK Initialized Successfully.');
} catch (error) {
    console.error('❌ Firebase Initialization Error:', error.message);
    process.exit(1);
}

const db = getFirestore();

// 2. Initialize Google Gemini 1.5 Flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Utility to create delay between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility to generate a slug from error title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''); // Remove leading and trailing hyphens
};

// Main processing function
const processTextData = async () => {
    const textFilePath = path.join(__dirname, 'errors_data.txt');

    if (!fs.existsSync(textFilePath)) {
        console.error('❌ Error: errors_data.txt file not found.');
        process.exit(1);
    }

    console.log('Reading errors_data.txt...');
    const fileContent = fs.readFileSync(textFilePath, 'utf8');

    // Parse text data:
    // We assume each error is separated by one or more blank lines.
    // The first line of a block becomes the title, and the rest the description.
    const blocks = fileContent.split(/\r?\n\s*\r?\n/).filter(b => b.trim().length > 0);

    const errorsToProcess = blocks.map(block => {
        const lines = block.split(/\r?\n/).filter(l => l.trim().length > 0);
        const title = lines[0].trim();
        const description = lines.length > 1 ? lines.slice(1).join(' ').trim() : 'No description provided.';
        return { title, description };
    });

    console.log(`Found ${errorsToProcess.length} errors in text file to process.\n`);

    // 3. Process each error
    for (const data of errorsToProcess) {
        const { title, description } = data;

        if (!title) {
            continue;
        }

        console.log(`🚀 Processing Error: ${title}`);

        try {
            // Setup Gemini AI Prompt
            const prompt = `
You are an expert technical writer for https://www.google.com/search?q=ErrorWiki.com.
I am providing an error title and its context. 
Your task is to write a professional, 100% unique, and SEO-friendly article for this error.

Error Title: "${title}"
Context/Description: "${description}"

Article Requirements:
- A clear heading: 'How to fix ${title}'
- A 'What is it?' section explaining the cause.
- A 'Step-by-step Solution' section using bullet points.
- The tone must be authoritative and helpful for developers. Do not include conversational filler text.

Respond ONLY with a raw JSON object and nothing else. The JSON must have exactly this structure:
{
  "errorCode": "Extract or infer an alphanumeric error code from the title/context (e.g. 404, HY000). Use 'N/A' if none can be found.",
  "solution": "The fully formatted article content adhering to the required structure."
}
`;

            // Hit Gemini API
            const response = await model.generateContent(prompt);
            let responseText = response.response.text();

            // Clean up potentially wrapped markdown blocks from AI response
            responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

            let aiResult;
            try {
                aiResult = JSON.parse(responseText);
            } catch (err) {
                console.warn('⚠️ Failed to parse AI JSON response. Falling back to default extraction.');
                aiResult = {
                    errorCode: 'N/A',
                    solution: responseText
                };
            }

            // Prepare Firestore document data
            const slug = generateSlug(title);
            const docData = {
                title: title,
                errorCode: aiResult.errorCode || 'N/A',
                solution: aiResult.solution || responseText,
                slug: slug,
                createdAt: new Date(),
            };

            // 4. Database Sync: Save to Firestore 'errors' collection
            const docRef = db.collection('errors').doc();
            await docRef.set(docData);

            console.log(`✅ Passed: Saved "${title}" to Firestore with ID: ${docRef.id}`);

            // 5. Rate Limiting: 3-second delay between each AI request
            console.log('⏳ Waiting 3 seconds to respect rate limits...');
            await delay(3000);

        } catch (error) {
            console.error(`\n❌ Failed to process "${title}":`);
            console.error(error.message);
        }
    }

    console.log('\n🎉 Automation script completed successfully!');
};

// Start execution
processTextData();
