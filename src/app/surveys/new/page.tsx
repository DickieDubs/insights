
'use client';

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
import { Loader2, ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { addSurvey, getAllCampaigns, getAllRewardPrograms } from '@/lib/firebase/firestore-service';
import type { SurveyFormValues, Campaign, RewardProgram, Survey } from '@/types';


const surveyTypes = ['Concept Test', 'Preference Test', 'Sensory Test', 'Ranking', 'Brand Study', 'Design Feedback', 'Usage & Attitude', 'Other'];
const surveyStatuses: Survey['status'][] = ['Draft', 'Planning', 'Active', 'Paused', 'Completed', 'Archived'];


// --- Form Schema ---
const surveyFormSchema = z.object({
  name: z.string().min(3, { message: "Survey name must be at least 3 characters." }).max(100),
  description: z.string().max(500).optional(),
  campaignId: z.string().min(1, { message: "Please select a campaign." }),
  status: z.enum(surveyStatuses).default('Draft'),
  type: z.string().min(1, { message: "Please select a survey type." }),
  rewardProgramId: z.string().optional().nullable(),
});


export default function NewSurveyPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rewardPrograms, setRewardPrograms] = useState<RewardProgram[]>([]);

  const preselectedCampaignId = searchParams.get('campaignId');
  const preselectedClientId = searchParams.get('clientId');

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      name: '',
      description: '',
      campaignId: '', // Initialize empty, will be set by useEffect if preselected
      status: 'Draft',
      type: '',
      rewardProgramId: null,
    },
  });

  useEffect(() => {
    async function fetchData() {
      setIsFetchingData(true);
      try {
        const [fetchedCampaigns, fetchedRewards] = await Promise.all([
          getAllCampaigns(),
          getAllRewardPrograms()
        ]);
        setCampaigns(fetchedCampaigns);
        setRewardPrograms(fetchedRewards);

        if (preselectedCampaignId && fetchedCampaigns.some(c => c.id === preselectedCampaignId)) {
          form.setValue('campaignId', preselectedCampaignId);
        } else if (preselectedClientId && fetchedCampaigns.length > 0 && !preselectedCampaignId) {
          const clientCampaign = fetchedCampaigns.find(c => c.clientId === preselectedClientId);
          if (clientCampaign) {
            form.setValue('campaignId', clientCampaign.id);
          }
        }

      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not load necessary data." });
      }
      setIsFetchingData(false);
    }
    fetchData();
  }, [toast, preselectedCampaignId, preselectedClientId, form]);


  const handleCreateSurvey = async (data: SurveyFormValues) => {
    setIsLoading(true);
    try {
        const newSurveyId = await addSurvey(data);
        toast({
            title: "Survey Created",
            description: `Survey "${data.name}" has been created as a draft.`,
        });
        router.push(`/surveys/${newSurveyId}/edit`); 
    } catch (error) {
        console.error("Error creating survey:", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: (error as Error).message || "Could not create the survey. Please try again.",
        });
        setIsLoading(false);
    }
  };

  const campaignsForSelection = preselectedClientId && !preselectedCampaignId
    ? campaigns.filter(c => c.clientId === preselectedClientId)
    : campaigns;


  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href="/surveys" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Surveys List
        </Link>

        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2"><PlusCircle className="h-6 w-6 text-primary" /> Create New Survey</CardTitle>
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
                                render={({ field }) => {
                                    const currentSelectedCampaign = campaigns.find(c => c.id === field.value);
                                    const isCampaignPreselected = !!preselectedCampaignId && campaigns.some(c => c.id === preselectedCampaignId);

                                    return (
                                        <FormItem>
                                            <FormLabel>Campaign*</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ""}
                                                disabled={isLoading || isFetchingData || isCampaignPreselected}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={
                                                            isFetchingData ? "Loading campaigns..." :
                                                            currentSelectedCampaign ? `${currentSelectedCampaign.title} (${currentSelectedCampaign.clientName || 'N/A'})` :
                                                            (preselectedClientId && !isCampaignPreselected && campaignsForSelection.length === 0) ? "No campaigns for this client" :
                                                            "Select associated campaign"
                                                        } />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {isCampaignPreselected && currentSelectedCampaign ? (
                                                        <SelectItem key={currentSelectedCampaign.id} value={currentSelectedCampaign.id}>
                                                            {currentSelectedCampaign.title} ({currentSelectedCampaign.clientName || 'N/A'})
                                                        </SelectItem>
                                                    ) : campaignsForSelection.length > 0 ? (
                                                        campaignsForSelection.map(campaign => (
                                                            <SelectItem key={campaign.id} value={campaign.id}>
                                                                {campaign.title} ({campaign.clientName || 'N/A'})
                                                            </SelectItem>
                                                        ))
                                                    ) : !isFetchingData ? (
                                                        <SelectItem value="no-campaigns-placeholder-new-survey" disabled>
                                                            {preselectedClientId && !isCampaignPreselected ? "No campaigns for this client." : "No campaigns found."}
                                                        </SelectItem>
                                                    ) : null}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                             <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Survey Type*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select survey status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {surveyStatuses.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rewardProgramId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reward Program</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                                            value={field.value ?? "none"}
                                            disabled={isLoading || isFetchingData || rewardPrograms.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isFetchingData ? "Loading rewards..." : "Select reward program (optional)"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                 <SelectItem value="none">None</SelectItem>
                                                 {rewardPrograms.map(program => (
                                                    <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                                                ))}
                                                {!isFetchingData && rewardPrograms.length === 0 && <SelectItem value="no-rewards-placeholder" disabled>No reward programs found.</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                         <FormDescription>Optionally link a reward for participants.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-4">
                             <Button type="submit" disabled={isLoading || isFetchingData}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
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
