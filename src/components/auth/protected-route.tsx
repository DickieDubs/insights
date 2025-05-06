'use client';

import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/register']; // Routes accessible without login

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't run checks until Firebase auth state is determined
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!user && !isPublicRoute) {
      // If user is not logged in and trying to access a protected route, redirect to login
      console.log('Redirecting to login from:', pathname); // Debug log
      router.push('/login');
    } else if (user && isPublicRoute) {
      // If user is logged in and trying to access login/register, redirect to dashboard
       console.log('User logged in, redirecting to dashboard from:', pathname); // Debug log
       router.push('/dashboard');
    }
     // Special case: If user is logged in and on the root path, redirect to dashboard
    else if (user && pathname === '/') {
        console.log('User logged in on root, redirecting to dashboard'); // Debug log
        router.push('/dashboard');
    }
    // Otherwise, allow access (user is logged in on protected route, or not logged in on public route)

  }, [user, loading, router, pathname]);

  // While loading auth state, show loading indicator
  if (loading) {
     return (
        <div className="flex h-screen w-screen items-center justify-center bg-secondary">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
             <p className="sr-only">Checking authentication...</p>
        </div>
    );
  }

  // If user is not logged in and on a public route, show the public page (e.g., Login)
   if (!user && PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // If user is logged in, show the protected content
   if (user && !PUBLIC_ROUTES.includes(pathname)) {
     return <>{children}</>;
   }

   // Fallback loading/redirect state (should ideally not be reached often due to useEffect logic)
  return (
     <div className="flex h-screen w-screen items-center justify-center bg-secondary">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="sr-only">Redirecting...</p>
    </div>
  );

}
