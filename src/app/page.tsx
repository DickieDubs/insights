
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// --- In-memory data store (replace with actual DB interaction) ---
// This simulates data persistence across requests in a dev environment.
// In a real app, this data would come from Firestore or another database.
let mockSurveys = [
  { id: 'sur_1', name: 'Initial Concept Test', campaign: 'Spring Snack Launch', campaignId: 'camp_1', status: 'Active', responses: 152, createdDate: '2024-03-05', questionCount: 10, type: 'Concept Test', rewardProgramId: 'rew_1' },
  { id: 'sur_2', name: 'Packaging Preference', campaign: 'Spring Snack Launch', campaignId: 'camp_1', status: 'Completed', responses: 210, createdDate: '2024-03-15', questionCount: 8, type: 'Preference Test', rewardProgramId: null },
  { id: 'sur_3', name: 'Taste Profile Analysis', campaign: 'Spring Snack Launch', campaignId: 'camp_1', status: 'Planning', responses: 0, createdDate: '2024-04-01', questionCount: 15, type: 'Sensory Test', rewardProgramId: 'rew_1' },
  { id: 'sur_4', name: 'Flavor Preference Ranking', campaign: 'Beverage Taste Test Q2', campaignId: 'camp_3', status: 'Completed', responses: 350, createdDate: '2024-04-10', questionCount: 5, type: 'Ranking', rewardProgramId: 'rew_2' },
  { id: 'sur_5', name: 'Brand Perception Survey', campaign: 'Beverage Taste Test Q2', campaignId: 'camp_3', status: 'Completed', responses: 320, createdDate: '2024-04-20', questionCount: 12, type: 'Brand Study', rewardProgramId: null },
  { id: 'sur_6', name: 'Cereal Box Design Feedback', campaign: 'New Cereal Concept', campaignId: 'camp_new_1', status: 'Draft', responses: 0, createdDate: '2024-05-01', questionCount: 7, type: 'Design Feedback', rewardProgramId: null },
];

// Function to add a new survey (simulates DB insert)
export const addMockSurvey = (surveyData: any) => {
   const newSurvey = {
      ...surveyData,
      id: `sur_${Math.random().toString(36).substring(2, 8)}`, // Generate random ID
      createdDate: new Date().toISOString().split('T')[0], // Set current date
      responses: 0,
      questionCount: 0, // Initially 0 questions
      // Derive campaign name from ID if possible (using existing mock data structure)
      campaign: mockCampaigns.find(c => c.id === surveyData.campaignId)?.title || 'Unknown Campaign',
   };
  mockSurveys.push(newSurvey);
  console.log("Added mock survey:", newSurvey);
  return newSurvey;
};

// Mock Campaigns for lookup
const mockCampaigns = [
  { id: 'camp_1', title: 'Spring Snack Launch' },
  { id: 'camp_3', title: 'Beverage Taste Test Q2' },
  { id: 'camp_new_1', title: 'New Cereal Concept' },
];
// --- End of in-memory data store ---


// Helper to format date strings (optional)
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString; // Return original string if parsing fails
    }
}

export default function SurveysPage() {
  // Use the current state of mockSurveys for rendering
  const surveys = [...mockSurveys].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()); // Sort by most recent

  return (
    <div className="flex flex-col gap-6 py-6">
        {/* Back to Dashboard Link */}
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Surveys</h1>
        <Button asChild>
          <Link href="/surveys/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Survey
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey List</CardTitle>
          <CardDescription>Manage all your grocery product surveys.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Survey Name</TableHead>
                <TableHead className="hidden lg:table-cell">Campaign</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">Responses</TableHead> {/* Adjusted breakpoint and alignment */}
                <TableHead className="hidden lg:table-cell text-center">Reward</TableHead> {/* Centered */}
                <TableHead className="text-right"> {/* Right align actions */}
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium">
                     <Link href={`/surveys/${survey.id}`} className="hover:underline text-primary">
                      {survey.name}
                     </Link>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                      <Link href={`/campaigns/${survey.campaignId}`} className="text-muted-foreground hover:underline text-xs">
                        {survey.campaign}
                      </Link>
                  </TableCell>
                   <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{formatDate(survey.createdDate)}</TableCell>
                  <TableCell>
                     <Badge variant={
                        survey.status === 'Active' ? 'default' :
                        survey.status === 'Completed' ? 'outline' :
                        survey.status === 'Planning' ? 'secondary' :
                        'secondary' // Draft or other states
                        } className={`
                        ${survey.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                        ${survey.status === 'Completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                        ${survey.status === 'Planning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                        ${survey.status === 'Draft' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''}
                        border-transparent font-semibold text-xs
                     `}>
                        {survey.status}
                    </Badge>
                   </TableCell>
                   <TableCell className="hidden md:table-cell text-right text-muted-foreground">{survey.responses.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center">
                        {survey.rewardProgramId ? (
                             <Link href={`/rewards?programId=${survey.rewardProgramId}`} title="View Reward Program">
                                <Award className="h-4 w-4 text-accent hover:text-accent/80 mx-auto"/> {/* Added mx-auto for center */}
                             </Link>
                        ) : (
                            <span className="text-muted-foreground/50">-</span>
                        )}
                    </TableCell>
                  <TableCell className="text-right">
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
                            <Link href={`/surveys/${survey.id}`}>View Details</Link>
                         </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/insights?surveyId=${survey.id}`}>View Insights</Link>
                         </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                             <Link href={`/surveys/${survey.id}/responses`}>View Responses</Link>
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                             <Link href={`/surveys/${survey.id}/edit`}>Edit Survey</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled>Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {surveys.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No surveys found. Create one to get started!</p>
            )}
        </CardContent>
         {/* Potential CardFooter for pagination */}
      </Card>
    </div>
  );
}
