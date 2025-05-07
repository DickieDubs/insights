
export const runtime = 'edge';

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
import { getAllCampaigns, Campaign } from '@/lib/mock-data/campaigns'; // Import shared data
import { use } from 'react';

// Fetch data using React.use() for Server Components
const getCampaigns = async (): Promise<Campaign[]> => {
    return getAllCampaigns();
};

export default function CampaignsPage() {
  const campaigns = use(getCampaigns());

  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Campaigns</h1>
        <Button asChild>
          <Link href="/campaigns/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>Manage your marketing and research campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Title</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead className="hidden lg:table-cell">Product Type</TableHead>
                <TableHead className="hidden sm:table-cell">Surveys</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                     <Link href={`/campaigns/${campaign.id}`} className="hover:underline text-primary">
                      {campaign.title}
                     </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{campaign.client}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{campaign.productType}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{campaign.surveys}</TableCell>
                  <TableCell>
                    <Badge variant={
                        campaign.status === 'Active' ? 'default' :
                        campaign.status === 'Completed' ? 'outline' :
                        campaign.status === 'Planning' ? 'secondary' : 'destructive'
                     } className={`
                        ${campaign.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                        ${campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                        ${campaign.status === 'Planning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                        ${campaign.status === 'Paused' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : ''}
                        border-transparent
                     `}>
                        {campaign.status}
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
                            <Link href={`/campaigns/${campaign.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href={`/campaigns/${campaign.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {campaigns.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                        No campaigns found. Create one to get started!
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
