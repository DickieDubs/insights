
export const runtime = 'edge';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FileText, Calendar, Users, Target, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { use } from 'react';
import { mockCampaignsData, getCampaignById, Campaign } from '@/lib/mock-data/campaigns'; // Import shared data

// Use allCampaignsData for generateStaticParams if it's still relevant for pre-building
// Otherwise, if data is fully dynamic, this might change or be removed if not using full static export.
export async function generateStaticParams() {
  // Filter out "new" if it was ever part of IDs, or ensure IDs are always actual campaign IDs
  return mockCampaignsData
    .filter(campaign => campaign.id !== 'new') // Ensure 'new' is not treated as an ID
    .map((campaign) => ({
      campaignId: campaign.id,
    }));
}

const getCampaignData = async (campaignId: string): Promise<Campaign | null> => {
    // If 'new' is somehow passed as campaignId, treat as not found immediately
    if (campaignId === 'new') {
        return null;
    }
    return getCampaignById(campaignId);
};

export default function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = use(params);
  const campaign = use(getCampaignData(campaignId));

   if (!campaign) {
     return (
        <div className="p-6 text-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
            <p className="text-destructive">Campaign with ID "{campaignId}" not found.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

        {/* Campaign Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-primary">{campaign.title}</h1>
                <Link href={`/clients/${campaign.clientId}`} className="text-lg text-muted-foreground hover:underline">{campaign.client}</Link>
            </div>
             <Badge variant={
                campaign.status === 'Active' ? 'default' :
                campaign.status === 'Completed' ? 'outline' :
                campaign.status === 'Planning' || campaign.status === 'Draft' ? 'secondary' : // Treat Draft like Planning
                'destructive' // Paused, Archived etc.
             } className={`text-base px-4 py-1
                ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                ${campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                ${campaign.status === 'Planning' || campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${campaign.status === 'Paused' ? 'bg-orange-100 text-orange-800' : ''}
                border-transparent font-semibold
             `}>
                {campaign.status}
            </Badge>
        </div>

        <Separator />

        {/* Campaign Metadata */}
        <Card>
            <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Timeline</p>
                        <p className="text-muted-foreground">{new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <ListChecks className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Product Type</p>
                        <p className="text-muted-foreground">{campaign.productType}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Target Audience</p>
                        <p className="text-muted-foreground">{campaign.targetAudience}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Linked Surveys */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Linked Surveys</CardTitle>
                 <Button variant="outline" size="sm" asChild>
                    <Link href={`/surveys?campaignId=${campaign.id}`}>View All</Link>
                 </Button>
            </CardHeader>
            <CardContent>
                 {(campaign.detailedSurveys && campaign.detailedSurveys.length > 0) ? (
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Survey Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Responses</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaign.detailedSurveys.map((survey) => (
                            <TableRow key={survey.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/surveys/${survey.id}`} className="hover:underline text-primary">
                                        {survey.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                     <Badge variant={
                                        survey.status === 'Active' ? 'default' :
                                        survey.status === 'Completed' ? 'outline' :
                                        'secondary' // Planning or other states
                                        } className={`
                                            ${survey.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                            ${survey.status === 'Completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                                            ${survey.status === 'Planning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                                            border-transparent
                                        `}>
                                            {survey.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{survey.responses.toLocaleString()}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                 ) : (
                     <p className="text-muted-foreground text-center py-4">No surveys linked to this campaign yet.</p>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
