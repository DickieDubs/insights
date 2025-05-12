
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation'; 
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar'; 
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { SidebarProvider } from '@/components/ui/sidebar';


interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname

  
  const { user, isLoading } = useAuth(); // Assuming useAuth provides user object and loading state

  useEffect(() => {
    // Wait until loading is complete to check auth status
    if (!isLoading && !user) {
      router.push('/login/admin');
    }
  }, [user, isLoading, router]);

  // Show loading spinner while authentication status is being checked
  if (isLoading) {
    // This state should ideally be brief as useEffect will redirect.
    // However, if there's a flash of this content, a loader is better.
    return <LoadingSpinner fullScreen={true} message="Redirecting to login..." />;
  }

  // If user is not authenticated after loading, they should have been redirected by useEffect.
  // This check is mainly for clarity, though the useEffect should handle it.
  if (!user) {
     return null; // Or a redirecting message if useEffect is delayed
  }

  // Ensure user is on a path appropriate for their role
  // This is a secondary check in case the useEffect redirect is slow or route is accessed directly
  if (user.role === 'admin' && pathname.startsWith('/client')) {
    return <LoadingSpinner fullScreen={true} message="Redirecting to admin dashboard..." />;
  }
  if (user.role === 'client' && pathname.startsWith('/admin')) {
     return <LoadingSpinner fullScreen={true} message="Redirecting to client dashboard..." />;
  }


  return (
    <SidebarProvider> {/* Wrap the entire layout with SidebarProvider */}
      <div className="flex h-screen overflow-hidden"> {/* Use flexbox to arrange sidebar and content, hide overflow */}
        <Sidebar /> {/* Include the Sidebar component here */}
        <main className="flex-1 overflow-y-auto"> {/* Main content area, takes remaining space and allows vertical scrolling */}
          <div className="container mx-auto px-4 py-6"> {/* Container for content with padding */}
            {/* You might want a header or breadcrumbs here */}
            {children}
          </div>
        </main>

      </div>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
