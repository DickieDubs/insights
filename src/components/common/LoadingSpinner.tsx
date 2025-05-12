
"use client";

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  containerClassName?: string;
  iconClassName?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  containerClassName, 
  iconClassName, 
  message,
  fullScreen = false 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-foreground", 
        fullScreen && "h-screen w-screen bg-background",
        containerClassName
      )}
      aria-live="polite"
      role="status"
    >
      <Loader2 className={cn("h-10 w-10 animate-spin text-primary", iconClassName)} />
      {message && <p className="text-md text-muted-foreground">{message}</p>}
      {fullScreen && !message && <p className="sr-only">Loading content</p>}
    </div>
  );
}
