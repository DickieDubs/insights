

'use client'; // Mark as client component because it uses hooks (useAuth, useRouter)

import type { ReactNode } from 'react';
import React from 'react'; // Import React
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart2,
  Settings,
  Bell,
  LogOut,
  Loader2,
  Sparkles, // New icon for Brand
  FilePieChart, // New icon for Reports
  Award, // New icon for Rewards
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context'; // Import useAuth hook
import { getFirebaseAuth } from '@/lib/firebase/client'; // Use the getter function
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
   const { user, loading } = useAuth(); // Get user and loading state
   const router = useRouter();
   const { toast } = useToast(); // Get toast function
    // Get auth instance safely
   const [authInstance, setAuthInstance] = React.useState(() => {
      try {
          return getFirebaseAuth();
      } catch (error) {
          console.error("Failed to get Firebase Auth instance in Dashboard Layout:", error);
          // No toast here, let AuthProvider handle critical init errors
          return null;
      }
  });

   const handleLogout = async () => {
    if (!authInstance) {
       toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
       return;
    }
    try {
      await signOut(authInstance);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      // Redirecting to login will be handled by ProtectedRoute
      // router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
       toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
      });
    }
  };

   // Get user initials for Avatar fallback
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '??';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
     if (nameParts[0]) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // Display loading state while auth is initializing (handled by AuthProvider/ProtectedRoute)
  // if (loading) { ... } // Removed redundant loading check

  // If auth instance failed to initialize (should be caught by AuthProvider ideally)
  // if (!authInstance) { ... } // Removed redundant auth instance check

  // If user is null after loading (shouldn't happen due to ProtectedRoute, but safe check)
  // if (!user && !loading) { ... } // Removed redundant user check

  // Render the layout only when loading is false and user exists (ensured by ProtectedRoute)
  if (loading || !user) {
    // ProtectedRoute shows its own loading/redirect indicator
    return null;
  }


  return (
     // Wrap the entire layout content with SidebarProvider
    <SidebarProvider>
        <div className="flex min-h-screen w-full bg-secondary">
          <Sidebar variant="sidebar" collapsible="icon" side="left">
              <SidebarHeader className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                    <Image src="/insightpulse-logo.svg" alt="InsightPulse Logo" width={32} height={32} data-ai-hint="pulse logo" />
                    <span className="text-lg font-semibold text-primary">InsightPulse</span>
                </Link>
                {/* Sidebar Trigger is only visible in non-mobile views when sidebar is collapsible */}
                <div className="hidden md:block">
                    <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Dashboard" >
                        <Link href="/dashboard">
                          <LayoutDashboard />
                          <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Brand">
                      <Link href="/brand">
                        <Sparkles />
                        <span>Brand</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Clients">
                      <Link href="/clients">
                        <Users />
                        <span>Clients</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Campaigns">
                      <Link href="/campaigns">
                        <Briefcase />
                        <span>Campaigns</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Surveys">
                      <Link href="/surveys">
                        <FileText />
                        <span>Surveys</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Insights">
                        <Link href="/insights">
                            <BarChart2 />
                            <span>Insights</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Reports">
                        <Link href="/reports">
                            <FilePieChart />
                            <span>Reports</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Rewards">
                        <Link href="/rewards">
                            <Award />
                            <span>Rewards</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={false} tooltip="Settings">
                      <Link href="/settings">
                        <Settings />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              {/* Footer could go here if needed */}
          </Sidebar>

          <SidebarInset className="flex flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
                {/* Mobile Sidebar Trigger */}
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                {/* Placeholder for Search or Title if needed */}
                <div className="flex-1"></div>
                <div className="flex items-center gap-4">
                    {/* Optional Notifications */}
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                              {/* Use user's photoURL if available, otherwise fallback */}
                              <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user.uid}/32/32`} data-ai-hint="person avatar" alt={user?.displayName || "User"} />
                              <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{user?.displayName || 'User Profile'}</DropdownMenuLabel>
                           <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{user?.email}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                              <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 sm:px-6 sm:py-0">
              {children}
            </main>
          </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
