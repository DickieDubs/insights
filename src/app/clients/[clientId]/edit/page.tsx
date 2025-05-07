
'use client';
export const runtime = 'edge';

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
import { mockClientsData, getClientById, updateMockClient, Client } from '@/lib/mock-data/clients'; // Import shared data

export async function generateStaticParams() {
  return mockClientsData
    .filter(client => client.id !== 'new') // Ensure 'new' is not treated as an ID
    .map((client) => ({
        clientId: client.id,
    }));
}

const getClientData = async (clientId: string): Promise<Client | null> => {
  if (clientId === 'new') return null;
  return getClientById(clientId);
};

const clientStatuses = ['Active', 'Inactive', 'Pending', 'Archived'];
const industries = ['Food & Beverage', 'Beverages', 'CPG', 'Frozen Foods', 'Health Foods', 'Retail', 'Other'];

const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Client name must be at least 2 characters." }).max(100),
  industry: z.string().min(1, { message: "Please select an industry." }),
  contactPerson: z.string().min(2, { message: "Contact name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(/^\d{3}-\d{4}$/, { message: "Phone number must be in XXX-XXXX format." }).optional().or(z.literal('')),
  status: z.string().min(1, { message: "Please select a status." }),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); // Start true for initial load
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientData, setClientData] = useState<Client | null>(null);
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
      status: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      try {
        const data = await getClientData(clientId);
        if (data) {
           setClientData(data);
           form.reset({
               name: data.name || '',
               industry: data.industry || '',
               contactPerson: data.contactPerson || '',
               email: data.email || '',
               phone: data.phone || '',
               status: data.status || '',
           });
        } else {
          setLoadingError(`Client with ID ${clientId} not found.`);
           toast({ variant: "destructive", title: "Error", description: `Client not found.` });
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        setLoadingError("Failed to load client data.");
         toast({ variant: "destructive", title: "Loading Error", description: "Could not load client details." });
      } finally {
        setIsLoading(false);
      }
    };
    if (clientId && clientId !== 'new') {
        loadData();
    } else if (clientId === 'new') {
        setLoadingError(`Invalid client ID: "new"`);
        setIsLoading(false);
    }
  }, [clientId, form, toast]);

  const handleUpdateClient = async (formData: ClientFormValues) => {
    if (!clientData) return;
    setIsSaving(true);
    
    const updatedClient: Client = {
        ...clientData, // Spread existing client data to preserve campaigns, logoUrl etc.
        name: formData.name,
        industry: formData.industry,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone || undefined,
        status: formData.status as Client['status'],
    };

    console.log("Updating client:", clientId, updatedClient);
    
    const success = updateMockClient(updatedClient); // Use shared update function

    if (success) {
        toast({ title: "Client Updated", description: `Client "${updatedClient.name}" has been successfully updated.` });
        setClientData(updatedClient); // Update local state for display
        form.reset(formData); // Reset form with new data to clear dirty state
        // router.push(`/clients/${clientId}`); // Optionally redirect or stay
    } else {
        toast({ variant: "destructive", title: "Update Failed", description: "Could not update the client." });
    }
    setIsSaving(false);
  };

  const handleDeleteClient = async () => {
    setIsDeleting(true);
    console.log("Deleting client:", clientId);
    // Simulate API call for deletion
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Remove from mockClientsData (in real app, API call)
    const index = mockClientsData.findIndex(c => c.id === clientId);
    if (index > -1) {
        mockClientsData.splice(index, 1);
        toast({ title: "Client Deleted", description: `Client has been successfully deleted.` });
        router.push('/clients');
    } else {
         toast({ variant: "destructive", title: "Delete Failed", description: "Client not found for deletion." });
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

  if (loadingError || !clientData) { // Also check if clientData is null
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
                                        <Input placeholder="e.g., 555-1234" {...field} disabled={isSaving} />
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
                                            and all associated campaigns and surveys.
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
            </CardContent>
        </Card>
    </div>
  );
}
