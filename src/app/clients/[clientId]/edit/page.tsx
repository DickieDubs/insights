'use client';

import React, { useState, useEffect, use } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getClientById, updateClient, deleteClient } from '@/lib/firebase/firestore-service';
import type { Client, ClientFormValues } from '@/types';


const clientStatuses: Client['status'][] = ['Active', 'Inactive', 'Pending', 'Archived'];
const industries = ['Food & Beverage', 'Beverages', 'CPG', 'Frozen Foods', 'Health Foods', 'Retail', 'Other'];

const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Client name must be at least 2 characters." }).max(100),
  industry: z.string().min(1, { message: "Please select an industry." }),
  contactPerson: z.string().min(2, { message: "Contact name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(/^\d{3}-\d{3,4}-\d{4}$/, { message: "Phone number must be in XXX-XXX-XXXX or XXX-XXXX-XXXX format." }).optional().or(z.literal('')),
  status: z.enum(clientStatuses),
});


export default function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null); // To store full client data if needed
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { clientId } = use(params);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      industry: '',
      contactPerson: '',
      email: '',
      phone: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      try {
        const data = await getClientById(clientId);
        if (data) {
           setClientData(data); // Store the full client object
           form.reset({ // Populate form with fetched data
               name: data.name || '',
               industry: data.industry || '',
               contactPerson: data.contactPerson || '',
               email: data.email || '',
               phone: data.phone || '',
               status: data.status || 'Active',
           });
        } else {
          setLoadingError(`Client with ID ${clientId} not found.`);
           toast({ variant: "destructive", title: "Error", description: `Client not found.` });
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        setLoadingError("Failed to load client data.");
         toast({ variant: "destructive", title: "Loading Error", description: (error as Error).message || "Could not load client details." });
      } finally {
        setIsLoading(false);
      }
    };
    if (clientId) { // Ensure clientId is available
        loadData();
    }
  }, [clientId, form, toast]);

  const handleUpdateClient = async (formData: ClientFormValues) => {
    if (!clientData) return;
    setIsSaving(true);
    
    try {
        await updateClient(clientId, formData);
        toast({ title: "Client Updated", description: `Client "${formData.name}" has been successfully updated.` });
        // Update local clientData state if necessary, or rely on re-fetch/navigation
        setClientData(prev => prev ? { ...prev, ...formData } : null); 
        form.reset(formData); // Reset form with new data to clear dirty state
        // router.push(`/clients/${clientId}`); // Optional: redirect back to detail page
    } catch (error) {
         toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message || "Could not update the client." });
    }
    setIsSaving(false);
  };

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    try {
        await deleteClient(clientId);
        toast({ title: "Client Deleted", description: `Client has been successfully deleted.` });
        router.push('/clients');
    } catch (error) {
         toast({ variant: "destructive", title: "Delete Failed", description: (error as Error).message || "Could not delete the client." });
         setIsDeleting(false);
    }
  };

   if (isLoading) {
    return (
      <div className="flex flex-col gap-6 py-6">
         <Link href={`/clients/${clientId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
             Back to Client Details
        </Link>
        <Card>
            <CardHeader>
                <CardTitle><Loader2 className="h-6 w-6 animate-spin text-primary mr-2 inline-block" /> Loading Client...</CardTitle>
                <CardDescription>Fetching client details for editing.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
             </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingError || !clientData) {
     return (
         <div className="flex flex-col gap-6 py-6 items-center">
              <Link href="/clients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 self-start w-fit">
                 <ArrowLeft className="h-4 w-4" />
                 Back to Clients List
             </Link>
             <Card className="w-full max-w-lg border-destructive">
                 <CardHeader>
                     <CardTitle className="text-destructive">Error Loading Client</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p>{loadingError || `Client with ID "${clientId}" could not be loaded.`}</p>
                     <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>Try Again</Button>
                 </CardContent>
             </Card>
         </div>
     );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href={`/clients/${clientId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
             Back to Client Details
        </Link>

        <Card>
             <CardHeader>
                <CardTitle>Edit Client: {clientData?.name || clientId}</CardTitle>
                <CardDescription>Modify the details of this client.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUpdateClient)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Gourmet Bites Inc." {...field} disabled={isSaving} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="industry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Industry*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select industry" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {industries.map(industry => (
                                                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select client status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                 {clientStatuses.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
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
                                name="contactPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Alice Wonderland" {...field} disabled={isSaving} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email*</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="e.g., contact@example.com" {...field} disabled={isSaving} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                         </div>

                         <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 555-123-4567" {...field} disabled={isSaving} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-between items-center pt-4">
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button type="button" variant="destructive" disabled={isSaving || isDeleting}>
                                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        Delete Client
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the client
                                            and all associated data. This might include campaigns and surveys if they are directly linked without a cascading delete strategy.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteClient}
                                            disabled={isDeleting}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                             {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                             <Button type="submit" disabled={isSaving || isDeleting || !form.formState.isDirty}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent