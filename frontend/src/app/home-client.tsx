'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Clock, Database, Terminal, FileCode2, Server, Coffee, Code2, Users, CheckCircle, Zap } from "lucide-react"
import { searchErrorsAction } from "@/app/actions"
import { useAuth } from "@/components/auth-context"

const CATEGORIES = [
    { name: "JavaScript", icon: Terminal, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { name: "Python", icon: FileCode2, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "MySQL", icon: Database, color: "text-orange-500", bg: "bg-orange-500/10" },
    { name: "React", icon: Code2, color: "text-sky-400", bg: "bg-sky-400/10" },
    { name: "Node.js", icon: Server, color: "text-green-500", bg: "bg-green-500/10" },
    { name: "Java", icon: Coffee, color: "text-red-500", bg: "bg-red-500/10" }
]

export default function HomeClient({ initialErrors }: { initialErrors: any[] }) {
    const { user, openAuthModal } = useAuth()
    const [query, setQuery] = useState("")
    const [errors, setErrors] = useState(initialErrors)
    const [loading, setLoading] = useState(false)
    const [displayCount, setDisplayCount] = useState(12)

    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoading(true)
            const results = await searchErrorsAction(query)
            setErrors(results)
            setDisplayCount(12) // Reset count when searching
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleLoadMore = () => {
        setDisplayCount(prev => prev + 12)
    }

    const handleSubmitClick = () => {
        if (!user) {
            openAuthModal()
        } else {
            alert("Thanks! A secure submission portal is coming soon for authenticated users.")
        }
    }

    return (
        <div className="space-y-16">
            {/* Search Hero */}
            <section className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-3xl shadow-2xl mt-4 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-sm">
                    Find Fast Fixes For Any Error
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
                    Search our database of perfectly crafted, AI-generated solutions.
                </p>

                <div className="max-w-2xl mx-auto relative group flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
                        <Search size={24} className={loading ? 'animate-pulse text-blue-400' : ''} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search e.g., 'MYSQL Error', '404 Not Found'..."
                        className="w-full p-5 pl-14 text-lg text-slate-900 bg-white/95 backdrop-blur-sm rounded-full border-2 border-transparent focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/30 shadow-2xl transition-all placeholder:text-slate-400"
                    />
                </div>
            </section>

            {/* Browse by Technology Grid */}
            {!query && (
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            Browse by Technology
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon
                            return (
                                <Link href={`/?q=${cat.name.toLowerCase()}`} onClick={() => setQuery(cat.name)} key={cat.name} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-transform hover:-translate-y-1 group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {cat.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Latest Errors Grid */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {query.trim() ? "Search Results" : "Latest Errors"}
                    </h2>
                </div>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {errors.slice(0, displayCount).map((error: any) => {
                        const content = error.solution || error.content || "";
                        const readTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));

                        return (
                            <Link href={`/error/${error.slug}`} key={error.id} className="group flex flex-col h-full animate-in fade-in duration-300">
                                <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md hover:shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 transform group-hover:-translate-y-1">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {error.title}
                                        </h3>
                                    </div>
                                    <div className="mb-auto">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <div className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                                                {error.category || "General"}
                                            </div>
                                            <div className="inline-flex px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
                                                Code: {error.errorCode || "N/A"}
                                            </div>
                                            <div className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <Clock size={12} className="mr-1.5" />
                                                {readTime} min read
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
                                            {content}
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                        Read Solution <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {errors.length === 0 && (
                    <div className="w-full text-center py-20 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 mt-6">
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                            {query.trim() ? "No errors found matching your search." : "No errors found. Connect to Firestore and run the backend automation."}
                        </p>
                    </div>
                )}

                {displayCount < errors.length && (
                    <div className="mt-10 text-center">
                        <button onClick={handleLoadMore} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm">
                            Load More Errors
                        </button>
                    </div>
                )}
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                <div className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                    <CheckCircle size={40} className="text-blue-600 dark:text-blue-400 mb-4" />
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-2">50,000+</h4>
                    <p className="font-semibold text-slate-500 text-center">Errors Solved</p>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                    <Users size={40} className="text-indigo-600 dark:text-indigo-400 mb-4" />
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-2">10,000+</h4>
                    <p className="font-semibold text-slate-500 text-center">Developers Helped</p>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-purple-50 dark:bg-purple-900/20 rounded-3xl border border-purple-100 dark:border-purple-800/50">
                    <Zap size={40} className="text-purple-600 dark:text-purple-400 mb-4" />
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-2">100%</h4>
                    <p className="font-semibold text-slate-500 text-center">AI-Powered Solutions</p>
                </div>
            </section>

            {/* Premium CTA Section */}
            <section className="bg-gradient-to-tr from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-10 sm:p-14 text-center border-2 border-slate-200 dark:border-slate-700 shadow-xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-colors duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/20 dark:group-hover:bg-indigo-500/30 transition-colors duration-700"></div>

                <h2 className="relative z-10 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight drop-shadow-sm">
                    Found an Error we missed? 🕵️‍♂️
                </h2>
                <p className="relative z-10 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-medium">
                    Help the community by submitting a new error fix. Together we can build the ultimate developer knowledge base!
                </p>
                <button
                    onClick={handleSubmitClick}
                    className="relative z-10 inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 transform rounded-full bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                >
                    Submit Error
                    <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </button>
            </section>

            {/* Newsletter Section */}
            <section className="bg-slate-900 dark:bg-black rounded-3xl p-10 sm:p-14 border border-slate-800 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <h3 className="relative z-10 text-2xl sm:text-3xl font-bold text-white mb-4">Never Miss a Fix</h3>
                <p className="relative z-10 text-slate-400 mb-8 max-w-xl mx-auto">Join 10,000+ developers getting the latest AI-generated solutions securely delivered to their inbox.</p>
                <form className="relative z-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Subscribed!') }}>
                    <input type="email" placeholder="developer@example.com" required className="flex-1 px-5 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
                    <button type="submit" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors whitespace-nowrap">Subscribe</button>
                </form>
            </section>
        </div>
    )
}
