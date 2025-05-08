
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
import { useRouter, useSearchParams } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import { addCampaign, getAllClients } from '@/lib/firebase/firestore-service';
import type { CampaignFormValues, Client, Campaign } from '@/types';

const productTypes = ['Snacks', 'Beverages', 'Cereal', 'Frozen Meals', 'Health Foods', 'Dairy', 'Bakery', 'Other'];
const campaignStatuses: Campaign['status'][] = ['Planning', 'Active', 'Paused', 'Completed', 'Archived', 'Draft'];


// Form Schema
const campaignFormSchema = z.object({
  title: z.string().min(3, { message: "Campaign title must be at least 3 characters." }).max(100),
  clientId: z.string().min(1, { message: "Please select a client." }),
  productType: z.string().min(1, { message: "Please select a product type." }),
  status: z.enum(campaignStatuses).default('Planning'),
  startDate: z.date({ required_error: "Start date is required." }),
  endDate: z.date({ required_error: "End date is required." }),
  targetAudience: z.string().min(3, { message: "Target audience description is required." }).max(200),
  description: z.string().max(500).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});


export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClients, setIsFetchingClients] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);

  const preselectedClientId = searchParams.get('clientId');

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: '',
      clientId: preselectedClientId || '',
      productType: '',
      status: 'Planning',
      startDate: undefined,
      endDate: undefined,
      targetAudience: '',
      description: '',
    },
  });

  useEffect(() => {
    async function fetchClients() {
      setIsFetchingClients(true);
      try {
        const fetchedClients = await getAllClients();
        setClients(fetchedClients);
        if (preselectedClientId && fetchedClients.some(c => c.id === preselectedClientId)) {
          form.setValue('clientId', preselectedClientId);
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not load clients." });
      }
      setIsFetchingClients(false);
    }
    fetchClients();
  }, [toast, preselectedClientId, form]);

  const handleCreateCampaign = async (data: CampaignFormValues) => {
    setIsLoading(true);
    try {
      const newCampaignId = await addCampaign(data);
      toast({
        title: "Campaign Created",
        description: `Campaign "${data.title}" has been successfully created.`,
      });
      router.push(`/campaigns/${newCampaignId}`);
    } catch (error) {
        console.error("Error creating campaign:", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: (error as Error).message || "Could not create the campaign. Please try again.",
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/campaigns" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns List
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" /> Create New Campaign
          </CardTitle>
          <CardDescription>Fill in the details to launch a new campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateCampaign)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Refreshment Line" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isFetchingClients}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isFetchingClients ? "Loading clients..." : "Select client"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                           {clients.length === 0 && !isFetchingClients && <SelectItem value="" disabled>No clients found. Add one first.</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date*</FormLabel>
                      <DatePicker date={field.value} onDateChange={field.onChange} disabled={isLoading} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date*</FormLabel>
                      <DatePicker date={field.value} onDateChange={field.onChange} disabled={(date) => isLoading || (form.getValues("startDate") ? date < form.getValues("startDate") : false)} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaignStatuses.map(status => (
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
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Young adults, Health-conscious consumers" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Briefly describe the primary audience for this campaign.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide more details about the campaign objectives, key messaging, etc." {...field} rows={4} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading || isFetchingClients}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Create Campaign
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
