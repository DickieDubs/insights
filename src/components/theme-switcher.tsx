
'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Cog } from 'lucide-react'; // Using Cog for System theme
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button'; // For potential save button if needed, or just direct apply

type Theme = 'light' | 'dark' | 'system';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    toast({
      title: "Theme Updated",
      description: `Theme changed to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}.`,
    });
  };

  return (
    <RadioGroup
      value={currentTheme}
      onValueChange={(value) => handleThemeChange(value as Theme)}
      className="grid grid-cols-3 gap-2 p-2"
    >
      <FormItem className="flex flex-col items-center space-y-1">
        <RadioGroupItem value="light" id="light" className="sr-only" />
        <Label
          htmlFor="light"
          className="border-muted hover:border-accent rounded-lg border-2 p-3 flex flex-col items-center gap-1 cursor-pointer data-[state=checked]:border-primary w-full"
        >
          <Sun className="h-5 w-5" />
          <span className="text-xs">Light</span>
        </Label>
      </FormItem>
      <FormItem className="flex flex-col items-center space-y-1">
        <RadioGroupItem value="dark" id="dark" className="sr-only" />
        <Label
          htmlFor="dark"
          className="border-muted hover:border-accent rounded-lg border-2 p-3 flex flex-col items-center gap-1 cursor-pointer data-[state=checked]:border-primary w-full"
        >
          <Moon className="h-5 w-5" />
          <span className="text-xs">Dark</span>
        </Label>
      </FormItem>
      <FormItem className="flex flex-col items-center space-y-1">
        <RadioGroupItem value="system" id="system" className="sr-only" />
        <Label
          htmlFor="system"
          className="border-muted hover:border-accent rounded-lg border-2 p-3 flex flex-col items-center gap-1 cursor-pointer data-[state=checked]:border-primary w-full"
        >
          <Cog className="h-5 w-5" />
          <span className="text-xs">System</span>
        </Label>
      </FormItem>
    </RadioGroup>
  );
}

// Helper FormItem for RadioGroup within ThemeSwitcher
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  );
});
FormItem.displayName = "FormItem";
