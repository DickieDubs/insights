
export const runtime = 'edge';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FileText, Briefcase, Calendar, Users, ListChecks, CheckSquare, Award, Settings, Pencil, Link as LinkIcon, Eye, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { use } from 'react'; // Import 'use'

// Define question type for mock data
type SurveyQuestion = {
    id: string;
    text: string;
    type: 'multiple-choice' | 'rating' | 'text' | 'ranking';
    options?: string[]; // For multiple-choice or ranking
};

// Mock data - make surveys array accessible at module level
const allSurveysData = [
    { id: 'sur_1', name: 'Initial Concept Test', campaign: 'Spring Snack Launch', campaignId: 'camp_1', status: 'Active', responses: 152, createdDate: '2024-03-05', questionCount: 10, type: 'Concept Test', rewardProgramId: 'rew_1', rewardProgramName: 'Standard Points Program', questions: [ { id: 'q1', text: 'How appealing is this snack concept?', type: 'rating' }, { id: 'q2', text: 'Which flavor profile sounds most interesting?', type: 'multiple-choice', options: ['Spicy Mango', 'Garlic Parmesan', 'Sweet Chili'] }, { id: 'q3', text: 'Any suggestions for improvement?', type: 'text' } ] as SurveyQuestion[] },
    { id: 'sur_2', name: 'Packaging Preference', campaign: 'Spring Snack Launch', campaignId: 'camp_1', status: 'Completed', responses: 210, createdDate: '2024-03-15', questionCount: 8, type: 'Preference Test', rewardProgramId: null, rewardProgramName: null, questions: [ { id: 'q4', text: 'Which packaging design do you prefer?', type: 'multiple-choice', options: ['Design A', 'Design B', 'Design C'] } ] as SurveyQuestion[] },
    { id: 'sur_3', name: 'Taste Profile Analysis', campaign: 'Spring Snack Launch', campaignId: 'camp_1', status: 'Planning', responses: 0, createdDate: '2024-04-01', questionCount: 15, type: 'Sensory Test', rewardProgramId: 'rew_1', rewardProgramName: 'Standard Points Program', questions: [] as SurveyQuestion[] },
    { id: 'sur_4', name: 'Flavor Preference Ranking', campaign: 'Beverage Taste Test Q2', campaignId: 'camp_3', status: 'Completed', responses: 350, createdDate: '2024-04-10', questionCount: 5, type: 'Ranking', rewardProgramId: 'rew_2', rewardProgramName: 'Gift Card Raffle Q3', questions: [ {id: 'q5', text: 'Rank these potential new flavors (1=most preferred)', type: 'ranking', options: ['Berry Blast', 'Citrus Zing', 'Tropical Twist'] } ] as SurveyQuestion[] },
    // Add other surveys
];

export async function generateStaticParams() {
  return allSurveysData.map((survey) => ({
    surveyId: survey.id,
  }));
}


const getSurveyData = async (surveyId: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 50));

  const survey = allSurveysData.find(s => s.id === surveyId);
  // Return default structure even if not found, including empty questions array
  return survey || { id: surveyId, name: 'Survey Not Found', campaign: 'N/A', campaignId: 'N/A', status: 'N/A', responses: 0, createdDate: 'N/A', questionCount: 0, type: 'N/A', rewardProgramId: null, rewardProgramName: null, questions: [] as SurveyQuestion[] };
};

// Helper to format date strings (optional)
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString; // Return original string if parsing fails
    }
}

// Update params type to Promise<{ surveyId: string }>
export default function SurveyDetailPage({ params }: { params: Promise<{ surveyId: string }> }) {
    // Unwrap the promise using React.use()
    const { surveyId } = use(params);
    // Fetch data *after* unwrapping the promise
    const survey = use(getSurveyData(surveyId));

    if (survey.name === 'Survey Not Found') {
        return (
            <div className="p-6 text-center">
                 <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit mx-auto">
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
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary w-fit">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>
             {/* Action Buttons */}
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" asChild>
                     {/* Ensure the link points to the correct edit page */}
                     <Link href={`/surveys/${survey.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Link>
                 </Button>
                  <Button variant="outline" size="sm" disabled>
                        <LinkIcon className="mr-2 h-4 w-4" /> Get Link
                 </Button>
            </div>
        </div>

        {/* Survey Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-primary">{survey.name}</h1>
                 <Link href={`/campaigns/${survey.campaignId}`} className="text-lg text-muted-foreground hover:underline flex items-center gap-1">
                    <Briefcase className="h-4 w-4" /> {survey.campaign}
                 </Link>
            </div>
            <Badge variant={
                survey.status === 'Active' ? 'default' :
                survey.status === 'Completed' ? 'outline' :
                survey.status === 'Planning' ? 'secondary' :
                'secondary' // Draft or other states
                } className={`text-base px-4 py-1
                ${survey.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                ${survey.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                ${survey.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${survey.status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                border-transparent font-semibold
                `}>
                {survey.status}
            </Badge>
        </div>

        <Separator />

        {/* Survey Metadata */}
        <Card>
            <CardHeader>
                <CardTitle>Survey Details</CardTitle>
            </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Created Date</p>
                        <p className="text-muted-foreground">{formatDate(survey.createdDate)}</p>
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
                        <p className="text-muted-foreground">{survey.questionCount}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Responses</p>
                        <p className="text-muted-foreground">{survey.responses.toLocaleString()}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="font-medium">Reward Program</p>
                         {survey.rewardProgramId ? (
                             <Link href={`/rewards?programId=${survey.rewardProgramId}`} className="text-primary hover:underline">
                                {survey.rewardProgramName || survey.rewardProgramId}
                             </Link>
                         ) : (
                             <p className="text-muted-foreground">None</p>
                         )}
                    </div>
                </div>
            </CardContent>
        </Card>


      {/* Survey Questions */}
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary"/> Survey Questions</CardTitle>
           <CardDescription>List of questions included in this survey.</CardDescription>
        </CardHeader>
        <CardContent>
           {survey.questions && survey.questions.length > 0 ? (
            <ul className="space-y-3">
                {survey.questions.map((q, index) => (
                    <li key={q.id} className="border-b pb-3 last:border-b-0">
                        <p className="font-medium">{index + 1}. {q.text}</p>
                        <p className="text-xs text-muted-foreground capitalize pl-4">Type: {q.type.replace('-', ' ')}</p>
                        {q.options && (
                            <ul className="list-disc list-inside pl-6 text-sm text-muted-foreground">
                                {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
           ) : (
            <p className="text-muted-foreground text-center py-4">No questions have been added to this survey yet.</p>
           )}
            <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href={`/surveys/${survey.id}/edit#questions`}>Edit Questions</Link>
            </Button>
        </CardContent>
      </Card>

      {/* Placeholder for Survey Responses and Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Responses & Settings</CardTitle>
           <CardDescription>Analyze results and manage survey configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">View collected data and adjust survey settings.</p>
           <div className="flex gap-2">
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
