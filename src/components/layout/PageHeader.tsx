
import type { ReactNode } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar'; // Corrected import path

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      {/* Use SidebarTrigger for both mobile and desktop toggles */}
      <SidebarTrigger className="md:hidden" /> {/* Show trigger only on smaller screens */}
      <h1 className="text-2xl font-semibold">{title}</h1>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}

