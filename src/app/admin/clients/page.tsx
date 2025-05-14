'use client'

import type { Client, ClientCredentials } from '@/services/clientService'
import type { ClientFormData } from '@/lib/schemas'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/services/clientService'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, PlusCircle } from 'lucide-react'
import { ClientDataTable } from '@/components/admin/clients/ClientDataTable'
import { ClientFormDialog } from '@/components/admin/clients/ClientFormDialog'
import { DeleteClientConfirmationDialog } from '@/components/admin/clients/DeleteClientConfirmationDialog'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type CreateClientPayload = Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & {
  password: string
}

type UpdateClientPayload = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>

export default function AdminClientsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  const {
    data: clients = [],
    isLoading: isLoadingClients,
    error: clientsError,
  } = useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: listClients,
  })

  const createClientMutation = useMutation<Client, Error, ClientFormData>({
    mutationFn: (newClientData: ClientFormData) => {
      if (!newClientData.password) {
        throw new Error('Password is required for new client creation.')
      }
      const payload: CreateClientPayload = {
        name: newClientData.name,
        email: newClientData.email,
        password: newClientData.password,
        roles: newClientData.roles,
        status: newClientData.status as 'active' | 'inactive',
      }
      const adjustedPayload: Omit<Client, 'id'> = {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return createClient(adjustedPayload)
    },
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      // The newClient object from the API might be nested, e.g., newClient.data.client
      // Or the 'name' property might be missing if the API returns a different structure.
      // Let's try to access it safely. The actual API response structure should be verified.
      const clientName = newClient?.name || newClient?.email || 'The new client'
      toast({
        title: 'Client Created',
        description: `${clientName} has been successfully added.`,
      })
      setIsFormOpen(false)
      setEditingClient(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Error Creating Client',
        description:
          error.response?.data?.message ||
          error.message ||
          'Could not create client.',
        variant: 'destructive',
      })
    },
  })

  const updateClientMutation = useMutation<Client, Error, ClientFormData>({
    mutationFn: (updatedClientData) => {
      if (!updatedClientData.id)
        throw new Error('Client ID is required for update.')
      const payload: UpdateClientPayload = {
        name: updatedClientData.name,
        email: updatedClientData.email,
        roles: updatedClientData.roles,
        status: updatedClientData.status as 'active' | 'inactive',
      }
      const adjustedPayload: Omit<Client, 'id'> = {
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return updateClient(updatedClientData.id, adjustedPayload)
    },
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      const clientName =
        updatedClient?.name || updatedClient?.email || 'The client'
      toast({
        title: 'Client Updated',
        description: `${clientName}'s details have been updated.`,
      })
      setIsFormOpen(false)
      setEditingClient(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Error Updating Client',
        description:
          error.response?.data?.message ||
          error.message ||
          'Could not update client.',
        variant: 'destructive',
      })
    },
  })

  const deleteClientMutation = useMutation<void, Error, string>({
    mutationFn: deleteClient,
    onSuccess: (_, deletedClientId) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      const deletedClientObject = clients.find((c) => c.id === deletedClientId)
      const deletedClientName =
        deletedClientObject?.name || deletedClientObject?.email || 'The client'
      toast({
        title: 'Client Deleted',
        description: `${deletedClientName} has been deleted.`,
      })
      setIsDeleteConfirmOpen(false)
      setDeletingClient(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Client',
        description:
          error.response?.data?.message ||
          error.message ||
          'Could not delete client.',
        variant: 'destructive',
      })
    },
  })

  const handleAddNewClient = () => {
    setEditingClient(null)
    setIsFormOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client)
    setIsDeleteConfirmOpen(true)
  }

  const handleFormSubmit = async (data: ClientFormData) => {
    if (editingClient && editingClient.id) {
      await updateClientMutation.mutateAsync({ ...data, id: editingClient.id })
    } else {
      await createClientMutation.mutateAsync(data)
    }
  }

  const handleConfirmDelete = async () => {
    if (deletingClient && deletingClient.id) {
      await deleteClientMutation.mutateAsync(deletingClient.id)
    }
  }

  const pageActions = (
    <Button
      onClick={handleAddNewClient}
      className="bg-primary hover:bg-primary/90"
    >
      <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
    </Button>
  )

  return (
    <ProtectedLayout>
      <PageHeader title="Manage Clients" actions={pageActions} />
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <Users className="mr-3 h-7 w-7 text-primary" />
                Client Accounts
              </CardTitle>
              <CardDescription>
                View, add, edit, and manage client accounts.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingClients ? (
              <LoadingSpinner
                message="Fetching client data..."
                containerClassName="py-10"
              />
            ) : clientsError ? (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error Loading Clients</AlertTitle>
                <AlertDescription>
                  There was a problem fetching client data:{' '}
                  {clientsError.message}. Please try again later.
                </AlertDescription>
              </Alert>
            ) : (
              <ClientDataTable
                clients={clients || []} // Ensure clients is always an array
                isLoading={isLoadingClients}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ClientFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        client={editingClient}
        onSubmit={handleFormSubmit}
        isSubmitting={
          createClientMutation.isPending || updateClientMutation.isPending
        }
      />

      <DeleteClientConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        client={deletingClient}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteClientMutation.isPending}
      />
    </ProtectedLayout>
  )
}
