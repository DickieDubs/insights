
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginAdmin as apiLoginAdmin, loginClient as apiLoginClient } from '@/services/cia-api';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'client' | null;

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  // Add any other user-specific details
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  loginAdmin: (credentials: any) => Promise<void>;
  loginClient: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const initializeAuth = useCallback(() => {
    setIsLoading(true);
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setRole(storedUser.role);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleLogin = (userData: any, userToken: string, userRole: UserRole) => {
    const loggedInUser: User = {
      id: userData.id || userData.userId || 'unknown', // Adjust based on API response
      email: userData.email,
      name: userData.name || userData.username,
      role: userRole,
    };
    setUser(loggedInUser);
    setToken(userToken);
    setRole(userRole);
    storage.setToken(userToken);
    storage.setUser(loggedInUser);
    toast({ title: "Login Successful", description: `Welcome, ${loggedInUser.name || loggedInUser.email}!` });
    router.push(userRole === 'admin' ? '/admin/dashboard' : '/client/dashboard');
  };

  const loginAdmin = async (credentials: any) => {
    try {
      const response = await apiLoginAdmin(credentials);
      // Assuming API response includes user details directly or in a nested object
      const apiUser = response.user || { id: 'admin_id', email: credentials.email, name: 'Admin User'}; // Placeholder
      handleLogin(apiUser, response.token, 'admin');
    } catch (error: any) {
      console.error("Admin login failed:", error);
      toast({ title: "Login Failed", description: error.response?.data?.message || error.message || "An unexpected error occurred.", variant: "destructive" });
      throw error;
    }
  };

  const loginClient = async (credentials: any) => {
    try {
      const response = await apiLoginClient(credentials);
      const apiUser = response.user || { id: 'client_id', email: credentials.email, name: 'Client User'}; // Placeholder
      handleLogin(apiUser, response.token, 'client');
    } catch (error: any) {
      console.error("Client login failed:", error);
      toast({ title: "Login Failed", description: error.response?.data?.message || error.message || "An unexpected error occurred.", variant: "destructive" });
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRole(null);
    storage.clearAll();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    // Determine where to redirect after logout. Could be a generic login page or specific one.
    if (pathname.startsWith('/admin')) {
      router.push('/login/admin');
    } else if (pathname.startsWith('/client')) {
      router.push('/login/client');
    } else {
      router.push('/'); // Fallback to home, which redirects
    }
  }, [router, toast, pathname]);

  return (
    <AuthContext.Provider value={{ user, token, role, isLoading, loginAdmin, loginClient, logout }}>
      {children}
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
