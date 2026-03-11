'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, LogOut, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import Image from 'next/image'
import { useAuth } from '@/components/auth-context'

export default function Navbar() {
    const { theme, setTheme } = useTheme()
    const { user, loading, signOut, openAuthModal } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <nav className="border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-3 text-3xl font-black tracking-tighter text-blue-600 dark:text-blue-400">
                            <Image src="/logo.png" alt="ErrorWiki Logo" width={40} height={40} className="w-10 h-10 object-contain drop-shadow-sm" />
                            ErrorWiki
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        )}
                        {!loading && user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" title={user.email || 'User'}>
                                    <UserIcon size={16} />
                                </div>
                                <button onClick={signOut} className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1">
                                    <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        ) : !loading && !user ? (
                            <button onClick={openAuthModal} className="text-sm font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all">
                                Sign In
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    )
}
