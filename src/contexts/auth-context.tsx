'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
// import { useRouter } from 'next/navigation'; // Uncomment if needed for redirects

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const router = useRouter(); // Uncomment if needed for redirects

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Successful login will trigger onAuthStateChanged, which sets user and loading to false.
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setLoading(false); // Ensure loading is false on error if auth state doesn't change
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        throw new Error(`Google Sign-In failed: ${firebaseError.message} (Code: ${firebaseError.code}). Check console for details.`);
      }
      throw new Error("Google Sign-In failed. Please try again. Check the console for more details.");
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      // Successful logout will trigger onAuthStateChanged, which sets user to null and loading to false.
    } catch (error) {
      console.error("Error logging out:", error);
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        throw new Error(`Logout failed: ${firebaseError.message} (Code: ${firebaseError.code}). Check console for details.`);
      }
      throw new Error("Logout failed. Please try again. Check the console for more details.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
