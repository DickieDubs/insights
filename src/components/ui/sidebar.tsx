
"use client";

import * as React from "react";
import { ChevronRight, PanelLeftClose, PanelRightClose } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { useLocalStorage } from "usehooks-ts";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Sheet
import { Sheet, SheetTrigger as UiSheetTrigger } from "@/components/ui/sheet"; // Renamed to avoid conflict

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
  isMobileSheetOpen?: boolean;
  setIsMobileSheetOpen?: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const SidebarProvider = ({ children, defaultOpen = true, isMobileSheetOpen: externalMobileOpen, setIsMobileSheetOpen: externalSetMobileOpen }: SidebarProviderProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)"); // md breakpoint
  const [isDesktopOpen, setIsDesktopOpenState] = useLocalStorage("sidebar-desktop-open", defaultOpen);
  
  // Internal state for mobile sheet if not controlled externally
  const [internalMobileSheetOpen, setInternalMobileSheetOpen] = React.useState(false);

  const isMobileSheetOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileSheetOpen;
  const setIsMobileSheetOpen = externalSetMobileOpen || setInternalMobileSheetOpen;


  const setIsDesktopOpen = React.useCallback((value: boolean | ((prevState: boolean) => boolean)) => {
    if (isDesktop) {
      setIsDesktopOpenState(value);
    } else {
       setIsMobileSheetOpen(value);
    }
  }, [isDesktop, setIsDesktopOpenState, setIsMobileSheetOpen]);


  // Sync desktop open state with mobile sheet state when screen size changes
  React.useEffect(() => {
    if (!isDesktop && isDesktopOpen) { // Switched to mobile and desktop sidebar was open
      setIsMobileSheetOpen(true);
      // setIsDesktopOpenState(false); // Optionally close desktop state representation
    } else if (isDesktop && isMobileSheetOpen) { // Switched to desktop and mobile sheet was open
      // setIsDesktopOpenState(true); // Optionally open desktop state representation
      setIsMobileSheetOpen(false);
    }
  }, [isDesktop, isDesktopOpen, isMobileSheetOpen, setIsDesktopOpenState, setIsMobileSheetOpen]);


  return (
    <SidebarContext.Provider value={{ isDesktopOpen: isDesktop ? isDesktopOpen : false , setIsDesktopOpen, isMobileSheetOpen, setIsMobileSheetOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: "icon" | "full"; // 'full' means it can be fully hidden, 'icon' means it collapses to icons
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
          isDesktopOpen ? "w-64" : (collapsible === "icon" ? "w-[56px]" : "w-0"), 
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
>(({ className, isIconOnly, ...props }, ref) => { 
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
>(({ className, isIconOnly, ...props }, ref) => { 
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
  React.HTMLAttributes<HTMLLIElement> & SidebarChildProps
>(({ className, isIconOnly: _isIconOnly, ...props }, ref) => { // _isIconOnly to avoid passing to DOM element
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
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type !== "span") { // Icon
            return React.cloneElement(child, { className: cn("h-5 w-5", (child.props as any).className) } as any);
          }
          if (isIconOnly && React.isValidElement(child) && child.type === "span") { // Text label for icon only
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
>(({ className, isIconOnly, ...props }, ref) => { 
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
  ({ className, asChild = false, ...props }, ref) => {
    const { isDesktopOpen, setIsDesktopOpen, setIsMobileSheetOpen } = useSidebar();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const Comp = asChild ? Slot : Button;

    const handleClick = () => {
      if (isDesktop) {
        setIsDesktopOpen(prev => !prev);
      } else {
        setIsMobileSheetOpen(prev => !prev);
      }
    };
    
    if (!isDesktop) { // For mobile, use SheetTrigger
      return (
        <Sheet>
          <UiSheetTrigger asChild={asChild} className={className} {...props} ref={ref}>
              {asChild ? props.children : <PanelLeftClose className="h-6 w-6" />}
          </UiSheetTrigger>
        </Sheet>
      );
    }

    // For desktop, use custom button for collapsing/expanding
    return (
      <Comp
        ref={ref}
        variant="ghost"
        size="icon"
        className={cn("fixed bottom-4 left-4 z-50 hidden md:inline-flex", className)}
        onClick={handleClick}
        {...props}
      >
        {isDesktopOpen ? <PanelLeftClose className="h-6 w-6" /> : <PanelRightClose className="h-6 w-6" />}
        <span className="sr-only">{isDesktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}</span>
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
};
