// src/app/surveys/[surveyId]/settings/settings-client.tsx
'use client'; // This directive is required for Client Components

import React, { useState, useEffect } from 'react';
// Import all components, hooks, and libraries needed for client-side interactivity here
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import { ArrowLeft, Settings, Save, Link as LinkIcon, Loader2 } from 'lucide-react'; // Lucide icons are fine
import Link from 'next/link'; // next/link is fine
// REMOVE: import { use } from 'react'; // 'use' hook is not used here
import { useToast } from '@/hooks/use-toast'; // Client-side hook

// Define the props interface received from the parent Server Component
interface SurveySettingsClientPageProps {
  // The params object is passed from the Server Component
  params: { surveyId: string };
  // Optional prop if initial settings data is fetched on the server
  // initialSettings?: any;
}

// This is the Client Component that renders the UI and handles interactions
export default function SurveySettingsClientPage({ params /*, initialSettings */ }: SurveySettingsClientPageProps) {
  // Access the surveyId from the params object passed from the Server Component
  const { surveyId } = params;

  const { toast } = useToast(); // Client-side hook

  // State variables for managing UI state and form inputs
  const [isLoading, setIsLoading] = useState(false); // Loading state for saving
  // State for form inputs (e.g., settings from API)
  const [isPublic, setIsPublic] = useState(false);
  const [requireLogin, setRequireLogin] = useState(true);

  // --- Client-Side Data Fetching (Optional) ---
  // Use useEffect to fetch initial settings if not pre-fetched on the server
  // or to fetch data when the component mounts/params change.
   useEffect(() => {
     // Example client-side fetch call for initial settings
     const fetchSettings = async () => {
       // setIsLoading(true); // Manage loading state if fetching here
       try {
         // Replace with your actual API endpoint to get settings
         // const response = await fetch(`/api/surveys/${surveyId}/settings`);
         // if (!response.ok) throw new Error('Failed to fetch settings');
         // const settings = await response.json();
         // setIsPublic(settings.isPublic);
         // setRequireLogin(settings.requireLogin);

         // Simulate fetch delay
         await new Promise(resolve => setTimeout(resolve, 500));
         // Set mock state after simulated fetch
         setIsPublic(true); // Example: Set to true
         setRequireLogin(false); // Example: Set to false


       } catch (error) {
         console.error('Error fetching settings:', error);
         toast({ variant: 'destructive', title: 'Error', description: 'Failed to load settings.' });
       } finally {
        //  setIsLoading(false); // Stop loading if fetching here
       }
     };

     // If initialSettings were passed from the server, initialize state
     // if (initialSettings) {
     //   setIsPublic(initialSettings.isPublic);
     //   setRequireLogin(initialSettings.requireLogin);
     //   setIsLoading(false); // Assuming data is loaded if passed
     // } else {
     //   fetchSettings(); // Otherwise, fetch on the client
     // }

      // For now, just simulate loading and setting initial state
      setIsLoading(true);
      fetchSettings().then(() => setIsLoading(false));


   }, [surveyId, toast]); // Depend on surveyId to refetch if it changes, and toast


  // --- Handle Save Settings (Client-Side Interaction) ---
  const handleSaveSettings = async () => {
    setIsLoading(true); // Start loading for the save action
    console.log("Saving settings for survey:", surveyId, { isPublic, requireLogin });

    try {
      // --- Replace with actual API call to save settings ---
      // Example API call:
      // const response = await fetch(`/api/surveys/${surveyId}/settings`, {
      //   method: 'PUT', // or POST depending on your API design
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ isPublic, requireLogin }),
      // });

      // if (!response.ok) {
      //   // Handle specific API errors if needed
      //   const errorBody = await response.text(); // or response.json()
      //   throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorBody}`);
      // }

      // Simulate API delay for saving
      await new Promise(resolve => setTimeout(resolve, 1500));
      // --- End Simulation ---

      toast({
        title: "Settings Saved",
        description: `Settings for survey ${surveyId} have been updated.`,
      });

    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: (error as Error).message || "Could not save settings. Please try again.",
      });
    } finally {
      setIsLoading(false); // Stop loading after save attempt
    }
  };


  // This JSX renders the actual UI for the page
  return (
    <div className="flex flex-col gap-6 py-6 max-w-2xl mx-auto">
        {/* Back to Survey Details Link */}
        {/* Link component works in Client Components */}
        <Link href={`/surveys/${surveyId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Survey Details
        </Link>

      <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
        <Settings className="h-6 w-6" /> Survey Settings
      </h1>
       <CardDescription>Configure access, notifications, and other options for Survey ID: {surveyId}</CardDescription>

      {/* Access Control Section */}
      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Manage who can access and respond to this survey.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
                <Switch
                    id="public-access"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                    disabled={isLoading}
                 />
                <Label htmlFor="public-access">Publicly Accessible</Label>
            </div>
             <p className="text-xs text-muted-foreground pl-8">
                If enabled, anyone with the link can view and respond (subject to login requirement below).
             </p>

             <div className="flex items-center space-x-2">
                <Switch
                    id="require-login"
                    checked={requireLogin}
                    onCheckedChange={setRequireLogin}
                    disabled={isLoading || isPublic} // Disable if public access is forced
                 />
                <Label htmlFor="require-login">Require User Login</Label>
             </div>
             <p className="text-xs text-muted-foreground pl-8">
                Ensures responses are linked to registered users. Recommended unless anonymity is required.
             </p>

             {/* Placeholder for specific user/group access */}
             <div>
                 <Label>Specific Access (Coming Soon)</Label>
                 <p className="text-sm text-muted-foreground">Invite specific users or groups to respond.</p>
                 <Button variant="outline" size="sm" className="mt-2" disabled>Manage Access</Button>
             </div>

             {/* Survey Link */}
           <div className="pt-4">
                 <Label htmlFor="survey-link">Survey Link</Label>
                 <div className="flex items-center gap-2 mt-1">
                     <Input id="survey-link" value={`https://yourapp.com/survey/${surveyId}`} readOnly disabled/>
                     <Button variant="outline" size="icon" disabled>
                         <LinkIcon className="h-4 w-4" />
                         <span className="sr-only">Copy Link</span>
                     </Button>
                 </div>
                 <p className="text-xs text-muted-foreground mt-1">Share this link with participants.</p>
            </div>
        </CardContent>
      </Card>

      {/* Notification Section - Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure email notifications for new responses (coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Set up notifications for survey administrators.</p>
          {/* Example: <Switch id="notify-admin" disabled/> <Label htmlFor="notify-admin">Notify on new response</Label> */}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
           <Button onClick={handleSaveSettings} disabled={isLoading}>
             {/* Show loader when saving */}
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
             Save Settings
           </Button>
      </div>
    </div>
  );
}