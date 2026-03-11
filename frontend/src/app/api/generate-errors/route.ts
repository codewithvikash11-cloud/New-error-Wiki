import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = "force-dynamic";

// 1. Initialize Firebase Admin SDK using Environment Variables
if (!getApps().length) {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
        console.error("Missing Firebase Environment Variables.");
    } else {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines with actual newlines for the private key
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin Initialized from Environment Variables');
    }
}

const db = getFirestore();

// Utility to create delay between requests (for rate limiting)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Utility to generate a slug from error title
const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, ''); // Remove leading and trailing hyphens
};

export async function POST(req: Request) {
    try {
        // Ensure GEMINI_API_KEY is present
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ success: false, error: 'GEMINI_API_KEY is missing in environment variables' }, { status: 500 });
        }

        // 2. Parse errors from the Request Body instead of a local file
        const body = await req.json();
        const { errors } = body;

        // Basic validation
        if (!Array.isArray(errors) || errors.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid input. Expected JSON body with an "errors" array. e.g. { "errors": [{ "title": "Error 1", "description": "Desc 1" }] }' },
                { status: 400 }
            );
        }

        // 3. Initialize Google Gemini 1.5 Flash using Environment Variable
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const results = [];

        console.log(`Found ${errors.length} errors to process.\n`);

        // 4. Process each error
        for (const data of errors) {
            const { title, description } = data;

            if (!title) {
                continue;
            }

            console.log(`🚀 Processing Error: ${title}`);

            try {
                // Setup Gemini AI Prompt
                const prompt = `
You are an expert technical writer for ErrorWiki.com.
I am providing an error title and its context. 
Your task is to write a professional, 100% unique, and SEO-friendly article for this error.

Error Title: "${title}"
Context/Description: "${description || 'No description provided.'}"

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

                // Database Sync: Save to Firestore 'errors' collection
                const docRef = db.collection('errors').doc();
                await docRef.set(docData);

                results.push({ title, status: 'success', id: docRef.id });
                console.log(`✅ Passed: Saved "${title}" to Firestore with ID: ${docRef.id}`);

                // Rate Limiting: 3-second delay between each AI request
                console.log('⏳ Waiting 3 seconds to respect rate limits...');
                await delay(3000);

            } catch (error: any) {
                console.error(`\n❌ Failed to process "${title}":`, error.message);
                results.push({ title, status: 'error', error: error.message });
            }
        }

        // 5. Return JSON Success Response
        return NextResponse.json({ 
            success: true, 
            message: 'Processing complete', 
            processedCount: results.length,
            results 
        });

    } catch (error: any) {
        console.error("Critical Route Error:", error);
        return NextResponse.json({ success: false, error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
