
'use client'; // Mark as client component for form handling

import React, { useState, useEffect, use } from 'react'; // Import 'use'
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form'; // Import useFieldArray
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Trash2, PlusCircle, GripVertical } from 'lucide-react'; // Added PlusCircle, GripVertical
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from '@/components/ui/separator'; // Import Separator


// --- Mock Data ---
const allSurveysData = [
    { id: 'sur_1', name: 'Initial Concept Test', campaignId: 'camp_1', status: 'Active', description: 'Testing initial concepts for the new snack line.', questionCount: 3, type: 'Concept Test', rewardProgramId: 'rew_1', questions: [{ id: 'q1', text: 'How appealing?', type: 'rating' }, { id: 'q2', text: 'Which flavor?', type: 'multiple-choice', options: ['A', 'B'] }, { id: 'q3', text: 'Suggestions?', type: 'text' }] },
    { id: 'sur_2', name: 'Packaging Preference', campaignId: 'camp_1', status: 'Completed', description: 'Gathering feedback on potential packaging designs.', questionCount: 1, type: 'Preference Test', rewardProgramId: null, questions: [{ id: 'q4', text: 'Design preference?', type: 'multiple-choice', options: ['X', 'Y'] }] },
    // ... other surveys with or without questions
];

export async function generateStaticParams() {
  return allSurveysData.map((survey) => ({
    surveyId: survey.id,
  }));
}

const getSurveyData = async (surveyId: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const survey = allSurveysData.find(s => s.id === surveyId);
  // Make sure questions array exists, even if empty
  if (survey && !survey.questions) {
    survey.questions = [];
  }
  return survey || null;
};

// --- Mock Data for Selects ---
const campaigns = [
  { id: 'camp_1', title: 'Spring Snack Launch' },
  { id: 'camp_3', title: 'Beverage Taste Test Q2' },
  { id: 'camp_new_1', title: 'New Cereal Concept' },
];
const rewardPrograms = [
    { id: 'rew_1', name: 'Standard Points Program' },
    { id: 'rew_2', name: 'Gift Card Raffle Q3' },
    // Add a "None" option
];
const surveyStatuses = ['Draft', 'Planning', 'Active', 'Paused', 'Completed'];
const surveyTypes = ['Concept Test', 'Preference Test', 'Sensory Test', 'Ranking', 'Brand Study', 'Design Feedback', 'Usage & Attitude', 'Other'];
const questionTypes = ['multiple-choice', 'rating', 'text', 'ranking']; // For question builder


// --- Question Schema ---
const questionOptionSchema = z.object({
    id: z.string().optional(), // Optional ID for existing options
    value: z.string().min(1, { message: "Option text cannot be empty." })
});

const questionSchema = z.object({
    id: z.string().optional(), // Optional ID for existing questions
    text: z.string().min(1, { message: "Question text cannot be empty." }),
    type: z.enum(['multiple-choice', 'rating', 'text', 'ranking']),
    options: z.array(questionOptionSchema).optional(), // Array of options for relevant types
}).refine(data => {
    // Require options for multiple-choice and ranking
    if ((data.type === 'multiple-choice' || data.type === 'ranking') && (!data.options || data.options.length < 2)) {
        return false;
    }
    return true;
}, {
    message: "Multiple Choice and Ranking questions require at least 2 options.",
    path: ["options"], // Attach error to options field
});


// --- Form Schema ---
const surveyFormSchema = z.object({
  name: z.string().min(3, { message: "Survey name must be at least 3 characters." }).max(100),
  description: z.string().max(500).optional(),
  campaignId: z.string().min(1, { message: "Please select a campaign." }),
  status: z.string().min(1, { message: "Please select a status." }),
  type: z.string().min(1, { message: "Please select a survey type." }),
  rewardProgramId: z.string().optional().nullable(), // Allow empty/null string
  questions: z.array(questionSchema).optional(), // Array of questions
});

type SurveyFormValues = z.infer<typeof surveyFormSchema>;

// --- Edit Survey Page Component ---
export default function EditSurveyPage({ params }: { params: Promise<{ surveyId: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [surveyData, setSurveyData] = useState<Partial<SurveyFormValues> | null>(null); // Use partial for initial state
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { surveyId } = use(params); // Destructure surveyId here

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: { // Initialize with empty or default values
      name: '',
      description: '',
      campaignId: '',
      status: '',
      type: '',
      rewardProgramId: null,
      questions: [], // Initialize questions array
    },
  });

  // --- Field Array for Questions ---
    const { fields: questionFields, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = useFieldArray({
        control: form.control,
        name: "questions",
    });


  // --- Fetch existing survey data ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadingError(null);
      try {
        const data = await getSurveyData(surveyId); // Use the destructured surveyId
        if (data) {
           setSurveyData(data); // Keep original data separate if needed
           // Reset form with fetched data
           form.reset({
               name: data.name || '',
               description: data.description || '',
               campaignId: data.campaignId || '',
               status: data.status || '',
               type: data.type || '',
               rewardProgramId: data.rewardProgramId || null, // Ensure null if not present
               questions: (data.questions || []).map(q => ({ // Map questions, ensuring options exist
                    id: q.id,
                    text: q.text,
                    type: q.type as any, // Cast type if necessary
                    options: q.options ? q.options.map((opt, index) => ({ id: `opt_${index}`, value: typeof opt === 'string' ? opt : opt.value })) : [] // Map options correctly
                })),
           });
        } else {
          setLoadingError(`Survey with ID ${surveyId} not found.`); // Use the destructured surveyId
           toast({
               variant: "destructive",
               title: "Error",
               description: `Survey not found.`,
           });
           // Optional: Redirect back or show a more prominent error
           // router.push('/surveys');
        }
      } catch (error) {
        console.error("Error fetching survey data:", error);
        setLoadingError("Failed to load survey data.");
         toast({
            variant: "destructive",
            title: "Loading Error",
            description: "Could not load survey details. Please try again.",
         });
      } finally {
        setIsLoading(false);
      }
    };
    if (surveyId) { // Ensure surveyId is available before loading
        loadData();
    }
     // Add surveyId to the dependency array
     // form and toast are stable, so they might not be strictly necessary,
     // but including them is safer if their identity could change.
  }, [surveyId, form, toast]);


  // --- Handle Form Submission (Update) ---
  const handleUpdateSurvey = async (data: SurveyFormValues) => {
    setIsLoading(true);
    console.log("Updating survey:", surveyId, data); // Use the destructured surveyId
    // --- Replace with actual API call to update survey ---
    // Ensure questions data is structured correctly for your API
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    // ---

     // Example success handling
    toast({
      title: "Survey Updated",
      description: `Survey "${data.name}" has been successfully updated.`,
    });
    // No redirect here, stay on edit page after saving
    // router.push(`/surveys/${surveyId}`);
    setIsLoading(false); // Set loading false after save attempt
     form.reset(data); // Reset form with the just saved data to clear dirty state
    // router.refresh(); // Or refresh data on the detail page if staying

    // Example error handling
    // toast({
    //   variant: "destructive",
    //   title: "Update Failed",
    //   description: "Could not update the survey. Please try again.",
    // });
    // setIsLoading(false); // Only on error
  };

    // --- Handle Delete ---
  const handleDeleteSurvey = async () => {
    setIsDeleting(true);
    console.log("Deleting survey:", surveyId); // Use the destructured surveyId
    // --- Replace with actual API call to delete survey ---
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    // ---

     // Example success handling
    toast({
      title: "Survey Deleted",
      description: `Survey has been successfully deleted.`,
    });
    router.push('/surveys'); // Redirect to surveys list

    // Example error handling
    // toast({
    //   variant: "destructive",
    //   title: "Delete Failed",
    //   description: "Could not delete the survey. Please try again.",
    // });
    // setIsDeleting(false);
  };


  // --- Render Loading or Error State ---
   if (isLoading && !form.formState.isDirty && !surveyData) { // Show loading skeleton only on initial load
    return (
      <div className="flex flex-col gap-6 py-6">
         <Link href={`/surveys/${surveyId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
             Back to Survey Details
        </Link>
        <Card>
            <CardHeader>
                <CardTitle><Loader2 className="h-6 w-6 animate-spin text-primary mr-2 inline-block" /> Loading Survey...</CardTitle>
                <CardDescription>Fetching survey details for editing.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 {/* Skeleton loaders */}
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-20 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="h-10 bg-muted rounded animate-pulse"></div>
                 <div className="flex justify-between mt-6">
                    <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
                 </div>
             </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Questions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="h-16 bg-muted rounded animate-pulse"></div>
                 <div className="h-16 bg-muted rounded animate-pulse"></div>
            </CardContent>
         </Card>
      </div>
    );
  }

  if (loadingError) {
     return (
         <div className="flex flex-col gap-6 py-6 items-center">
              <Link href="/surveys" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 self-start w-fit">
                 <ArrowLeft className="h-4 w-4" />
                 Back to Surveys List
             </Link>
             <Card className="w-full max-w-lg border-destructive">
                 <CardHeader>
                     <CardTitle className="text-destructive">Error Loading Survey</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p>{loadingError}</p>
                     <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>Try Again</Button>
                 </CardContent>
             </Card>
         </div>
     );
  }


  // --- Render Form ---
  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href={`/surveys/${surveyId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
             Back to Survey Details
        </Link>

        {/* Survey Details Form */}
        <Form {...form}>
             <form onSubmit={form.handleSubmit(handleUpdateSurvey)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Survey Details: {surveyData?.name || surveyId}</CardTitle>
                        <CardDescription>Modify the basic information of this survey.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Survey Name*</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Snack Concept Feedback" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Briefly describe the purpose of the survey..." {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="campaignId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Campaign*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select associated campaign" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {campaigns.map(campaign => (
                                                    <SelectItem key={campaign.id} value={campaign.id}>{campaign.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select survey status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                 {surveyStatuses.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Survey Type*</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select survey type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                 {surveyTypes.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                         <FormDescription>Helps categorize survey results.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="rewardProgramId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reward Program</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                                            value={field.value ?? "none"} // Use "none" for null/undefined
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select reward program (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                 <SelectItem value="none">None</SelectItem>
                                                 {rewardPrograms.map(program => (
                                                    <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                         <FormDescription>Optionally link a reward for participants.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                 {/* Questions Builder Section */}
                <Card>
                    <CardHeader>
                        {/* Added id="questions" for fragment linking */}
                        <CardTitle id="questions">Questions</CardTitle>
                        <CardDescription>Build and manage the survey questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {questionFields.map((field, index) => (
                            <Card key={field.id} className="p-4 border bg-secondary/50 relative group">
                                <div className="flex gap-2 items-start">
                                     {/* Drag Handle (optional) */}
                                    {/* <Button type="button" variant="ghost" size="icon" className="cursor-grab p-1 h-6 w-6 mt-1 opacity-50 group-hover:opacity-100">
                                        <GripVertical className="h-4 w-4" />
                                    </Button> */}
                                    <div className="flex-1 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`questions.${index}.text`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question {index + 1}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter question text" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`questions.${index}.type`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Question Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select question type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {questionTypes.map(type => (
                                                                <SelectItem key={type} value={type} className="capitalize">{type.replace('-', ' ')}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Conditional Options for Multiple Choice/Ranking */}
                                        {(form.watch(`questions.${index}.type`) === 'multiple-choice' || form.watch(`questions.${index}.type`) === 'ranking') && (
                                            <QuestionOptions index={index} control={form.control} isLoading={isLoading} />
                                        )}

                                        {/* Add more fields like 'required' toggle if needed */}
                                    </div>
                                     {/* Remove Question Button */}
                                     <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10 h-7 w-7 absolute top-2 right-2"
                                        onClick={() => removeQuestion(index)}
                                        disabled={isLoading}
                                        aria-label={`Remove question ${index + 1}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                            </Card>
                         ))}

                         <Button
                            type="button"
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => appendQuestion({ text: '', type: 'text', options: [] })} // Add default question structure
                            disabled={isLoading}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4">
                   <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" disabled={isLoading || isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Survey
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the survey
                                    and all associated responses.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteSurvey}
                                    disabled={isDeleting}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                     {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                     <Button type="submit" disabled={isLoading || isDeleting || !form.formState.isDirty}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </div>
             </form>
        </Form>
    </div>
  );
}

// --- Sub-component for Question Options ---
function QuestionOptions({ index, control, isLoading }: { index: number, control: any, isLoading: boolean }) {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${index}.options`,
    });

    return (
        <div className="space-y-3 pl-4 border-l-2 ml-2">
            <FormLabel>Options</FormLabel>
            {optionFields.map((field, optIndex) => (
                 <div key={field.id} className="flex items-center gap-2">
                    <FormField
                        control={control}
                        name={`questions.${index}.options.${optIndex}.value`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder={`Option ${optIndex + 1}`} {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeOption(optIndex)}
                        disabled={isLoading || optionFields.length <= 1} // Keep at least one option? Or remove this condition?
                         aria-label={`Remove option ${optIndex + 1}`}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                 </div>
            ))}
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => appendOption({ value: '' })}
                disabled={isLoading}
            >
                 <PlusCircle className="mr-2 h-4 w-4" /> Add Option
            </Button>
             <FormMessage className="text-xs"> {/* Show potential array-level errors */}
                {(control.getFieldState(`questions.${index}.options`)?.error as any)?.message}
            </FormMessage>
        </div>
    );
}
