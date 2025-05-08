// src/app/consumers/[consumerId]/edit/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft, Save, Trash2, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
import type { Consumer, ConsumerFormValues } from '@/types';
import { getConsumerById, updateConsumer, deleteConsumer } from '@/lib/firebase/firestore-service';

const consumerSegments = ['Early Adopter', 'Brand Loyalist', 'Value Seeker', 'Tech Enthusiast', 'Family Shopper', 'Price Sensitive', 'Health Conscious', 'Other'];

const consumerFormSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  segment: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export default function EditConsumerPage({ params }: { params: Promise<{ consumerId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { consumerId } = use(params);

  const form = useForm<ConsumerFormValues>({
    resolver: zodResolver(consumerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      segment: '',
      notes: '',
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsInitializing(true);
      try {
        const data = await getConsumerById(consumerId);
        if (data) {
          form.reset({
            name: data.name,
            email: data.email,
            segment: data.segment || '',
            notes: data.notes || '',
          });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Consumer not found." });
          notFound(); // Use Next.js notFound for server components, router.push for client if needed elsewhere
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Loading Error", description: (error as Error).message });
      }
      setIsInitializing(false);
    }
    if (consumerId) {
      loadData();
    }
  }, [consumerId, form, toast]);

  const handleUpdateConsumer = async (formData: ConsumerFormValues) => {
    setIsSaving(true);
    try {
      await updateConsumer(consumerId, formData);
      toast({
        title: "Consumer Profile Updated",
        description: `Consumer "${formData.name}" has been successfully updated.`,
      });
      form.reset(formData); // Reset form to clear dirty state
      // router.push(`/consumers/${consumerId}`); // Optional: redirect to detail page
    } catch (error) {
      toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message });
    }
    setIsSaving(false);
  };

  const handleDeleteConsumer = async () => {
    setIsDeleting(true);
    try {
      await deleteConsumer(consumerId);
      toast({ title: "Consumer Deleted", description: `Consumer profile has been deleted.` });
      router.push('/consumers');
    } catch (error) {
      toast({ variant: "destructive", title: "Delete Failed", description: (error as Error).message });
      setIsDeleting(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col gap-6 py-6 items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading consumer details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href={`/consumers/${consumerId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Consumer Details
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-6 w-6 text-primary" /> Edit Consumer Profile
          </CardTitle>
          <CardDescription>Modify the details for {form.getValues('name') || 'this consumer'}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateConsumer)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} disabled={isSaving || isDeleting} />
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
                    <FormLabel>Email Address*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} disabled={isSaving || isDeleting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumer Segment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isSaving || isDeleting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {consumerSegments.map(segment => (
                          <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any relevant notes about this consumer..." {...field} rows={3} disabled={isSaving || isDeleting} />
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
                      Delete Consumer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the consumer profile.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteConsumer}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button type="submit" disabled={isSaving || isDeleting || !form.formState.isDirty}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
