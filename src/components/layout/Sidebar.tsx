
"use client";

import * as React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  Briefcase,
  Settings,
  LayoutDashboard,
  LogOut,
  Building, ClipboardList, PanelLeftOpen, PanelLeftClose, Link as LinkIcon, Activity
} from "lucide-react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import {
  Sidebar as UiSidebar, // Renamed to avoid conflict with component name
  SidebarProvider, SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton, SidebarFooter,
  useSidebar, // Import the hook to get state
} from '@/components/ui/sidebar';
import Logo from '@/components/icons/Logo';
import { Sheet, SheetContent, SheetHeader as UiSheetHeader, SheetTitle as UiSheetTitle } from '@/components/ui/sheet'; // SheetClose not needed if nav closes sheet
import { cn } from '@/lib/utils';
import MobileSheet from "./MobileSheet";
import { Button } from "@/components/ui/button"; // Import Button


interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { href: '/admin/clients', label: 'Clients', icon: Users, roles: ['admin'] },
  { href: '/admin/brands', label: 'Brands', icon: Building, roles: ['admin'] },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Briefcase, roles: ['admin'] },
  { href: '/admin/surveys', label: 'Surveys', icon: ClipboardList, roles: ['admin'] },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },

  { href: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['client'] },
  { href: '/client/campaigns', label: 'Campaigns', icon: Briefcase, roles: ['client'] },
  { href: '/client/surveys', label: 'Surveys', icon: ClipboardList, roles: ['client'] },
  { href: '/client/reports', label: 'Reports', icon: BarChart3, roles: ['client'] },
];

export function Sidebar() { // Changed component name to avoid conflict with import
  const pathname = usePathname();
  const { role, logout, user } = useAuth();
  // Get state and setters from the context provider via the hook
  const { isMobileSheetOpen, setIsMobileSheetOpen, isDesktopOpen, setIsDesktopOpen } = useSidebar();
  // REMOVED Redundant useState declaration:
  // const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  const filteredNavItems = navItems.filter(item => role && item.roles.includes(role));

  if (!user) return null;

  // Function to toggle desktop sidebar state
   const toggleDesktopSidebar = () => {
    setIsDesktopOpen(prev => !prev);
  };

  // Desktop sidebar content moved to a function for clarity
  const renderDesktopSidebarContent = (isIconOnly?: boolean) => (
    <>
      <SidebarHeader isIconOnly={isIconOnly}>
        <Link
          href={role === 'admin' ? '/admin/dashboard' : '/client/dashboard'}
          className={cn(
            "flex items-center",
            isIconOnly ? "justify-center w-full" : "gap-x-2"
          )}
        >
          <Logo
            showText={!isIconOnly}
            iconClassName="h-7 w-7 text-sidebar-primary"
            textClassName={cn(
              "text-lg font-bold text-sidebar-foreground",
              isIconOnly && "hidden" // Explicitly hide if needed
            )}
          />
          <span className="sr-only">InsightWise Home</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2" isIconOnly={isIconOnly}>
        <SidebarMenu isIconOnly={isIconOnly}>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: "right" }}
                  aria-label={item.label}
                  isIconOnly={isIconOnly}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2" isIconOnly={isIconOnly}>
        <SidebarMenu isIconOnly={isIconOnly}>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
              }}
              tooltip={{ children: "Logout", side: "right" }}
              aria-label="Logout"
              isIconOnly={isIconOnly}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar using UiSidebar */}
      <UiSidebar className={cn(
        "border-r hidden md:flex flex-col transition-all duration-300 ease-in-out bg-sidebar text-sidebar-foreground", // Added background/text colors explicitly
        isDesktopOpen ? "w-64" : "w-[72px]" // Adjust width based on state
      )}>
        {renderDesktopSidebarContent(!isDesktopOpen)}
        {/* Add close button for desktop */}
        <div className="p-2 mt-auto border-t border-sidebar-border">
          <SidebarMenuButton
            onClick={toggleDesktopSidebar}
            isIconOnly={!isDesktopOpen}
            tooltip={isDesktopOpen ? undefined : { children: 'Expand Sidebar', side: 'right'}}
            aria-label={isDesktopOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            className="w-full"
          >
             {isDesktopOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
             {isDesktopOpen && <span className="ml-2">Collapse</span>}
          </SidebarMenuButton>
        </div>
      </UiSidebar>

      {/* Mobile Sheet remains for small screens */}
      <MobileSheet
        open={isMobileSheetOpen}
        onOpenChange={setIsMobileSheetOpen} // Use setter from hook
        role={role}
        filteredNavItems={filteredNavItems}
        logout={logout}
      />
    </>
  );
}

// Export the SidebarTrigger for use in PageHeader
export { SidebarTrigger } from '@/components/ui/sidebar';
export { SidebarProvider } from '@/components/ui/sidebar'; // Re-export SidebarProvider if needed elsewhere

