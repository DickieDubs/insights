
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context'; // Import useAuth
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'; // Import Firebase functions
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Bell, Moon, Sun, Save } from 'lucide-react'; // Import Bell, Moon, Sun, Save
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
// Ensure all used form components are imported
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { getFirebaseAuth } from '@/lib/firebase/client'; // Use the getter function
import Link from 'next/link'; // Import Link
import { Switch } from '@/components/ui/switch'; // Import Switch
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" // Import RadioGroup


// --- Profile Update Schema and Type ---
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// --- Password Change Schema and Type ---
const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required." }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Please confirm your new password." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// --- Preferences Schema and Type ---
const preferencesFormSchema = z.object({
  receiveNotifications: z.boolean().default(false),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});
type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;


export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth(); // Get current user and auth loading state
  const { toast } = useToast();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(false);
   // Get auth instance safely
   const [authInstance, setAuthInstance] = React.useState(() => {
      try {
          return getFirebaseAuth();
      } catch (error) {
          console.error("Failed to get Firebase Auth instance on Settings Page:", error);
          return null;
      }
  });

  // --- Profile Form ---
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
    },
  });

  // --- Password Form ---
   const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

   // --- Preferences Form ---
   const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
        // TODO: Load these from user settings/local storage
        receiveNotifications: false,
        theme: 'system',
    },
  });


    // Effect to show toast if auth failed to initialize
    useEffect(() => {
        if (!authInstance && !authLoading) { // Only show if not loading and instance is null
             toast({
                variant: "destructive",
                title: "Initialization Error",
                description: "Could not connect to authentication service. Some features may be disabled.",
            });
        }
    }, [authInstance, authLoading, toast]);


  // --- Set initial form values when user data is available ---
  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.displayName || '' });
      // TODO: Fetch and set preferencesForm defaults here
      // Example: loadPreferences().then(prefs => preferencesForm.reset(prefs));
       // Load theme from localStorage or default to system
        const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'system' : 'system';
        const savedNotifications = typeof window !== 'undefined' ? localStorage.getItem('receiveNotifications') === 'true' : false;

        preferencesForm.reset({
            theme: savedTheme as 'light' | 'dark' | 'system',
            receiveNotifications: savedNotifications,
        });
         // Apply initial theme
        applyTheme(savedTheme as 'light' | 'dark' | 'system');

    }
  }, [user, profileForm, preferencesForm]);

    // Function to apply theme class to HTML element
    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');

            if (theme === 'system') {
                 const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                 root.classList.add(systemTheme);
            } else {
                 root.classList.add(theme);
            }
        }
    };


  // --- Handle Profile Update ---
  const handleProfileUpdate = async (data: ProfileFormValues) => {
    if (!user) {
         toast({ variant: "destructive", title: "Error", description: "You must be logged in to update your profile." });
         return;
    }
     if (!authInstance) {
       toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
       return;
    }
    setIsProfileLoading(true);
    try {
      await updateProfile(user, { displayName: data.name });
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
      });
       profileForm.reset({ name: data.name }); // Update default value to clear dirty state
       // Optionally force re-render or context update if needed
       // Could trigger a context refresh if user name is displayed globally
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Failed to update profile: ${error.message}`,
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

   // --- Handle Password Change ---
  const handlePasswordChange = async (data: PasswordFormValues) => {
    if (!user || !user.email) {
       toast({ variant: "destructive", title: "Error", description: "User not found or email missing. Cannot change password." });
       return;
    }
     if (!authInstance) {
       toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
       return;
    }
    setIsPasswordLoading(true);

     try {
      // **Re-authenticate the user first** - THIS IS CRUCIAL for password changes
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      // Use the current user from the auth state, not the instance itself
      await reauthenticateWithCredential(user, credential);

      // **Then update the password** using the current user object
      await updatePassword(user, data.newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
       passwordForm.reset(); // Clear password fields after success

    } catch (error: any) {
      console.error("Error changing password:", error);
       let errorMessage = "Failed to change password. Please try again.";
       if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
           errorMessage = "Incorrect current password.";
           // Set error specifically on the currentPassword field
           passwordForm.setError("currentPassword", { type: "manual", message: errorMessage });
       } else if (error.code === 'auth/weak-password') {
           errorMessage = "New password is too weak (must be at least 6 characters).";
            passwordForm.setError("newPassword", { type: "manual", message: errorMessage });
       } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = "This operation is sensitive and requires recent authentication. Please log out and log back in.";
       } else if (error.code === 'auth/network-request-failed') {
            errorMessage = "Network error. Please check your connection.";
       }
       else {
          errorMessage = `Error: ${error.message}`;
       }

      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: errorMessage,
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // --- Handle Preferences Update ---
  const handlePreferencesUpdate = async (data: PreferencesFormValues) => {
     if (!user) {
         toast({ variant: "destructive", title: "Error", description: "You must be logged in to update preferences." });
         return;
    }
     if (!authInstance) { // Check auth instance too
       toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
       return;
    }
     setIsPreferencesLoading(true);
     console.log("Saving preferences:", data);
     // --- Replace with actual API call to save user preferences ---
     // Could be Firestore, Realtime DB, or custom backend
     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

     // Persist preferences (e.g., in localStorage)
     if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('theme', data.theme);
            localStorage.setItem('receiveNotifications', String(data.receiveNotifications));
            applyTheme(data.theme); // Apply theme change immediately
            toast({
                title: "Preferences Updated",
                description: "Your preferences have been saved.",
            });
        } catch (error) {
            console.error("Error saving preferences to localStorage:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save your preferences locally.",
            });
        }
     } else {
         toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Cannot save preferences on the server.",
        });
     }
     // --- End Simulation ---


     preferencesForm.reset(data); // Update default values to clear dirty state
     setIsPreferencesLoading(false);
  };


  // If auth context is loading
  if (authLoading) {
    return (
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="sr-only">Loading settings...</p>
        </div>
    );
  }

  // If user data isn't loaded after auth loading finished (should be handled by ProtectedRoute)
  if (!user) {
     return (
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
            <p className="text-muted-foreground">User not logged in.</p>
        </div>
    );
  }


  return (
    <div className="flex flex-col gap-6 py-6 max-w-2xl mx-auto">
        {/* Back to Dashboard Link */}
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <h1 className="text-2xl font-semibold text-primary">Settings</h1>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                    <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem className="grid gap-2">
                            <FormLabel htmlFor="name">Name</FormLabel>
                            <FormControl>
                            <Input id="name" {...field} disabled={isProfileLoading || !authInstance} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email || ''} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>
                    <Button type="submit" disabled={isProfileLoading || !authInstance || !profileForm.formState.isDirty}>
                        {isProfileLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Profile
                    </Button>
                </form>
           </Form>
        </CardContent>
      </Card>

       <Separator />

        {/* Change Password Section */}
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                         <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel htmlFor="current-password">Current Password</FormLabel>
                                <FormControl>
                                <Input id="current-password" type="password" {...field} disabled={isPasswordLoading || !authInstance} placeholder="Enter your current password"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel htmlFor="new-password">New Password</FormLabel>
                                <FormControl>
                                <Input id="new-password" type="password" {...field} disabled={isPasswordLoading || !authInstance} placeholder="Enter new password (min. 6 chars)"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                            <FormItem className="grid gap-2">
                                <FormLabel htmlFor="confirm-password">Confirm New Password</FormLabel>
                                <FormControl>
                                <Input id="confirm-password" type="password" {...field} disabled={isPasswordLoading || !authInstance} placeholder="Confirm your new password"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPasswordLoading || !authInstance || !passwordForm.formState.isDirty}>
                             {isPasswordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                             Change Password
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>


       <Separator />

       {/* Preferences Section */}
        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your dashboard experience.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(handlePreferencesUpdate)} className="space-y-6">
                        {/* Notification Preferences */}
                        <FormField
                            control={preferencesForm.control}
                            name="receiveNotifications"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base flex items-center gap-2">
                                            <Bell className="h-4 w-4" /> Email Notifications
                                        </FormLabel>
                                        <FormDescription>
                                            Receive emails about important updates and survey results.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isPreferencesLoading || !authInstance}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                         {/* Theme Preferences */}
                        <FormField
                            control={preferencesForm.control}
                            name="theme"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Theme</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="grid grid-cols-3 gap-4"
                                    disabled={isPreferencesLoading || !authInstance}
                                    >
                                    <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                            <RadioGroupItem value="light" id="light" className="sr-only" />
                                        </FormControl>
                                         <Label htmlFor="light" className="border-muted hover:border-accent rounded-lg border-2 p-4 flex flex-col items-center gap-2 cursor-pointer data-[state=checked]:border-primary">
                                            <Sun className="h-5 w-5" /> Light
                                         </Label>
                                    </FormItem>
                                     <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                            <RadioGroupItem value="dark" id="dark" className="sr-only" />
                                        </FormControl>
                                         <Label htmlFor="dark" className="border-muted hover:border-accent rounded-lg border-2 p-4 flex flex-col items-center gap-2 cursor-pointer data-[state=checked]:border-primary">
                                            <Moon className="h-5 w-5" /> Dark
                                         </Label>
                                    </FormItem>
                                     <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                            <RadioGroupItem value="system" id="system" className="sr-only" />
                                        </FormControl>
                                         <Label htmlFor="system" className="border-muted hover:border-accent rounded-lg border-2 p-4 flex flex-col items-center gap-2 cursor-pointer data-[state=checked]:border-primary">
                                            {/* You might need a generic 'System' icon or just text */}
                                            {/* <Monitor className="h-5 w-5" /> */}
                                            <span className="block h-5 w-5"> {/* Placeholder for icon */}</span>
                                            System
                                         </Label>
                                    </FormItem>

                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                        <Button type="submit" disabled={isPreferencesLoading || !authInstance || !preferencesForm.formState.isDirty}>
                            {isPreferencesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Preferences
                        </Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>

       {!authInstance && (
             <p className="text-center text-sm text-destructive">
                Authentication service is currently unavailable. Settings cannot be modified.
            </p>
        )}
    </div>
  );
}
