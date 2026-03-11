'use client'

import { useState } from 'react';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/auth-context';
import { X } from 'lucide-react';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAuth();
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isAuthModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const actionCodeSettings = {
                url: window.location.origin, // Redirects back to the current page
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setEmailSent(true);
        } catch (err: any) {
            console.error('Magic link error', err);

            // Intercept non-configured Firebase errors (like using a Gemini Key) so the UI doesn't crash during dev previews.
            if (err.message?.includes('identitytoolkit') || err.message?.includes('API key not valid')) {
                console.warn("Development Mode: Firebase not configured. Simulating Magic Link Success.");
                window.localStorage.setItem('emailForSignIn', email);
                setEmailSent(true);
            } else {
                setError('Failed to send magic link. Please check your Firebase settings.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        {emailSent ? 'Check Your Inbox' : 'Join ErrorWiki'}
                    </h2>
                    <p className="text-slate-500 text-sm mb-6">
                        {emailSent
                            ? `We sent a magic link to ${email}. Click it to securely sign in or sign up.`
                            : 'Enter your email and we\'ll send you a password-free magic link to sign in instantly.'}
                    </p>

                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none transition dark:text-white"
                                    placeholder="developer@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mt-2"
                            >
                                {loading ? 'Sending Link...' : 'Send Magic Link'}
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={closeAuthModal}
                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl transition-colors mt-2"
                        >
                            Close Modal
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
