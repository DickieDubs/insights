

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FileText, Calendar, Target, ListChecks, PlusCircle } from 'lucide-react'; // Added PlusCircle
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { use } from 'react';
import { getCampaignById, getAllSurveys, getSurveyCountForCampaign } from '@/lib/firebase/firestore-service';
import type { Campaign, Survey } from '@/types';
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
  
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};


async function getCampaignData(campaignId: string): Promise<{ campaign: Campaign | null, surveys: Survey[]}> {
    const campaign = await getCampaignById(campaignId);
    let surveys: Survey[] = [];
    if (campaign) {
        surveys = await getAllSurveys({ campaignId: campaign.id });
    }
    return { campaign, surveys };
};

export default function CampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = use(params);
  const { campaign, surveys: detailedSurveys } = use(getCampaignData(campaignId));

   if (!campaign) {
     return (
        <div className="p-6 text-center">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit mx-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
            <p className="text-destructive">Campaign with ID "{campaignId}" not found.</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

        {/* Campaign Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-primary">{campaign.title}</h1>
                <Link href={`/clients/${campaign.clientId}`} className="text-lg text-muted-foreground hover:underline">{campaign.clientName || campaign.clientId}</Link>
            </div>
             <Badge variant={
                campaign.status === 'Active' ? 'default' :
                campaign.status === 'Completed' ? 'outline' :
                campaign.status === 'Planning' || campaign.status === 'Draft' ? 'secondary' : 
                'destructive' // Paused, Archived etc.
             } className={`text-base px-4 py-1
                ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                ${campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                ${campaign.status === 'Planning' || campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${campaign.status === 'Paused' || campaign.status === 'Archived' ? 'bg-orange-100 text-orange-800' : ''}
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
                        <p className="text-muted-foreground">{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</p>
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
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/surveys/new?campaignId=${campaign.id}`}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Survey
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/surveys?campaignId=${campaign.id}`}>View All Surveys</Link>
                    </Button>
                 </div>
            </CardHeader>
            <CardContent>
                 {(detailedSurveys && detailedSurveys.length > 0) ? (
                      <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Survey Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Questions</TableHead>
                                {/* Add responses count when available */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {detailedSurveys.map((survey) => (
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
                                        survey.status === 'Planning' || survey.status === 'Draft' ? 'secondary' :
                                        'destructive'
                                        } className={`
                                            ${survey.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                                            ${survey.status === 'Completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                                            ${survey.status === 'Planning' || survey.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                                            border-transparent
                                        `}>
                                            {survey.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{survey.questions?.length || 0}</TableCell>
                                {/* <TableCell className="text-right text-muted-foreground">{survey.responses.toLocaleString()}</TableCell> */}
                            </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                 ) : (
                     <p className="text-muted-foreground text-center py-4">No surveys linked to this campaign yet. You can add one!</p>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
