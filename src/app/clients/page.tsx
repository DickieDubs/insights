import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getAllClients } from '@/lib/firebase/firestore-service'; 
import type { Client } from '@/types';
import { use } from 'react';

// Data fetching for Server Component
async function getClientsData(): Promise<Client[]> {
    return getAllClients();
}

export default function ClientsPage() {
  const clients = use(getClientsData());

  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Clients</h1>
        <Button asChild>
           <Link href="/clients/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Client
           </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>Manage your registered clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead className="hidden md:table-cell">Industry</TableHead>
                <TableHead className="hidden sm:table-cell">Campaigns</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                     <Link href={`/clients/${client.id}`} className="hover:underline text-primary">
                       {client.name}
                     </Link>
                   </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{client.industry}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{client.campaigns?.length || 0}</TableCell>
                   <TableCell>
                      <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}
                           className={`
                            ${client.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                             border-transparent
                           `}>
                          {client.status}
                      </Badge>
                   </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/clients/${client.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/clients/${client.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        {/* Delete functionality will be added in edit page or via a server action */}
                        {/* <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {clients.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        No clients found. Add one to get started!
                    </TableCell>
                </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}