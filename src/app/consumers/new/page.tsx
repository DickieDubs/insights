// src/app/consumers/new/page.tsx
'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ArrowLeft, PlusCircle, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { ConsumerFormValues } from '@/types';
import { addConsumer } from '@/lib/firebase/firestore-service';

const consumerSegments = ['Early Adopter', 'Brand Loyalist', 'Value Seeker', 'Tech Enthusiast', 'Family Shopper', 'Price Sensitive', 'Health Conscious', 'Other'];

const consumerFormSchema = z.object({
  name: z.string().min(2, { message: "Full name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }),
  segment: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export default function NewConsumerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ConsumerFormValues>({
    resolver: zodResolver(consumerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      segment: '',
      notes: '',
    },
  });

  const handleCreateConsumer = async (data: ConsumerFormValues) => {
    setIsLoading(true);
    try {
      const newConsumerId = await addConsumer(data);
      toast({
        title: "Consumer Profile Created",
        description: `Consumer "${data.name}" has been successfully added.`,
      });
      router.push(`/consumers/${newConsumerId}`);
    } catch (error) {
      console.error("Error creating consumer profile:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: (error as Error).message || "Could not create the consumer profile. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link href="/consumers" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Consumers List
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-6 w-6 text-primary" /> Add New Consumer
          </CardTitle>
          <CardDescription>Fill in the details to create a new consumer profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateConsumer)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} disabled={isLoading} />
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
                      <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} disabled={isLoading} />
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
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
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any relevant notes about this consumer..." {...field} rows={3} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Add Consumer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
