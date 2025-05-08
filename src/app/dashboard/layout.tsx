
'use client';

import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart2,
  Settings,
  Bell,
  Sparkles,
  FilePieChart,
  Award,
  Palette,
  List,
  PlusCircle,
  UsersRound, 
  TrendingUp, // Added for Trends
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isLinkActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  useEffect(() => {
    if (pathname.startsWith('/clients')) {
      setActiveDropdown('clients-menu');
    } else if (pathname.startsWith('/campaigns')) {
      setActiveDropdown('campaigns-menu');
    } else if (pathname.startsWith('/surveys')) {
      setActiveDropdown('surveys-menu');
    } else if (pathname.startsWith('/consumers')) {
      setActiveDropdown('consumers-menu');
    } else if (pathname.startsWith('/trends')) { // Added for Trends
      setActiveDropdown(null); // Trends is not a dropdown
    } else {
      setActiveDropdown(null);
    }
  }, [pathname]);


  return (
    <SidebarProvider defaultActiveDropdown={null}>
        <div className="flex min-h-screen w-full bg-secondary">
          <Sidebar variant="sidebar" collapsible="icon" side="left" className="data-[variant=sidebar]:max-md:hidden">
              <SidebarHeader className="flex items-center justify-center p-2 group-data-[collapsible=icon]:justify-center">
                <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                    <Image src="/insightpulse-logo.svg" alt="InsightPulse Logo" width={32} height={32} data-ai-hint="pulse logo" />
                    <span className="text-lg font-semibold text-primary">InsightPulse</span>
                </Link>
                <Link href="/" className="hidden items-center gap-2 group-data-[collapsible=icon]:flex">
                    <Image src="/insightpulse-logo.svg" alt="InsightPulse Logo" width={32} height={32} data-ai-hint="pulse logo"/>
                </Link>
                <div className="hidden group-data-[collapsible=icon]:hidden md:group-data-[collapsible=offcanvas]:block ml-auto">
                    <SidebarTrigger />
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu value={activeDropdown || undefined} onValueChange={setActiveDropdown}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive('/dashboard')} tooltip="Dashboard" >
                        <Link href="/dashboard">
                          <LayoutDashboard />
                          <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive('/brand')} tooltip="Brand">
                      <Link href="/brand">
                        <Sparkles />
                        <span>Brand</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem value="clients-menu" isDropdown>
                    <SidebarMenuButton isActive={isLinkActive('/clients')} tooltip="Clients">
                      <Users />
                      <span>Clients</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/clients'}>
                          <Link href="/clients"><List className="mr-2"/>All Clients</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/clients/new'}>
                          <Link href="/clients/new"><PlusCircle className="mr-2"/>Add Client</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>

                  <SidebarMenuItem value="campaigns-menu" isDropdown>
                    <SidebarMenuButton isActive={isLinkActive('/campaigns')} tooltip="Campaigns">
                      <Briefcase />
                      <span>Campaigns</span>
                    </SidebarMenuButton>
                     <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/campaigns'}>
                          <Link href="/campaigns"><List className="mr-2"/>All Campaigns</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/campaigns/new'}>
                          <Link href="/campaigns/new"><PlusCircle className="mr-2"/>Add Campaign</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>

                  <SidebarMenuItem value="surveys-menu" isDropdown>
                    <SidebarMenuButton isActive={isLinkActive('/surveys')} tooltip="Surveys">
                      <FileText />
                      <span>Surveys</span>
                    </SidebarMenuButton>
                     <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/surveys'}>
                           <Link href="/surveys"><List className="mr-2"/>All Surveys</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/surveys/new'}>
                           <Link href="/surveys/new"><PlusCircle className="mr-2"/>Add Survey</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>

                  <SidebarMenuItem value="consumers-menu" isDropdown>
                    <SidebarMenuButton isActive={isLinkActive('/consumers')} tooltip="Consumers">
                      <UsersRound /> 
                      <span>Consumers</span>
                    </SidebarMenuButton>
                     <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/consumers'}>
                           <Link href="/consumers"><List className="mr-2"/>All Consumers</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/consumers/new'}>
                           <Link href="/consumers/new"><PlusCircle className="mr-2"/>Add Consumer</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive('/trends')} tooltip="Trends">
                        <Link href="/trends">
                            <TrendingUp />
                            <span>Trends</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive('/insights')} tooltip="Insights">
                        <Link href="/insights">
                            <BarChart2 />
                            <span>Insights</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive('/reports')} tooltip="Reports">
                        <Link href="/reports">
                            <FilePieChart />
                            <span>Reports</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isLinkActive('/rewards')} tooltip="Rewards">
                        <Link href="/rewards">
                            <Award />
                            <span>Rewards</span>
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
                <SidebarHeader className="mt-auto">
                     <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isLinkActive('/settings')} tooltip="Settings">
                            <Link href="/settings">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
          </Sidebar>

          <SidebarInset className="flex flex-col bg-background">
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                 <div className="flex-1">
                    {/* Placeholder for global search or breadcrumbs if needed */}
                 </div>
                <div className="flex items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Palette className="h-5 w-5" />
                                <span className="sr-only">Change theme</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <ThemeSwitcher />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
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

