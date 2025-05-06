
export const runtime = 'edge';

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
const campaigns = [
  { id: 'camp_1', title: 'Spring Snack Launch', client: 'Gourmet Bites', productType: 'Snacks', status: 'Active', surveys: 3 },
  { id: 'camp_3', title: 'Beverage Taste Test Q2', client: 'Liquid Refreshments', productType: 'Beverages', status: 'Completed', surveys: 5 },
  { id: 'camp_new_1', title: 'New Cereal Concept', client: 'Morning Foods Inc.', productType: 'Cereal', status: 'Planning', surveys: 1 },
  { id: 'camp_fz_1', title: 'Frozen Meals Feedback', client: 'Quick Eats Co.', productType: 'Frozen Meals', status: 'Active', surveys: 2 },
  { id: 'camp_sn_2', title: 'Healthy Bar Evaluation', client: 'Healthy Snacks Ltd.', productType: 'Snacks', status: 'Paused', surveys: 4 },
];

export default function CampaignsPage() {
  return (
    <div className="flex flex-col gap-6 py-6">
       {/* Back to Dashboard Link */}
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Campaigns</h1>
        <Button asChild>
          <Link href="/campaigns/new"> {/* Link to a future "Create Campaign" page */}
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
                        campaign.status === 'Planning' ? 'secondary' : 'destructive' // Assuming Paused or other states are destructive/secondary style
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Archive</DropdownMenuItem>
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
