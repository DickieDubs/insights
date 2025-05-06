
export const runtime = 'edge';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react'; // Import 'use'

// Mock data - make surveys array accessible at module level
const allSurveysData = [
    { id: 'sur_1', name: 'Initial Concept Test' },
    { id: 'sur_2', name: 'Packaging Preference' },
    { id: 'sur_3', name: 'Taste Profile Analysis'},
    { id: 'sur_4', name: 'Flavor Preference Ranking'},
    // Add other surveys as needed for generateStaticParams
];

export async function generateStaticParams() {
  return allSurveysData.map((survey) => ({
    surveyId: survey.id,
  }));
}


// Update params type to Promise<{ surveyId: string }>
export default function SurveyResponsesPage({ params }: { params: Promise<{ surveyId: string }> }) {
  // Unwrap the promise using React.use()
  const { surveyId } = use(params);

  // TODO: Fetch actual responses based on surveyId

  return (
    <div className="flex flex-col gap-6 py-6">
        {/* Back to Survey Details Link */}
         <Link href={`/surveys/${surveyId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Survey Details
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
          <Eye className="h-6 w-6" /> Survey Responses
        </h1>
        {/* Add actions like "Export Responses" */}
        <Button disabled>
            Export Responses (CSV)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responses for Survey: {surveyId}</CardTitle>
          <CardDescription>View individual responses submitted by participants.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A table or list displaying individual survey responses will appear here.
            (Placeholder Content)
          </p>
          {/* TODO: Implement response table/viewer component */}
          <div className="mt-4 border rounded-lg p-4">
            <p className="font-medium">Response #123 (Placeholder)</p>
            <p className="text-sm text-muted-foreground">Submitted: 2024-05-10 | User: anon_xyz</p>
            {/* Display answers */}
            <ul className="mt-2 text-sm space-y-1">
                <li>Q1 Rating: 4</li>
                <li>Q2 Flavor: Spicy Mango</li>
                <li>Q3 Suggestion: Needs more salt.</li>
            </ul>
             <Button variant="outline" size="sm" className="mt-2" disabled>View Full Response</Button>
           </div>
        </CardContent>
         {/* TODO: Add pagination for responses */}
      </Card>
    </div>
  );
}
