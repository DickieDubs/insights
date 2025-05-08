
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Bell, Save, Settings as SettingsIcon, Palette } from 'lucide-react'; // Added Palette
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; 
import { Sun, Moon, Cog } from 'lucide-react'; 
import type { UserPreferences } from '@/types';
import { getUserPreferences, updateUserPreferences } from '@/lib/firebase/firestore-service';


const preferencesFormSchema = z.object({
  receiveNotifications: z.boolean().default(false),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});
type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;


export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // const [userId, setUserId] = useState<string | null>(null); // For when auth is integrated

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
        receiveNotifications: false,
        theme: 'system',
    },
  });

  useEffect(() => {
    // For now, using a default user ID. Replace with actual user ID from auth context.
    const currentUserId = 'defaultUser'; 
    // setUserId(currentUserId);

    async function loadPreferences() {
        setIsLoading(true);
        try {
            const prefs = await getUserPreferences(currentUserId);
            if (prefs) {
                preferencesForm.reset({
                    receiveNotifications: prefs.receiveNotifications,
                    theme: prefs.theme,
                });
                applyTheme(prefs.theme); // Apply theme on load
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not load preferences."});
        }
        setIsLoading(false);
    }
    loadPreferences();
  }, [preferencesForm, toast]);

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };


  const handlePreferencesUpdate = async (data: PreferencesFormValues) => {
     setIsSaving(true);
     const currentUserId = 'defaultUser'; // Replace with actual user ID
     
     try {
        await updateUserPreferences(currentUserId, data);
        applyTheme(data.theme); // Apply theme immediately
        toast({
            title: "Preferences Updated",
            description: "Your preferences have been saved.",
        });
        preferencesForm.reset(data); // Reset form to clear dirty state
     } catch (error) {
         toast({
            variant: "destructive",
            title: "Save Failed",
            description: (error as Error).message || "Could not save your preferences.",
        });
     }
     setIsSaving(false);
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col gap-6 py-6 max-w-2xl mx-auto">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
             <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Loading Settings...
            </h1>
            {/* Skeleton loaders for cards */}
            <Card><CardHeader><div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div></CardHeader><CardContent><div className="h-24 bg-muted rounded animate-pulse"></div></CardContent></Card>
            <Card><CardHeader><div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div></CardHeader><CardContent><div className="h-32 bg-muted rounded animate-pulse"></div></CardContent></Card>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6 max-w-2xl mx-auto">
         <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" /> Settings
      </h1>
      
       <Separator />
        <Form {...preferencesForm}>
            <form onSubmit={preferencesForm.handleSubmit(handlePreferencesUpdate)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Manage your notification settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={preferencesForm.control}
                            name="receiveNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base flex items-center gap-2">
                                            <Bell className="h-4 w-4 text-muted-foreground" /> Email Notifications
                                        </FormLabel>
                                        <FormDescription>
                                            Receive emails about important updates and survey results.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isSaving || isLoading}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Theme Preferences</CardTitle>
                        <CardDescription>Choose your preferred application theme.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={preferencesForm.control}
                            name="theme"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground"/> App Theme</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid grid-cols-3 gap-4"
                                        disabled={isSaving || isLoading}
                                        >
                                            <FormItem className="flex flex-col items-center space-y-1">
                                                <RadioGroupItem value="light" id="light" className="sr-only" />
                                                <Label
                                                htmlFor="light"
                                                className="border-muted hover:border-accent rounded-lg border-2 p-3 flex flex-col items-center gap-1 cursor-pointer data-[state=checked]:border-primary w-full"
                                                >
                                                <Sun className="h-5 w-5 text-muted-foreground data-[state=checked]:text-primary" />
                                                <span className="text-xs">Light</span>
                                                </Label>
                                            </FormItem>
                                            <FormItem className="flex flex-col items-center space-y-1">
                                                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                                                <Label
                                                htmlFor="dark"
                                                className="border-muted hover:border-accent rounded-lg border-2 p-3 flex flex-col items-center gap-1 cursor-pointer data-[state=checked]:border-primary w-full"
                                                >
                                                <Moon className="h-5 w-5 text-muted-foreground data-[state=checked]:text-primary" />
                                                <span className="text-xs">Dark</span>
                                                </Label>
                                            </FormItem>
                                            <FormItem className="flex flex-col items-center space-y-1">
                                                <RadioGroupItem value="system" id="system" className="sr-only" />
                                                <Label
                                                htmlFor="system"
                                                className="border-muted hover:border-accent rounded-lg border-2 p-3 flex flex-col items-center gap-1 cursor-pointer data-[state=checked]:border-primary w-full"
                                                >
                                                <Cog className="h-5 w-5 text-muted-foreground data-[state=checked]:text-primary" />
                                                <span className="text-xs">System</span>
                                                </Label>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving || isLoading || !preferencesForm.formState.isDirty}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Preferences
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
