

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Phone, Briefcase, Building, Pencil, CalendarDays, PlusCircle, FileText } from 'lucide-react'; // Updated Calendar to CalendarDays
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { use } from 'react';
import { getClientById, getAllCampaignsForClient } from '@/lib/firebase/firestore-service';
import type { Client, ClientCampaign } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Helper to format Firestore Timestamp or date string/Date object
const formatDate = (dateInput: Timestamp | Date | string | undefined): string => {
  if (!dateInput) return 'N/A';
  let date: Date;
  if (dateInput instanceof Timestamp) {
    date = dateInput.toDate();
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else {
    date = dateInput; // Assumed to be Date object
  }
  
  if (isNaN(date.getTime())) return 'Invalid Date'; // Check if date is valid
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};


async function fetchData(clientId: string): Promise<{ client: Client | null; clientCampaigns: ClientCampaign[] }> {
    const client = await getClientById(clientId);
    let clientCampaigns: ClientCampaign[] = [];
    if (client) {
        clientCampaigns = await getAllCampaignsForClient(clientId);
    }
    return { client, clientCampaigns };
}


export default function ClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const { client, clientCampaigns } = use(fetchData(clientId));

  if (!client) {
     return (
        <div className="p-6 text-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
            <p className="text-destructive">Client with ID "{clientId}" not found.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
        <div className="flex justify-between items-center mb-4">
             <Link href="/clients" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary w-fit">
                <ArrowLeft className="h-4 w-4" />
                Back to Clients List
            </Link>
             <Button variant="outline" size="sm" asChild>
                 <Link href={`/clients/${client.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Client
                 </Link>
             </Button>
        </div>


        <div className="flex flex-col md:flex-row gap-6 items-start">
            <Card className="w-full md:w-1/3">
                 <CardHeader className="flex flex-col items-center text-center">
                     <Avatar className="h-20 w-20 mb-4 border-2 border-primary">
                         <AvatarImage src={client.logoUrl || `https://picsum.photos/seed/${client.id}/128/128`} alt={client.name} data-ai-hint="company logo"/>
                         <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                     </Avatar>
                     <CardTitle>{client.name}</CardTitle>
                     <CardDescription className="flex items-center gap-1"><Building className="h-3 w-3 text-muted-foreground"/> {client.industry}</CardDescription>
                 </CardHeader>
                 <CardContent className="text-sm space-y-3">
                      <Separator />
                     <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://picsum.photos/seed/${client.contactPerson?.replace(/\s+/g, '') || 'contact'}/32/32`} data-ai-hint="person avatar" alt={client.contactPerson} />
                            <AvatarFallback>{client.contactPerson?.substring(0, 1) || 'N/A'}</AvatarFallback>
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
                      {client.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Phone</p>
                                <p className="text-muted-foreground">{client.phone}</p>
                            </div>
                        </div>
                      )}
                       <div className="flex items-center gap-3">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Client Since</p>
                                <p className="text-muted-foreground">{formatDate(client.createdAt)}</p>
                            </div>
                        </div>
                 </CardContent>
            </Card>

            <Card className="w-full md:w-2/3">
                <CardHeader className="flex flex-row items-center justify-between">
                     <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/> Associated Campaigns</CardTitle>
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/campaigns/new?clientId=${client.id}`}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
                            </Link>
                        </Button>
                         <Button variant="outline" size="sm" asChild>
                            <Link href={`/surveys/new?clientId=${client.id}`}>
                                <FileText className="mr-2 h-4 w-4" /> Add Survey
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/campaigns?clientId=${client.id}`}>View All Campaigns</Link>
                        </Button>
                     </div>
                </CardHeader>
                <CardContent>
                     {clientCampaigns.length > 0 ? (
                          <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Title</TableHead>
                                    <TableHead className="text-right">Surveys</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientCampaigns.map((campaign) => (
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
                         <p className="text-muted-foreground text-center py-4">No campaigns found for this client. You can create one!</p>
                     )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
