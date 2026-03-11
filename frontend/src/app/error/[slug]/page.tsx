import { db } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Share2 } from "lucide-react";
import MarkdownRenderer from "@/components/markdown-renderer";

export const revalidate = 60;

// Dynamic Metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const snapshot = await db.collection("errors").where("slug", "==", slug).limit(1).get();

    if (snapshot.empty) {
        return { title: "Error Not Found - ErrorWiki" };
    }

    const errorData = snapshot.docs[0].data();
    return {
        title: `How to Fix ${errorData.title} - ErrorWiki`,
        description: `Learn how to resolve the ${errorData.title} error (Code: ${errorData.errorCode}). Read the complete solution and step-by-step guide on ErrorWiki.`,
    };
}

export default async function ErrorPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    // 1. Fetch current error
    const snapshot = await db.collection("errors").where("slug", "==", slug).limit(1).get();

    if (snapshot.empty) {
        notFound();
    }

    const errorData = snapshot.docs[0].data();
    const content = errorData.solution || errorData.content || "No solution provided.";

    // Generate Table of Contents
    const tocMatches = content.match(/^#{2,3}\s+(.*)$/gm);
    const toc = tocMatches?.map((match: string) => {
        const level = match.startsWith("###") ? 3 : 2;
        const text = match.replace(/^#{2,3}\s+/, "").trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, "-");
        return { level, text, id };
    }) || [];

    // Calculate Read Time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Placeholder domain for sharing
    const pageUrl = `https://errorwiki.com/error/${slug}`;

    // 2. Fetch related errors
    let relatedErrors: any[] = [];
    try {
        const relatedSnapshot = await db.collection("errors").orderBy("createdAt", "desc").limit(5).get();
        relatedErrors = relatedSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((err: any) => err.slug !== slug)
            .slice(0, 4);
    } catch (err) {
        console.error("Failed to fetch related", err);
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in duration-500 relative">

            {/* Floating Social Share Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 border-t border-slate-200 dark:border-slate-800 lg:bottom-auto lg:top-1/3 lg:left-4 lg:right-auto lg:flex-col lg:border-t-0 lg:border lg:rounded-2xl lg:p-3 lg:shadow-xl lg:bg-white dark:lg:bg-slate-900 transition-all">
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(errorData.title + ' ' + pageUrl)}`} target="_blank" rel="noopener noreferrer"
                    className="p-3 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-[#25D366]/20 dark:text-[#25D366] dark:hover:bg-[#25D366]/30 rounded-full transition-transform hover:scale-110 flex items-center justify-center group" title="Share on WhatsApp">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.423-.101.827z" /></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(errorData.title)}`} target="_blank" rel="noopener noreferrer"
                    className="p-3 bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-[#1DA1F2]/20 dark:text-[#1DA1F2] dark:hover:bg-[#1DA1F2]/30 rounded-full transition-transform hover:scale-110 flex items-center justify-center group" title="Share on Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer"
                    className="p-3 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-[#0A66C2]/20 dark:text-[#0A66C2] dark:hover:bg-[#0A66C2]/30 rounded-full transition-transform hover:scale-110 flex items-center justify-center group" title="Share on LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
            </div>

            {/* Main Content Area */}
            <article className="lg:w-2/3 xl:w-3/4">

                {/* Breadcrumb Navigation */}
                <nav className="flex items-center text-sm font-medium text-slate-500 mb-6 space-x-2">
                    <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span className="text-slate-800 dark:text-slate-400">{errorData.errorCode !== "N/A" ? errorData.errorCode : "Category"}</span>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span className="text-slate-800 dark:text-slate-200 line-clamp-1 truncate">{errorData.title}</span>
                </nav>

                {/* Top Ad Placeholder */}
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 mb-10 overflow-hidden relative group">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Top Adense Placement</span>
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay group-hover:bg-blue-500/10 transition-colors"></div>
                </div>

                <header className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="inline-flex items-center px-4 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-sm font-bold rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                            Error Code: {errorData.errorCode || "N/A"}
                        </div>

                        {/* Reading Time Badge */}
                        <div className="inline-flex items-center text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                            <Clock size={16} className="mr-2" />
                            {readTime} min read
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                        How to fix {errorData.title}
                    </h1>
                </header>

                {/* Markdown Content via Client Component Renderer */}
                <div className="prose prose-lg dark:prose-invert prose-blue max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-a:text-blue-600 prose-li:marker:text-blue-500 mb-12">
                    <MarkdownRenderer content={content} />
                </div>

                {/* Bottom Ad Placeholder */}
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 mt-12 mb-8 relative group">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Bottom AdSense Placement</span>
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay group-hover:bg-blue-500/10 transition-colors"></div>
                </div>
            </article>

            {/* Sidebar Area */}
            <aside className="lg:w-1/3 xl:w-1/4 space-y-8 mt-12 lg:mt-0 lg:sticky lg:top-24 h-fit">

                {/* Table of Contents - Dynamic Sidebar */}
                {toc.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 border-l-4 border-l-blue-500 hidden md:block">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-sm">
                            On this page
                        </h3>
                        <ul className="space-y-3 text-sm">
                            {toc.map((heading: any, index: number) => (
                                <li key={index} className={heading.level === 3 ? "ml-4" : ""}>
                                    <a href={`#${heading.id}`} className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors hover:underline block leading-tight">
                                        {heading.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Sidebar Ad Placeholder */}
                <div className="w-full aspect-square md:aspect-video lg:aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 relative group overflow-hidden shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Sidebar AdSense</span>
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay group-hover:bg-blue-500/10 transition-colors"></div>
                </div>

                {/* Related Errors */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center uppercase tracking-wider text-sm">
                        Related Errors
                    </h3>
                    {relatedErrors.length > 0 ? (
                        <ul className="space-y-4">
                            {relatedErrors.map((rel: any) => (
                                <li key={rel.id} className="group border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                                    <Link href={`/error/${rel.slug}`} className="block">
                                        <h4 className="text-slate-800 dark:text-slate-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                            {rel.title}
                                        </h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase font-semibold">
                                            {rel.errorCode}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-sm">No related errors at this time.</p>
                    )}
                </div>
            </aside>
        </div>
    );
}
