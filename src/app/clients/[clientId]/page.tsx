

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Phone, Briefcase, Building, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { use } from 'react';

// Mock data - make clients array accessible at module level
const allClientsData = [
    { id: 'cli_1', name: 'Gourmet Bites', industry: 'Food & Beverage', contactPerson: 'Alice Wonderland', email: 'alice@gourmetbites.com', phone: '555-1234', logoUrl: 'https://picsum.photos/seed/gourmet/64/64', campaigns: [ { id: 'camp_1', title: 'Spring Snack Launch', surveys: 3 }, { id: 'camp_2', title: 'Holiday Cookie Test', surveys: 2 } ] },
    { id: 'cli_2', name: 'Liquid Refreshments', industry: 'Beverages', contactPerson: 'Bob The Builder', email: 'bob@liquidrefresh.com', phone: '555-5678', logoUrl: 'https://picsum.photos/seed/liquid/64/64', campaigns: [ { id: 'camp_3', title: 'Beverage Taste Test Q2', surveys: 5 } ] },
    // Add other clients if needed for generateStaticParams and data fetching
];

export async function generateStaticParams() {
  // Filter out any potential non-ID segments if necessary, though typically IDs are distinct
  return allClientsData.map((client) => ({
    clientId: client.id,
  }));
}


const getClientData = async (clientId: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay

  const client = allClientsData.find(c => c.id === clientId);
  return client || { id: clientId, name: 'Client Not Found', industry: 'N/A', contactPerson: 'N/A', email: 'N/A', phone: 'N/A', logoUrl: '', campaigns: [] }; // Basic fallback
};

// Update params type to Promise<{ clientId: string }>
export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  // Unwrap the promise using React.use()
  const { clientId } = use(params);
  // Fetch data *after* unwrapping the promise
  const client = use(getClientData(clientId));

  if (client.name === 'Client Not Found') {
     return (
        <div className="p-6 text-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
            <p className="text-destructive">Client with ID {clientId} not found.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
        <div className="flex justify-between items-center mb-4">
             <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary w-fit">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
             {/* Action Button */}
             <Button variant="outline" size="sm" asChild>
                 <Link href={`/clients/${client.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Client
                 </Link>
             </Button>
        </div>


        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Client Info Card */}
            <Card className="w-full md:w-1/3">
                 <CardHeader className="flex flex-col items-center text-center">
                     <Avatar className="h-20 w-20 mb-4 border-2 border-primary">
                         <AvatarImage src={client.logoUrl} alt={client.name} data-ai-hint="company logo" />
                         <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                     </Avatar>
                     <CardTitle>{client.name}</CardTitle>
                     <CardDescription className="flex items-center gap-1"><Building className="h-3 w-3"/> {client.industry}</CardDescription>
                 </CardHeader>
                 <CardContent className="text-sm space-y-3">
                      <Separator />
                     <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://picsum.photos/seed/${client.contactPerson.replace(' ','')}/32/32`} data-ai-hint="person avatar" alt={client.contactPerson} />
                            <AvatarFallback>{client.contactPerson.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">Contact Person</p>
                            <p className="text-muted-foreground">{client.contactPerson}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Email</p>
                            <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                         <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-muted-foreground">{client.phone}</p>
                        </div>
                     </div>
                 </CardContent>
            </Card>

            {/* Associated Campaigns Card */}
            <Card className="w-full md:w-2/3">
                <CardHeader className="flex flex-row items-center justify-between">
                     <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Associated Campaigns</CardTitle>
                     <Button variant="outline" size="sm" asChild>
                        <Link href={`/campaigns?clientId=${client.id}`}>View All</Link>
                     </Button>
                </CardHeader>
                <CardContent>
                     {client.campaigns.length > 0 ? (
                          <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Title</TableHead>
                                    <TableHead className="text-right">Surveys</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {client.campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/campaigns/${campaign.id}`} className="hover:underline text-primary">
                                            {campaign.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{campaign.surveys}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                     ) : (
                         <p className="text-muted-foreground text-center py-4">No campaigns found for this client.</p>
                     )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
