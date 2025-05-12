import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Logo from '@/components/icons/Logo';
import { Sheet, SheetContent, SheetHeader as UiSheetHeader, SheetTitle as UiSheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: UserRole | null;
  filteredNavItems: NavItem[];
  logout: () => void;
}

const MobileSheet = ({ open, onOpenChange, role, filteredNavItems, logout }: MobileSheetProps) => {
  const pathname = usePathname();

  const sidebarMenuContent = (
    <>
      <SidebarHeader>
        <Link
          href={role === 'admin' ? '/admin/dashboard' : '/client/dashboard'}
          className={cn(
            "flex items-center gap-x-2"
          )}
        >
          <Logo
            showText={true}
            iconClassName="h-7 w-7 text-sidebar-primary"
            textClassName="text-lg font-bold text-sidebar-foreground"
          />
          <span className="sr-only">InsightWise Home</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: "right" }}
                  aria-label={item.label}
                  onClick={() => onOpenChange(false)} // Close mobile sheet on nav
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
                onOpenChange(false);
              }}
              tooltip={{ children: "Logout", side: "right" }}
              aria-label="Logout"
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="bg-sidebar text-sidebar-foreground p-0 w-3/4 sm:max-w-sm md:hidden flex flex-col border-r-0">
        <UiSheetHeader className="sr-only">
          <UiSheetTitle>Main Navigation</UiSheetTitle>
        </UiSheetHeader>
        {sidebarMenuContent}
      </SheetContent>
    </Sheet>
  );
};

export default MobileSheet;