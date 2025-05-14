'use client'

import type { Client } from '@/services/clientService'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface ClientDataTableProps {
  clients: Client[]
  isLoading: boolean
  onEditClient: (client: Client) => void
  onDeleteClient: (client: Client) => void
}

export function ClientDataTable({
  clients,
  isLoading,
  onEditClient,
  onDeleteClient,
}: ClientDataTableProps) {
  if (isLoading) {
    return (
      <LoadingSpinner message="Loading clients..." containerClassName="p-8" />
    )
  }

  if (!Array.isArray(clients) || clients.length === 0) {
    return (
      <p className="p-8 text-center text-muted-foreground">
        No clients found. Add a new client to get started.
      </p>
    )
  }

  const getStatusBadgeVariant = (status: 'active' | 'inactive') => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-700 border-green-500/30'
      case 'inactive':
        return 'bg-red-500/20 text-red-700 border-red-500/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Created</TableHead>
            <TableHead className="w-[120px]">Updated</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {client.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusBadgeVariant(client.status)}
                >
                  {client.status.charAt(0).toUpperCase() +
                    client.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(client.createdAt)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(client.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditClient(client)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteClient(client)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
