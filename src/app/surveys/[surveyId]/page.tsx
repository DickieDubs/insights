

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FileText, Briefcase, CalendarDays, Users, ListChecks, CheckSquare, Award, Settings, Pencil, Link as LinkIcon, Eye, HelpCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { use } from 'react'; 
import { getSurveyById, getCampaignById, getRewardProgramById } from '@/lib/firebase/firestore-service'; // Assuming getRewardProgramById exists
import type { Survey, SurveyQuestion, Campaign, RewardProgram } from '@/types';
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
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};


// export async function generateStaticParams() {
//   // const surveys = await getAllSurveys(); // Fetch from Firestore
//   // return surveys.map((survey) => ({
//   //   surveyId: survey.id,
//   // }));
//   return []; // Disable static params for now if data is highly dynamic or auth-dependent
// }

interface SurveyDetails extends Survey {
    campaignTitle?: string;
    rewardProgramTitle?: string;
    responseCount?: number; // Placeholder
}


const getSurveyDetails = async (surveyId: string): Promise<SurveyDetails | null> => {
  const survey = await getSurveyById(surveyId);
  if (!survey) return null;

  let campaignTitle = survey.campaignName;
  if (!campaignTitle && survey.campaignId) {
    const campaign = await getCampaignById(survey.campaignId);
    campaignTitle = campaign?.title;
  }

  let rewardProgramTitle = survey.rewardProgramName;
  if (!rewardProgramTitle && survey.rewardProgramId) {
    const rewardProgram = await getRewardProgramById(survey.rewardProgramId);
    rewardProgramTitle = rewardProgram?.name;
  }
  // Response count would ideally come from an aggregation or a counter field on the survey document
  const responseCount = 0; // Placeholder

  return { 
      ...survey, 
      campaignTitle: campaignTitle || survey.campaignId, 
      rewardProgramTitle: rewardProgramTitle || survey.rewardProgramId || 'None',
      responseCount
    };
};


export default function SurveyDetailPage({ params }: { params: Promise<{ surveyId: string }> }) {
    const { surveyId } = use(params);
    const survey = use(getSurveyDetails(surveyId));

    if (!survey) {
        return (
            <div className="p-6 text-center">
                 <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit mx-auto">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <p className="text-destructive">Survey with ID {surveyId} not found.</p>
            </div>
        );
    }

  return (
    <div className="flex flex-col gap-6 py-6">
        <div className="flex justify-between items-center mb-4">
            <Link href="/surveys" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary w-fit">
                <ArrowLeft className="h-4 w-4" />
                Back to Surveys List
            </Link>
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" asChild>
                     <Link href={`/surveys/${survey.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Link>
                 </Button>
                  <Button variant="outline" size="sm" disabled> {/* TODO: Implement share functionality */}
                        <LinkIcon className="mr-2 h-4 w-4" /> Get Link
                 </Button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-primary">{survey.name}</h1>
                 <Link href={`/campaigns/${survey.campaignId}`} className="text-lg text-muted-foreground hover:underline flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> {survey.campaignTitle}
                 </Link>
            </div>
            <Badge variant={
                survey.status === 'Active' ? 'default' :
                survey.status === 'Completed' ? 'outline' :
                survey.status === 'Planning' || survey.status === 'Draft' ? 'secondary' :
                'destructive' 
                } className={`text-base px-4 py-1
                ${survey.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                ${survey.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                ${survey.status === 'Planning' || survey.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${survey.status === 'Paused' || survey.status === 'Archived' ? 'bg-orange-100 text-orange-800' : ''}
                border-transparent font-semibold
                `}>
                {survey.status}
            </Badge>
        </div>

        <Separator />

        <Card>
            <CardHeader>
                <CardTitle>Survey Details</CardTitle>
            </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Created Date</p>
                        <p className="text-muted-foreground">{formatDate(survey.createdAt)}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <ListChecks className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Survey Type</p>
                        <p className="text-muted-foreground">{survey.type}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <CheckSquare className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Questions</p>
                        <p className="text-muted-foreground">{survey.questions?.length || 0}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Responses</p>
                        <p className="text-muted-foreground">{survey.responseCount?.toLocaleString() || 0}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Reward Program</p>
                         {survey.rewardProgramId && survey.rewardProgramTitle !== 'None' ? (
                             <Link href={`/rewards#program-${survey.rewardProgramId}`} className="text-primary hover:underline">
                                {survey.rewardProgramTitle}
                             </Link>
                         ) : (
                             <p className="text-muted-foreground">None</p>
                         )}
                    </div>
                </div>
            </CardContent>
        </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary"/> Survey Questions</CardTitle>
           <CardDescription>List of questions included in this survey. Edit them to build your survey.</CardDescription>
        </CardHeader>
        <CardContent>
           {survey.questions && survey.questions.length > 0 ? (
            <ul className="space-y-4">
                {survey.questions.map((q, index) => (
                    <li key={q.id || `q-${index}`} className="border-b pb-3 last:border-b-0">
                        <p className="font-medium">{index + 1}. {q.text}</p>
                        <p className="text-xs text-muted-foreground capitalize pl-4">Type: {q.type.replace('-', ' ')}</p>
                        {q.options && q.options.length > 0 && (
                            <ul className="list-disc list-inside pl-6 text-sm text-muted-foreground mt-1">
                                {q.options.map((opt, i) => <li key={opt.id || `opt-${i}`}>{opt.value}</li>)}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
           ) : (
            <p className="text-muted-foreground text-center py-4">No questions have been added to this survey yet.</p>
           )}
            <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href={`/surveys/${survey.id}/edit#questions`}>Manage Questions</Link>
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responses & Settings</CardTitle>
           <CardDescription>Analyze results and manage survey configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">View collected data and adjust survey settings.</p>
           <div className="flex gap-2 flex-wrap">
                <Button asChild>
                     <Link href={`/insights?surveyId=${survey.id}`}>
                        View Insights
                     </Link>
                </Button>
                 <Button variant="outline" asChild>
                     <Link href={`/surveys/${survey.id}/responses`}>
                         <Eye className="mr-2 h-4 w-4" /> View Responses
                     </Link>
                 </Button>
                 <Button variant="outline" asChild>
                    <Link href={`/surveys/${survey.id}/settings`}>
                         <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                 </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
