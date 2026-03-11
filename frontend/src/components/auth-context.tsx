'use client'

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isAuthModalOpen: boolean;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        try {
            // Check if we just clicked a magic link
            if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                if (!email) {
                    // Usually this means they opened the link on a different device
                    email = window.prompt('Please provide your email for confirmation');
                }
                if (email) {
                    signInWithEmailLink(auth, email, window.location.href)
                        .then(() => {
                            window.localStorage.removeItem('emailForSignIn');
                            // Clean the URL
                            window.history.replaceState(null, '', window.location.pathname);
                        })
                        .catch((err) => console.error("Magic link verification failed", err));
                }
            }

            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (e) {
            setLoading(false);
        }
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error(error);
        }
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    return (
        <AuthContext.Provider value={{ user, loading, signOut, isAuthModalOpen, openAuthModal, closeAuthModal }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
