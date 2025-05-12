
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import type { LoginCredentials } from '@/lib/schemas';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function ClientLoginPage() {
  const { loginClient, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && user.role === 'client') {
      router.replace('/client/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <LoadingSpinner fullScreen={true} message="Loading authentication..." />;
  }

  if (user && user.role === 'client') {
     return <LoadingSpinner fullScreen={true} message="Redirecting to dashboard..." />;
  }

  const handleClientLogin = async (credentials: LoginCredentials) => {
    await loginClient(credentials);
    // Navigation is handled by AuthContext or useEffect above
  };

  return (
    <LoginForm
      formTitle="Client Login"
      formDescription="Sign in to access your personalized insights and reports."
      onSubmit={handleClientLogin}
      otherLoginLink={{ href: "/login/admin", text: "Admin Login" }}
    />
  );
}
