
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    setIsAuthenticating(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      router.push('/dashboard');
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing in: ", error);
      let description = "Please check your credentials and try again.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = "The email or password you entered is incorrect. Please double-check and try again. Ensure you have already signed up if this is a new account.";
      } else if (error.message) {
        description = error.message;
      }
      toast({ title: "Sign In Failed", description: description, variant: "destructive" });
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const signUpWithEmail = async (email: string, pass: string): Promise<User | null> => {
    setIsAuthenticating(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      router.push('/dashboard'); // Or a welcome page
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing up: ", error);
      toast({ title: "Sign Up Failed", description: error.message || "Could not create account.", variant: "destructive" });
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  };


  const signOut = async () => {
    setLoading(true); // Can also use isAuthenticating or a new state for sign-out process
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({ title: "Sign Out Failed", description: error.message || "Could not sign out.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticating, signInWithEmail, signUpWithEmail, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

