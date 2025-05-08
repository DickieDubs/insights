

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
import { getAllSurveys } from '@/lib/firebase/firestore-service';
import type { Survey } from '@/types';
import { use } from 'react';
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


async function getSurveysData(): Promise<Survey[]> {
    return getAllSurveys(); // This will now fetch from Firestore
}

export default function SurveysPage() {
  const surveys = use(getSurveysData());

  return (
    <div className="flex flex-col gap-6 py-6">
        {/* Back to Dashboard Link */}
         <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
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
                <TableHead className="hidden md:table-cell text-right">Questions</TableHead> {/* Changed from Responses */}
                <TableHead className="hidden lg:table-cell text-center">Reward</TableHead>
                <TableHead className="text-right">
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
                        {survey.campaignName || survey.campaignId}
                      </Link>
                  </TableCell>
                   <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{formatDate(survey.createdAt)}</TableCell>
                  <TableCell>
                     <Badge variant={
                        survey.status === 'Active' ? 'default' :
                        survey.status === 'Completed' ? 'outline' :
                        survey.status === 'Planning' || survey.status === 'Draft' ? 'secondary' :
                        'destructive' // Paused or Archived
                        } className={`
                        ${survey.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                        ${survey.status === 'Completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                        ${survey.status === 'Planning' || survey.status === 'Draft' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                        ${survey.status === 'Paused' || survey.status === 'Archived' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : ''}
                        border-transparent font-semibold text-xs
                     `}>
                        {survey.status}
                    </Badge>
                   </TableCell>
                   <TableCell className="hidden md:table-cell text-right text-muted-foreground">{survey.questions?.length || 0}</TableCell>
                    <TableCell className="hidden lg:table-cell text-center">
                        {survey.rewardProgramId ? (
                             <Link href={`/rewards?programId=${survey.rewardProgramId}`} title="View Reward Program">
                                <Award className="h-4 w-4 text-accent hover:text-accent/80 mx-auto"/>
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
                        {/* <DropdownMenuItem disabled>Duplicate</DropdownMenuItem> */}
                         <DropdownMenuSeparator />
                        {/* <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled>Archive</DropdownMenuItem> */}
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
      </Card>
    </div>
  );
}
