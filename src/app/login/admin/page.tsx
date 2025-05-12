
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import type { LoginCredentials } from '@/lib/schemas';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AdminLoginPage() {
  const { loginAdmin, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
     return <LoadingSpinner fullScreen={true} message="Loading authentication..." />;
  }
  
  if (user && user.role === 'admin') {
    // Already logged in and on the correct dashboard path, or will be redirected by useEffect
     return <LoadingSpinner fullScreen={true} message="Redirecting to dashboard..." />;
  }


  const handleAdminLogin = async (credentials: LoginCredentials) => {
    await loginAdmin(credentials);
    // Navigation is handled by AuthContext or useEffect above
  };

  return (
    <LoginForm
      formTitle="Admin Login"
      formDescription="Enter your administrator credentials to access the dashboard."
      onSubmit={handleAdminLogin}
      otherLoginLink={{ href: "/login/client", text: "Client Login" }}
    />
  );
}
