import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";
import { generateSolution } from "../../../lib/gemini";
import { generateSlug } from "../../../lib/slugify";
import { isValidErrorInput } from "../../../lib/validation";
import { hashError } from "../../../lib/hashError";

export const dynamic = "force-dynamic";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
    try {
        // Enforce Security Check
        if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
             return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { errors } = body;

        // Validation for the Array
        if (!Array.isArray(errors) || errors.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid input. Expected {"errors": [{"title": "...", "description": "..."}]}' },
                { status: 400 }
            );
        }

        const results = [];

        for (const data of errors) {
            const { title, description } = data;

            if (!title || !isValidErrorInput(title)) {
                results.push({ title, status: "skipped", reason: "Invalid error input" });
                continue;
            }

            try {
                // Duplicate check
                const hash = hashError(title);
                const existingDocs = await db.collection("errors").where("hash", "==", hash).limit(1).get();

                if (!existingDocs.empty) {
                    const existingData = existingDocs.docs[0].data();
                    results.push({ title, status: 'success', id: existingDocs.docs[0].id, duplicate: true });
                    continue;
                }

                // Generative AI Magic
                const aiResult = await generateSolution(title, description);

                const slug = generateSlug(title);
                const docData = {
                    title: title,
                    errorCode: aiResult.errorCode || 'N/A',
                    explanation: aiResult.explanation || 'N/A',
                    solution: aiResult.solution,
                    slug: slug,
                    hash: hash,
                    createdAt: new Date(),
                };

                const docRef = db.collection('errors').doc();
                await docRef.set(docData);

                results.push({ title, status: 'success', id: docRef.id, duplicate: false });

                // Vercel friendly delay wait logic pattern to prevent Gemini limit crashes
                await delay(2000); 
            } catch (error: any) {
                console.error(`Failed to process ${title}:`, error);
                results.push({ title, status: 'error', error: "AI generation failed" });
            }
        }

        return NextResponse.json({
            success: true,
            processedCount: results.length,
            results
        });

    } catch (e: any) {
        console.error("Critical Bulk Route Error:", e);
        return NextResponse.json({
            success: false,
            error: "Internal server error"
        }, { status: 500 });
    }
}
