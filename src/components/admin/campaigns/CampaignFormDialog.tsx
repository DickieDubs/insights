
"use client";

import type { Campaign, Client, Brand } from "@/services/cia-api";
import type { CampaignFormData } from "@/lib/schemas";
import { CampaignSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, XIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CampaignFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
  clients: Client[];
  brands: Brand[]; // All brands, will be filtered by selected client
  onSubmit: (data: CampaignFormData) => Promise<void>;
  isSubmitting: boolean;
  isLoadingClients: boolean;
  isLoadingBrands: boolean;
}

export function CampaignFormDialog({
  isOpen,
  onOpenChange,
  campaign,
  clients,
  brands,
  onSubmit,
  isSubmitting,
  isLoadingClients,
  isLoadingBrands,
}: CampaignFormDialogProps) {
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(CampaignSchema),
    defaultValues: campaign
      ? {
          id: campaign.id,
          name: campaign.name,
          clientId: campaign.clientId,
          brandIds: campaign.brandIds || [],
          rewards: campaign.rewards || "",
          startDate: campaign.startDate || undefined,
          endDate: campaign.endDate || undefined,
          status: campaign.status || "draft",
        }
      : {
          name: "",
          clientId: "",
          brandIds: [],
          rewards: "",
          startDate: undefined,
          endDate: undefined,
          status: "draft",
        },
  });

  const selectedClientId = form.watch("clientId");

  const availableBrandsForClient = useMemo(() => {
    if (!selectedClientId || isLoadingBrands) return [];
    return brands.filter(brand => brand.clientId === selectedClientId);
  }, [selectedClientId, brands, isLoadingBrands]);

  useEffect(() => {
    if (isOpen) {
      if (campaign) {
        form.reset({
          id: campaign.id,
          name: campaign.name,
          clientId: campaign.clientId,
          brandIds: campaign.brandIds || [],
          rewards: campaign.rewards || "",
          startDate: campaign.startDate ? campaign.startDate : undefined,
          endDate: campaign.endDate ? campaign.endDate : undefined,
          status: campaign.status || "draft",
        });
      } else {
        form.reset({
          name: "",
          clientId: "",
          brandIds: [],
          rewards: "",
          startDate: undefined,
          endDate: undefined,
          status: "draft",
        });
      }
    }
  }, [campaign, form, isOpen]);
  
  // Reset brandIds when clientId changes if not editing an existing campaign
   useEffect(() => {
    if (isOpen && !campaign && form.formState.dirtyFields.clientId) {
      form.setValue("brandIds", []);
    }
  }, [selectedClientId, isOpen, campaign, form]);


  const handleFormSubmit = async (data: CampaignFormData) => {
    await onSubmit(data);
  };
  
  const handleBrandCheckboxChange = (brandId: string, checked: boolean) => {
    const currentBrandIds = form.getValues("brandIds") || [];
    if (checked) {
      form.setValue("brandIds", [...currentBrandIds, brandId], { shouldValidate: true });
    } else {
      form.setValue("brandIds", currentBrandIds.filter(id => id !== brandId), { shouldValidate: true });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit Campaign" : "Add New Campaign"}</DialogTitle>
          <DialogDescription>
            {campaign
              ? "Update the campaign's details below."
              : "Fill in the form to add a new campaign."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Summer Sale Promotion" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // form.setValue("brandIds", []); // Reset brands when client changes
                      }}
                      defaultValue={field.value}
                      disabled={isSubmitting || isLoadingClients || !!campaign} // Disable if editing
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select a client"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingClients ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {campaign && <FormMessage>Client cannot be changed after campaign creation.</FormMessage>}
                    {!campaign && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brandIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Associated Brands</FormLabel>
                    {isLoadingBrands && selectedClientId && <p className="text-sm text-muted-foreground">Loading brands...</p>}
                    {!selectedClientId && !isLoadingBrands && <p className="text-sm text-muted-foreground">Please select a client first.</p>}
                    {selectedClientId && !isLoadingBrands && availableBrandsForClient.length === 0 && (
                      <p className="text-sm text-muted-foreground">No brands found for this client. Please add brands to this client first.</p>
                    )}
                    {availableBrandsForClient.length > 0 && (
                      <ScrollArea className="h-32 rounded-md border p-2">
                        <div className="space-y-2">
                          {availableBrandsForClient.map((brand) => (
                            <FormField
                              key={brand.id}
                              control={form.control}
                              name="brandIds"
                              render={() => {
                                const currentBrandIds = form.getValues("brandIds") || [];
                                return (
                                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={currentBrandIds.includes(brand.id)}
                                        onCheckedChange={(checked) => handleBrandCheckboxChange(brand.id, !!checked)}
                                        disabled={isSubmitting}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {brand.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rewards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rewards (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the rewards for participation" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isSubmitting}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                       <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            disabled={(date) => 
                                (form.getValues("startDate") ? date < new Date(form.getValues("startDate")!) : date < new Date(new Date().setHours(0,0,0,0))) || isSubmitting
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="pt-4 mt-auto">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleFormSubmit)} // Important to trigger submit from outside form for ScrollArea
            disabled={isSubmitting || isLoadingClients || (selectedClientId && isLoadingBrands) || (selectedClientId && !campaign && availableBrandsForClient.length === 0 && !form.formState.errors.brandIds)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {campaign ? "Save Changes" : "Add Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

