
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client'; // Use the getter function
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for initialization errors

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      // Get the Auth instance safely
      const authInstance = getFirebaseAuth();

      // Listen for authentication state changes
      unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null); // Clear error on successful listener setup
        // console.log('Auth state changed:', currentUser?.email); // Debug log
      });

    } catch (initError: any) {
        console.error("Failed to initialize Firebase Auth:", initError);
        setError(initError.message || "Failed to initialize authentication.");
        setLoading(false); // Stop loading even on error
    }

    // Unsubscribe from the listener when the component unmounts
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Show a loading state while Firebase initializes
  if (loading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-secondary">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="sr-only">Loading authentication...</p>
        </div>
    );
  }

   // Show error message if initialization failed
  if (error) {
      return (
           <div className="flex h-screen w-screen flex-col items-center justify-center bg-destructive/10 p-4 text-center">
                <h1 className="text-xl font-semibold text-destructive mb-2">Authentication Error</h1>
                <p className="text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground mt-4">Please check the console and ensure your Firebase configuration (especially the API Key) is correct in the environment variables.</p>
            </div>
      )
  }


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Return loading state as well if needed elsewhere
  return context;
};

