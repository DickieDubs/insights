
'use client';
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import { ArrowLeft, Settings, Save, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { use } from 'react'; // Import 'use'

// Mock data - make surveys array accessible at module level
const allSurveysData = [
    { id: 'sur_1', name: 'Initial Concept Test' },
    { id: 'sur_2', name: 'Packaging Preference' },
    { id: 'sur_3', name: 'Taste Profile Analysis'},
    { id: 'sur_4', name: 'Flavor Preference Ranking'},
    // Add other surveys as needed for generateStaticParams
];

export async function generateStaticParams() {
  return allSurveysData.map((survey) => ({
    surveyId: survey.id,
  }));
}


// Update params type to Promise<{ surveyId: string }>
export default function SurveySettingsPage({ params }: { params: Promise<{ surveyId: string }> }) {
  // Unwrap the promise using React.use()
  const { surveyId } = use(params);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false); // Example setting state
  const [requireLogin, setRequireLogin] = useState(true); // Example setting state

  // TODO: Fetch current survey settings based on surveyId

  // --- Handle Save Settings ---
  const handleSaveSettings = async () => {
    setIsLoading(true);
    console.log("Saving settings for survey:", surveyId, { isPublic, requireLogin });
    // --- Replace with actual API call to save settings ---
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    // ---

     toast({
      title: "Settings Saved",
      description: `Settings for survey ${surveyId} have been updated.`,
    });
    setIsLoading(false);

    // Example error handling
    // toast({
    //   variant: "destructive",
    //   title: "Save Failed",
    //   description: "Could not save settings. Please try again.",
    // });
    // setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 py-6 max-w-2xl mx-auto">
        {/* Back to Survey Details Link */}
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
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Settings
        </Button>
      </div>
    </div>
  );
}
