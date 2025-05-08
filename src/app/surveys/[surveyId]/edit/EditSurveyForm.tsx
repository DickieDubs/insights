// app/surveys/[surveyId]/edit/page.tsx
// NO 'use client' here!

import { notFound } from 'next/navigation'; // Import notFound
import { use } from 'react'; // Correct use of 'use' in Server Component

// --- Mock Data & Fetching (Keep or move to lib) ---
// You can keep these mocks here or move them to a shared file (e.g., lib/data.ts)
const allSurveysData = [
    { id: 'sur_1', name: 'Initial Concept Test', campaignId: 'camp_1', status: 'Active', description: 'Testing initial concepts for the new snack line.', questionCount: 3, type: 'Concept Test', rewardProgramId: 'rew_1', questions: [{ id: 'q1', text: 'How appealing?', type: 'rating' }, { id: 'q2', text: 'Which flavor?', type: 'multiple-choice', options: [{ id: 'opt1', value: 'A' }, { id: 'opt2', value: 'B' }] }, { id: 'q3', text: 'Suggestions?', type: 'text' }] },
    { id: 'sur_2', name: 'Packaging Preference', campaignId: 'camp_1', status: 'Completed', description: 'Gathering feedback on potential packaging designs.', questionCount: 1, type: 'Preference Test', rewardProgramId: null, questions: [{ id: 'q4', text: 'Design preference?', type: 'multiple-choice', options: [{ id: 'opt3', value: 'X' }, { id: 'opt4', value: 'Y' }] }] },
    // ... other surveys with or without questions
];

const getSurveyData = async (surveyId: string) => {
    // Simulate API call - This runs on the server during build/request
    console.log(`[Server] Fetching survey data for ID: ${surveyId}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    const survey = allSurveysData.find(s => s.id === surveyId);

    // Return a deep copy to avoid modifying mock data directly if mutations were real
    if (survey) {
         return JSON.parse(JSON.stringify(survey));
    }

    return null;
};

// --- Mock Data for Selects (Keep or move to lib) ---
const campaigns = [
    { id: 'camp_1', title: 'Spring Snack Launch' },
    { id: 'camp_3', title: 'Beverage Taste Test Q2' },
    { id: 'camp_new_1', title: 'New Cereal Concept' },
];
const rewardPrograms = [
    { id: 'rew_1', name: 'Standard Points Program' },
    { id: 'rew_2', name: 'Gift Card Raffle Q3' },
    // Add a "None" option is handled in the client component Select
];
const surveyStatuses = ['Draft', 'Planning', 'Active', 'Paused', 'Completed'];
const surveyTypes = ['Concept Test', 'Preference Test', 'Sensory Test', 'Ranking', 'Brand Study', 'Design Feedback', 'Usage & Attitude', 'Other'];
const questionTypes = ['multiple-choice', 'rating', 'text', 'ranking']; // For question builder


// --- generateStaticParams (Server-only) ---
export async function generateStaticParams() {
    console.log("[Server] Running generateStaticParams...");
    // In a real app, you'd fetch all survey IDs from your database
    const surveyIds = allSurveysData.map((survey) => ({
        surveyId: survey.id,
    }));
     console.log("[Server] Generated params:", surveyIds);
     return surveyIds;
}

// --- Import Client Component ---
import EditSurveyForm from './EditSurveyForm';

// --- Server Component Page ---
export default function EditSurveyPage({ params }: { params: { surveyId: string } }) {
    const surveyId = params.surveyId;

    // Fetch data directly in the Server Component using 'use' to unwrap the promise
    const surveyData = use(getSurveyData(surveyId));

    // Handle case where survey is not found - crucial for static generation/server rendering
    if (!surveyData) {
         console.warn(`[Server] Survey with ID ${surveyId} not found.`);
         notFound(); // Renders the closest not-found page or the default
    }

    // Pass the fetched data and other necessary server-side props to the Client Component
    return (
        <EditSurveyForm
            surveyId={surveyId}
            initialData={surveyData} // Pass the fetched data
            campaigns={campaigns} // Pass static list
            rewardPrograms={rewardPrograms} // Pass static list
            surveyStatuses={surveyStatuses} // Pass static list
            surveyTypes={surveyTypes} // Pass static list
            questionTypes={questionTypes} // Pass static list
        />
    );
}