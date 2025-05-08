
'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addClient } from '@/lib/firebase/firestore-service';
import type { ClientFormValues, Client } from '@/types';

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

export default function NewClientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCreateClient = async (data: ClientFormValues) => {
    setIsLoading(true);
    console.log("Creating new client with form data:", data);

    try {
        const newClientId = await addClient(data);
        toast({
            title: "Client Created",
            description: `Client "${data.name}" has been successfully created.`,
        });
        router.push(`/clients/${newClientId}`);
    } catch (error) {
        console.error("Error creating client:", error);
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: (error as Error).message || "Could not create the client. Please try again.",
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/clients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Clients List
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-primary" /> Add New Client
          </CardTitle>
          <CardDescription>Fill in the details to register a new client.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateClient)} className="space-y-6">
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

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 555-123-4567" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Add Client
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
