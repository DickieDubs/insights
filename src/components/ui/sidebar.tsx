
"use client";

import * as React from "react";
import { PanelLeftOpen } from "lucide-react"; // Removed unused icons, kept PanelLeftOpen
import { useMediaQuery } from "usehooks-ts";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Removed UiSheetTrigger as it's not directly used by the fixed SidebarTrigger on mobile

interface SidebarContextValue {
  isDesktopOpen: boolean;
  setIsDesktopOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileSheetOpen: boolean;
  setIsMobileSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps extends React.PropsWithChildren {
  defaultOpen?: boolean;
  // Removed externalMobileOpen and externalSetMobileOpen as internal state should suffice
}

export const SidebarProvider = ({ children, defaultOpen = true }: SidebarProviderProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isDesktopOpenState, setIsDesktopOpenState] = React.useState(defaultOpen);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  React.useEffect(() => {
    console.log("SidebarProvider: isDesktopOpenState (from useState) changed to:", isDesktopOpenState);
  }, [isDesktopOpenState]);

  const setIsDesktopOpen = React.useCallback((value: boolean | ((prevState: boolean) => boolean)) => {
    console.log("SidebarProvider: setIsDesktopOpen called. isDesktop:", isDesktop);
    if (isDesktop) {
      console.log("SidebarProvider: Calling setIsDesktopOpenState (useState setter)");
      setIsDesktopOpenState(value);
    } else {
      // This case should ideally not be hit if SidebarTrigger handles mobile separately
      console.warn("SidebarProvider: setIsDesktopOpen called on mobile, which might be unintended. Toggling mobile sheet instead.");
      setIsMobileSheetOpen(value);
    }
  }, [isDesktop, setIsDesktopOpenState, setIsMobileSheetOpen]);

  // Determine the effective isDesktopOpen value for the context
  const contextValueIsDesktopOpen = isDesktop ? isDesktopOpenState : false;
  React.useEffect(() => {
    console.log("SidebarProvider: contextValueIsDesktopOpen for context is now:", contextValueIsDesktopOpen);
  }, [contextValueIsDesktopOpen]);

  React.useEffect(() => {
    // If switching from desktop to mobile view
    if (!isDesktop && isDesktopOpenState) {
      // If the desktop sidebar was open, ensure the mobile sheet reflects an open state if desired,
      // or close the desktop state. For now, we let mobile sheet be controlled independently by its trigger.
      // setIsMobileSheetOpen(true); // Example: open mobile sheet if desktop was open
    }
    // If switching from mobile to desktop view
    else if (isDesktop && isMobileSheetOpen) {
      // If the mobile sheet was open, close it.
      setIsMobileSheetOpen(false);
    }
  }, [isDesktop, isDesktopOpenState, isMobileSheetOpen, setIsMobileSheetOpen]);

  return (
    <SidebarContext.Provider value={{ isDesktopOpen: contextValueIsDesktopOpen, setIsDesktopOpen, isMobileSheetOpen, setIsMobileSheetOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: "icon" | "full";
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsible = "icon", children, ...props }, ref) => {
    const { isDesktopOpen } = useSidebar();
    const isActualIconOnlyStateForAside = collapsible === "icon" && !isDesktopOpen;

    return (
      <aside
        ref={ref}
        className={cn(
          "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-in-out",
          isDesktopOpen ? "w-64" : (collapsible === "icon" ? "w-[72px]" : "w-0"),
          isActualIconOnlyStateForAside && "items-center",
          className
        )}
        data-collapsed={!isDesktopOpen}
        {...props}
      >
        {children}
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

interface SidebarChildProps {
  isIconOnly?: boolean;
}

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SidebarChildProps
>(({ className, isIconOnly, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-16 items-center border-b border-sidebar-border",
        isIconOnly ? "justify-center" : "px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SidebarChildProps
>(({ className, isIconOnly: _isIconOnly, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & SidebarChildProps
>(({ className, isIconOnly: _isIconOnly, ...props }, ref) => {
  return (
    <ul
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    />
  );
});
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  tooltip?: {
    children: React.ReactNode;
    side?: "left" | "right" | "top" | "bottom";
    align?: "start" | "center" | "end";
  };
  isIconOnly?: boolean;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    { className, isActive, tooltip, children, isIconOnly: propIsIconOnly, ...props },
    ref
  ) => {
    const { isDesktopOpen } = useSidebar();
    const isIconOnly = propIsIconOnly !== undefined ? propIsIconOnly : !isDesktopOpen;

    const buttonContent = (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
          isIconOnly && "justify-center",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type !== "span") {
            return React.cloneElement(child, { className: cn("h-5 w-5", (child.props as any).className) } as any);
          }
          if (isIconOnly && React.isValidElement(child) && child.type === "span") {
            return null;
          }
          return child;
        })}
      </Button>
    );

    if (isIconOnly && tooltip) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
            <TooltipContent side={tooltip.side || "right"} align={tooltip.align || "center"}>
              {tooltip.children}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return buttonContent;
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & SidebarChildProps
>(({ className, isIconOnly: _isIconOnly, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mt-auto border-t border-sidebar-border", className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const { setIsDesktopOpen, setIsMobileSheetOpen } = useSidebar();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const Comp = asChild ? Slot : Button;

    const handleClick = () => {
      console.log("SidebarTrigger (hamburger/main toggle) clicked. isDesktop:", isDesktop);
      if (isDesktop) {
        setIsDesktopOpen(prev => !prev);
      } else {
        setIsMobileSheetOpen(prev => !prev);
      }
    };
    
    // For mobile, this trigger should just be a button that toggles the state for MobileSheet.
    // It should not be a Radix SheetTrigger itself.
    if (!isDesktop) {
      return (
         <Comp
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn(className)}
            onClick={handleClick}
            {...props}
          >
           {children || <PanelLeftOpen className="h-5 w-5" />}
          </Comp>
      );
    }

    // This is the desktop toggle button (persists on screen, usually bottom-left)
    // It remains a regular button that controls the desktop sidebar state.
    return (
      <Comp
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("fixed bottom-4 left-4 z-50 hidden md:inline-flex", className)} 
        onClick={handleClick}
        {...props}
      >
        {children || <PanelLeftOpen className="h-6 w-6" />} 
        <span className="sr-only">Toggle Sidebar</span>
      </Comp>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider, // Ensure SidebarProvider is exported
};
