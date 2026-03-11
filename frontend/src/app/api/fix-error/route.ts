import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";
import { generateSolution } from "../../../lib/gemini";
import { isValidErrorInput } from "../../../lib/validation";
import { generateSlug } from "../../../lib/slugify";
import { hashError } from "../../../lib/hashError";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        // Enforce Security Check
        const secret = req.headers.get("x-admin-secret");
        if (secret !== process.env.ADMIN_SECRET) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { error } = body;

        // Input Validation
        if (!isValidErrorInput(error)) {
            return NextResponse.json({
                success: false,
                error: "Invalid error text provided. Must be at least 10 characters and appear to be a code error."
            }, { status: 400 });
        }

        // Duplicate Check using Hash
        const hash = hashError(error);
        const existingDocs = await db.collection("errors").where("hash", "==", hash).limit(1).get();

        if (!existingDocs.empty) {
            const existingData = existingDocs.docs[0].data();
            return NextResponse.json({
                success: true,
                errorCode: existingData.errorCode,
                explanation: existingData.explanation,
                solution: existingData.solution,
                id: existingDocs.docs[0].id,
                duplicate: true
            });
        }

        // Send Prompt to Gemini
        const aiResult = await generateSolution(error);

        // Store Results in Firestore
        const slug = generateSlug(error);
        const docData = {
            title: error,
            errorCode: aiResult.errorCode || 'N/A',
            explanation: aiResult.explanation || 'N/A',
            solution: aiResult.solution,
            slug: slug,
            hash: hash,
            createdAt: new Date(),
        };

        const docRef = db.collection("errors").doc();
        await docRef.set(docData);

        // Return Corrected Output
        return NextResponse.json({
            success: true,
            errorCode: aiResult.errorCode || 'N/A',
            explanation: aiResult.explanation || 'N/A',
            solution: aiResult.solution,
            id: docRef.id,
            duplicate: false
        });

    } catch (e: any) {
        console.error("Failed to generate error solution:", e);
        return NextResponse.json({
            success: false,
            error: "AI generation failed"
        }, { status: 500 });
    }
}
