
'use client'; // Mark as client component for form handling

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
} from "@/components/ui/alert-dialog"


// --- Mock Data Fetching ---
const getClientData = async (clientId: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
   const clients = [
    { id: 'cli_1', name: 'Gourmet Bites', industry: 'Food & Beverage', contactPerson: 'Alice Wonderland', email: 'alice@gourmetbites.com', phone: '555-1234', logoUrl: 'https://picsum.photos/seed/gourmet/64/64', campaigns: [ { id: 'camp_1', title: 'Spring Snack Launch', surveys: 3 }, { id: 'camp_2', title: 'Holiday Cookie Test', surveys: 2 } ], status: 'Active' },
    { id: 'cli_2', name: 'Liquid Refreshments', industry: 'Beverages', contactPerson: 'Bob The Builder', email: 'bob@liquidrefresh.com', phone: '555-5678', logoUrl: 'https://picsum.photos/seed/liquid/64/64', campaigns: [ { id: 'camp_3', title: 'Beverage Taste Test Q2', surveys: 5 } ], status: 'Active'},
    { id: 'cli_3', name: 'Morning Foods Inc.', industry: 'CPG', contactPerson: 'Charlie Chaplin', email: 'charlie@morningfoods.com', phone: '555-9101', logoUrl: 'https://picsum.photos/seed/morning/64/64', campaigns: [], status: 'Active' },
    { id: 'cli_4', name: 'Quick Eats Co.', industry: 'Frozen Foods', contactPerson: 'Diana Prince', email: 'diana@quickeats.co', phone: '555-1121', logoUrl: 'https://picsum.photos/seed/quickeats/64/64', campaigns: [], status: 'Inactive' },
    { id: 'cli_5', name: 'Healthy Snacks Ltd.', industry: 'Health Foods', contactPerson: 'Ethan Hunt', email: 'ethan@healthysnacks.com', phone: '555-1314', logoUrl: 'https://picsum.photos/seed/healthy/64/64', campaigns: [], status: 'Active' },
  ];
  const client = clients.find(c => c.id === clientId);
  return client || null;
};

// --- Mock Data for Selects ---
const clientStatuses = ['Active', 'Inactive', 'Pending', 'Archived'];
// Industries could be fetched or predefined
const industries = ['Food & Beverage', 'Beverages', 'CPG', 'Frozen Foods', 'Health Foods', 'Retail', 'Other'];

// --- Form Schema ---
const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Client name must be at least 2 characters." }).max(100),
  industry: z.string().min(1, { message: "Please select an industry." }),
  contactPerson: z.string().min(2, { message: "Contact name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(/^\d{3}-\d{4}$/, { message: "Phone number must be in XXX-XXXX format." }).optional().or(z.literal('')), // Optional, specific format
  status: z.string().min(1, { message: "Please select a status." }),
  // logoUrl is not typically edited in a simple form like this, handle separately if needed
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

// --- Edit Client Page Component ---
export default function EditClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientData, setClientData] = useState<ClientFormValues | null>(null); // Stores fetched data for display
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { clientId } = use(params); // Use React's use() hook

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

  // --- Fetch existing client data ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      try {
        const data = await getClientData(clientId);
        if (data) {
           setClientData(data); // Store original data if needed
           // Reset form with fetched data
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
           toast({
               variant: "destructive",
               title: "Error",
               description: `Client not found.`,
           });
           // Optional: Redirect back
           // router.push('/clients');
        }
      } catch (error) {
        console.error("Error fetching client data:", error);
        setLoadingError("Failed to load client data.");
         toast({
            variant: "destructive",
            title: "Loading Error",
            description: "Could not load client details. Please try again.",
         });
      } finally {
        setIsLoading(false);
      }
    };
    if (clientId) {
        loadData();
    }
  }, [clientId, form, toast]); // Include dependencies


  // --- Handle Form Submission (Update) ---
  const handleUpdateClient = async (data: ClientFormValues) => {
    setIsLoading(true);
    console.log("Updating client:", clientId, data);
    // --- Replace with actual API call to update client ---
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    // ---

     toast({
      title: "Client Updated",
      description: `Client "${data.name}" has been successfully updated.`,
    });
    router.push(`/clients/${clientId}`); // Redirect back to detail page
    // router.refresh(); // Or refresh data if staying

    // Example error handling
    // toast({
    //   variant: "destructive",
    //   title: "Update Failed",
    //   description: "Could not update the client. Please try again.",
    // });
    // setIsLoading(false); // Only on error
  };

    // --- Handle Delete ---
  const handleDeleteClient = async () => {
    setIsDeleting(true);
    console.log("Deleting client:", clientId);
    // --- Replace with actual API call to delete client ---
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    // ---

    toast({
      title: "Client Deleted",
      description: `Client has been successfully deleted.`,
    });
    router.push('/clients'); // Redirect to clients list

    // Example error handling
    // toast({
    //   variant: "destructive",
    //   title: "Delete Failed",
    //   description: "Could not delete the client. Please try again.",
    // });
    // setIsDeleting(false);
  };


  // --- Render Loading or Error State ---
   if (isLoading && !form.formState.isDirty) { // Show loading only initially
    return (
      <div className="flex flex-col gap-6 py-6">
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
             Back to Dashboard
        </div>
        <Card>
            <CardHeader>
                <CardTitle><Loader2 className="h-6 w-6 animate-spin text-primary mr-2 inline-block" /> Loading Client...</CardTitle>
                <CardDescription>Fetching client details for editing.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 {/* Skeleton loaders */}
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="flex justify-between mt-6">
                    <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
                 </div>
             </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingError) {
     return (
         <div className="flex flex-col gap-6 py-6 items-center">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 self-start w-fit">
                 <ArrowLeft className="h-4 w-4" />
                 Back to Dashboard
             </Link>
             <Card className="w-full max-w-lg border-destructive">
                 <CardHeader>
                     <CardTitle className="text-destructive">Error Loading Client</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p>{loadingError}</p>
                     <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>Try Again</Button>
                 </CardContent>
             </Card>
         </div>
     );
  }


  // --- Render Form ---
  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
             Back to Dashboard
        </Link>

        <Card>
             <CardHeader>
                <CardTitle>Edit Client: {clientData?.name}</CardTitle>
                <CardDescription>Modify the details of this client.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUpdateClient)} className="space-y-6">
                        {/* Client Name */}
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Gourmet Bites Inc." {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Industry */}
                             <FormField
                                control={form.control}
                                name="industry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Industry*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
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
                            {/* Status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
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
                             {/* Contact Person */}
                             <FormField
                                control={form.control}
                                name="contactPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Person*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Alice Wonderland" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             {/* Email */}
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email*</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="e.g., contact@example.com" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                         </div>

                          {/* Phone */}
                         <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., 555-1234" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        {/* Actions */}
                        <div className="flex justify-between items-center pt-4">
                           <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button type="button" variant="destructive" disabled={isLoading || isDeleting}>
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

                             <Button type="submit" disabled={isLoading || isDeleting || !form.formState.isDirty}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
