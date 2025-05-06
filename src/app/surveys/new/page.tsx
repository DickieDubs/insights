
'use client'; // Mark as client component for form handling

import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addMockSurvey } from '@/app/surveys/page'; // Import the function to add survey


// --- Mock Data for Selects ---
// In a real app, fetch these from your backend
const campaigns = [
  { id: 'camp_1', title: 'Spring Snack Launch' },
  { id: 'camp_3', title: 'Beverage Taste Test Q2' },
  { id: 'camp_new_1', title: 'New Cereal Concept' },
];
const rewardPrograms = [
    { id: 'rew_1', name: 'Standard Points Program' },
    { id: 'rew_2', name: 'Gift Card Raffle Q3' },
];
const surveyTypes = ['Concept Test', 'Preference Test', 'Sensory Test', 'Ranking', 'Brand Study', 'Design Feedback', 'Usage & Attitude', 'Other'];


// --- Form Schema ---
const surveyFormSchema = z.object({
  name: z.string().min(3, { message: "Survey name must be at least 3 characters." }).max(100),
  description: z.string().max(500).optional(),
  campaignId: z.string().min(1, { message: "Please select a campaign." }),
  // Status defaults to 'Draft' on creation, might not need user input initially
  // status: z.string().min(1, { message: "Please select a status." }),
  type: z.string().min(1, { message: "Please select a survey type." }),
  rewardProgramId: z.string().optional().nullable(), // Allow empty/null string
});

type SurveyFormValues = z.infer<typeof surveyFormSchema>;

// --- New Survey Page Component ---
export default function NewSurveyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // Add state for fetching select options if needed
  // const [campaignOptions, setCampaignOptions] = useState([]);

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: { // Initialize with empty or default values
      name: '',
      description: '',
      campaignId: '',
      // status: 'Draft', // Default status
      type: '',
      rewardProgramId: null,
    },
  });

  // --- Fetch select options if needed ---
  // useEffect(() => {
  //   // Fetch campaigns, rewards etc. and set state
  // }, []);


  // --- Handle Form Submission (Create) ---
  const handleCreateSurvey = async (data: SurveyFormValues) => {
    setIsLoading(true);
    const surveyDataToCreate = { ...data, status: 'Draft' }; // Add default status
    console.log("Creating new survey:", surveyDataToCreate);

    try {
        // --- Replace with actual API call to create survey ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        // Simulate adding to our mock data store and getting the new ID
        const newSurvey = addMockSurvey(surveyDataToCreate);
        const newSurveyId = newSurvey.id;
        // ---

        toast({
            title: "Survey Created",
            description: `Survey "${data.name}" has been created as a draft.`,
        });
        // Redirect to the edit page of the newly created survey to add questions
        router.push(`/surveys/${newSurveyId}/edit`);

    } catch (error) {
        console.error("Error creating survey:", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: "Could not create the survey. Please try again.",
        });
        setIsLoading(false); // Only set loading false on error
    }
    // Don't set isLoading to false on success, let redirect happen
  };


  // --- Render Form ---
  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href="/surveys" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Surveys List
        </Link>

        <Card>
             <CardHeader>
                <CardTitle>Create New Survey</CardTitle>
                <CardDescription>Define the basic details for your new survey.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateSurvey)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Survey Name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., New Drink Flavor Test" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Briefly describe the purpose of the survey..." {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="campaignId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Campaign*</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select associated campaign" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {campaigns.map(campaign => (
                                                    <SelectItem key={campaign.id} value={campaign.id}>{campaign.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Survey Type*</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select survey type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                 {surveyTypes.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                         <FormDescription>Helps categorize survey results.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <FormField
                                control={form.control}
                                name="rewardProgramId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reward Program</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                                            value={field.value ?? "none"} // Use "none" for null/undefined
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select reward program (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                 <SelectItem value="none">None</SelectItem>
                                                 {rewardPrograms.map(program => (
                                                    <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                         <FormDescription>Optionally link a reward for participants.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        {/* Actions */}
                        <div className="flex justify-end pt-4">
                             <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Create Survey & Add Questions
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
