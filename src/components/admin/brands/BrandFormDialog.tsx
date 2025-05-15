'use client'

import type { Brand, Client } from '@/services/cia-api'
import type { BrandFormData } from '@/lib/schemas'
import { BrandSchema } from '@/lib/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface BrandFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  brand?: Brand | null // For pre-filling form in edit mode
  clients: Client[] // List of clients to associate the brand with
  onSubmit: (data: BrandFormData) => Promise<void>
  isSubmitting: boolean
  isLoadingClients: boolean
}

export function BrandFormDialog({
  isOpen,
  onOpenChange,
  brand,
  clients,
  onSubmit,
  isSubmitting,
  isLoadingClients,
}: BrandFormDialogProps) {
  const form = useForm<BrandFormData>({
    resolver: zodResolver(BrandSchema),
    defaultValues: brand
      ? { id: brand.id, name: brand.name, clientId: brand.clientId }
      : { name: '', clientId: '' },
  })

  React.useEffect(() => {
    if (isOpen) {
      if (brand) {
        form.reset({
          id: brand.id,
          name: brand.name,
          clientId: brand.clientId,
        })
      } else {
        form.reset({ name: '', clientId: '' })
      }
    }
  }, [brand, form, isOpen])

  const handleFormSubmit = async (data: BrandFormData) => {
    await onSubmit(data)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          form.reset()
        }
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{brand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
          <DialogDescription>
            {brand
              ? "Update the brand's details below."
              : 'Fill in the form to add a new brand.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brand's name"
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
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || isLoadingClients}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingClients
                              ? 'Loading clients...'
                              : 'Select a client'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingClients ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingClients}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {brand ? 'Save Changes' : 'Add Brand'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
