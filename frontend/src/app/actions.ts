'use server'

import { db } from "@/lib/firebase-admin";

export async function searchErrorsAction(query: string) {
    try {
        const snapshot = await db.collection("errors").orderBy("createdAt", "desc").limit(100).get();
        const all = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt;
            return {
                id: doc.id,
                ...data,
                createdAt: createdAt ? new Date(createdAt._seconds * 1000).toISOString() : null
            };
        });

        if (!query) {
            return all.slice(0, 50);
        }

        const lowerQ = query.toLowerCase();
        const filtered = all.filter((err: any) =>
            (err.title && err.title.toLowerCase().includes(lowerQ)) ||
            (err.errorCode && err.errorCode.toLowerCase().includes(lowerQ))
        );

        return filtered.slice(0, 50);
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
