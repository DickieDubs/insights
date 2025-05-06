

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Mock data - replace with real data fetching later
const clients = [
  { id: 'cli_1', name: 'Gourmet Bites', industry: 'Food & Beverage', campaigns: 5, status: 'Active' },
  { id: 'cli_2', name: 'Liquid Refreshments', industry: 'Beverages', campaigns: 3, status: 'Active' },
  { id: 'cli_3', name: 'Morning Foods Inc.', industry: 'CPG', campaigns: 8, status: 'Active' },
  { id: 'cli_4', name: 'Quick Eats Co.', industry: 'Frozen Foods', campaigns: 2, status: 'Inactive' },
  { id: 'cli_5', name: 'Healthy Snacks Ltd.', industry: 'Health Foods', campaigns: 10, status: 'Active' },
];

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
        {/* Back to Dashboard Link */}
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Clients</h1>
        <Button asChild>
           <Link href="/clients/new"> {/* Link to a future "Add Client" page */}
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
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{client.campaigns}</TableCell>
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
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         {/* Potential CardFooter for pagination */}
      </Card>
    </div>
  );
}
