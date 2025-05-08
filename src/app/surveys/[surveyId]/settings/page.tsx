// src/app/surveys/[surveyId]/settings/page.tsx
// This is a Server Component by default. Do NOT add 'use client';

// Import the Client Component that handles the UI
import SurveySettingsClientPage from './settings-client';

// Mock data - Used by generateStaticParams (ideally fetched in a real app)
// This data is only needed on the server at build time for generateStaticParams
const allSurveysData = [
  { id: 'sur_1', name: 'Initial Concept Test' },
  { id: 'sur_2', name: 'Packaging Preference' },
  { id: 'sur_3', name: 'Taste Profile Analysis'},
  { id: 'sur_4', name: 'Flavor Preference Ranking'},
];

// This function runs on the server at build time to define dynamic paths
export async function generateStaticParams() {
  // In a real application, fetch the IDs of your surveys from your database or API
  // Example:
  // const surveys = await fetch('YOUR_API/surveys').then((res) => res.json());
  // return surveys.map((survey) => ({
  //   surveyId: survey.id,
  // }));

  // Using the mock data for demonstration
  return allSurveysData.map((survey) => ({
    surveyId: survey.id,
  }));
}

// This is the main Server Component for the page route
// It receives the resolved params object directly as a prop
export default function SurveySettingsPage({ params }: { params: { surveyId: string } }) {
  const { surveyId } = params; // Access the surveyId from the params object

  // --- Server-Side Data Fetching (Optional) ---
  // You could fetch initial settings data here on the server before rendering
  // and pass it down as a prop to the client component.
  // Example:
  // const initialSettings = await fetch(`YOUR_API/surveys/${surveyId}/settings`, {
  //   cache: 'no-store' // or 'force-cache' depending on your needs
  // }).then(res => res.json());
  // ---

  // Render the Client Component, passing the params object (and optional initial data)
  return (
    <SurveySettingsClientPage
      params={params}
      // initialSettings={initialSettings} // Pass initial data if fetched above
    />
  );
}

// REMOVE any client-side imports (useState, useEffect, useToast, Card, Button, etc.)
// REMOVE any state declarations (useState)
// REMOVE any effect hooks (useEffect)
// REMOVE any client-side event handlers like handleSaveSettings
// REMOVE the UI JSX from the original file (that goes in settings-client.tsx)