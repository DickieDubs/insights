
"use client";

import type { Client } from "@/services/cia-api";
import type { ClientFormData } from "@/lib/schemas";
import { ClientSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import React from "react";

interface ClientFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null; 
  onSubmit: (data: ClientFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ClientFormDialog({
  isOpen,
  onOpenChange,
  client,
  onSubmit,
  isSubmitting,
}: ClientFormDialogProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(ClientSchema),
    // Default values are dynamic based on whether it's create or edit
  });

  React.useEffect(() => {
    if (isOpen) {
      if (client) { // Editing existing client
        form.reset({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || "", // API returns null for empty, form expects string
          status: client.status || "pending",
          roles: client.roles || [],
          brandIds: client.brandIds || [],
          password: "", // Password is not pre-filled for editing for security
        });
      } else { // Creating new client
        form.reset({
          name: "",
          email: "",
          password: "", // Explicitly empty for creation, user must fill
          phone: "",
          status: "pending",
          roles: [],
          brandIds: [],
        });
      }
    }
  }, [client, form, isOpen]);

  const handleFormSubmit = async (data: ClientFormData) => {
     // For updates, if password field is empty, don't send it.
    // The API schema (UpdateClientPayload) typically omits password.
    // If API allowed updating password with empty string to mean "no change", this logic would be different.
    if (data.id && data.password === "") {
      const { password, ...dataWithoutPassword } = data; // eslint-disable-line @typescript-eslint/no-unused-vars
      await onSubmit(dataWithoutPassword);
    } else {
      await onSubmit(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset(); 
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {client
              ? "Update the client's details below."
              : "Fill in the form to add a new client."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client's full name" {...field} disabled={isSubmitting} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="client@example.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{client ? "New Password (Optional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={client ? "Leave blank to keep current" : "Enter a password"} 
                      {...field} 
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} value={field.value ?? ""} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Placeholder for Roles and Brand IDs */}
            {/* <FormItem>
              <FormLabel>Roles (Coming Soon)</FormLabel>
              <FormControl>
                <Input disabled placeholder="Roles selection will be here" />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel>Brand IDs (Coming Soon)</FormLabel>
              <FormControl>
                <Input disabled placeholder="Brand selection will be here" />
              </FormControl>
              <FormMessage />
            </FormItem> */}


            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {client ? "Save Changes" : "Add Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
