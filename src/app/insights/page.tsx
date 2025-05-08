
'use client'; // Required for Recharts

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { 
    getResponseRateData, 
    getRatingData, 
    getCompletionTrendData,
    getAllCampaigns, // For campaign filter
    getAllSurveys,   // For survey filter
} from '@/lib/firebase/firestore-service';
import type { Campaign, Survey } from '@/types';


const COLORS = ['#DC2626', '#F97316', '#FACC15', '#84CC16', '#22C55E']; // From Red to Green

type ResponseRate = { name: string; sent: number; responses: number };
type Rating = { name: string; value: number };
type CompletionTrend = { name: string; completions: number; dropOffs: number };


export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  // Chart data state
  const [responseRateData, setResponseRateData] = useState<ResponseRate[]>([]);
  const [ratingData, setRatingData] = useState<Rating[]>([]);
  const [completionTrendData, setCompletionTrendData] = useState<CompletionTrend[]>([]);


  useEffect(() => {
    async function loadFilters() {
        setIsLoading(true);
        try {
            const [fetchedCampaigns, fetchedSurveys] = await Promise.all([
                getAllCampaigns(),
                getAllSurveys()
            ]);
            setCampaigns([{ id: 'all', title: 'All Campaigns' } as any, ...fetchedCampaigns]);
            setSurveys([{ id: 'all', name: 'All Surveys'} as any, ...fetchedSurveys]);
        } catch (error) {
            console.error("Error loading filter data:", error);
            // Handle error (e.g., show toast)
        }
        setIsLoading(false);
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function loadChartData() {
        setIsLoadingCharts(true);
        try {
            // TODO: Filter chart data based on selectedCampaignId and selectedSurveyId
            const [respRate, rateData, compTrend] = await Promise.all([
                getResponseRateData(),
                getRatingData(),
                getCompletionTrendData()
            ]);
            setResponseRateData(respRate);
            setRatingData(rateData);
            setCompletionTrendData(compTrend);
        } catch (error) {
            console.error("Error loading chart data:", error);
        }
        setIsLoadingCharts(false);
    }
    loadChartData();
  }, [selectedCampaignId, selectedSurveyId]); // Reload chart data when filters change


  const filteredSurveysForSelect = selectedCampaignId && selectedCampaignId !== 'all'
    ? surveys.filter(s => s.campaignId === selectedCampaignId || s.id === 'all')
    : surveys;

  if (isLoading) { // Initial loading for filters
    return (
      <div className="flex flex-col gap-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Loading Filter Data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-6 py-6">
         <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Insights</h1>
        <div className="flex gap-2">
           <Select onValueChange={(value) => setSelectedCampaignId(value === 'all' ? null : value)} value={selectedCampaignId || 'all'}>
            <SelectTrigger className="w-[180px]" disabled={isLoading}>
                <SelectValue placeholder="Select Campaign" />
            </SelectTrigger>
            <SelectContent>
                {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>{campaign.title}</SelectItem>
                ))}
            </SelectContent>
           </Select>
            <Select onValueChange={(value) => setSelectedSurveyId(value === 'all' ? null : value)} value={selectedSurveyId || 'all'}>
            <SelectTrigger className="w-[180px]" disabled={isLoading || (selectedCampaignId && selectedCampaignId !== 'all' && filteredSurveysForSelect.length <= 1) }>
                <SelectValue placeholder="Select Survey" />
            </SelectTrigger>
            <SelectContent>
                {filteredSurveysForSelect.map(survey => (
                     <SelectItem key={survey.id} value={survey.id}>{survey.name}</SelectItem>
                ))}
            </SelectContent>
           </Select>
        </div>
      </div>

      {isLoadingCharts ? (
         <div className="grid gap-6 md:grid-cols-2">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className={i === 2 ? "md:col-span-2" : ""}>
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse mt-1"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] bg-muted rounded animate-pulse"></div>
                    </CardContent>
                </Card>
            ))}
         </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Rates</CardTitle>
             <CardDescription>Comparison of sent surveys vs. responses received.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseRateData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="sent" fill="hsl(var(--primary) / 0.5)" name="Sent" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="responses" fill="hsl(var(--accent))" name="Responses" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Ratings Distribution</CardTitle>
             <CardDescription>Overall product rating distribution from surveys.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                    <Pie
                        data={ratingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {ratingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                     <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                     <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                 </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
            <CardDescription>Monthly survey completions vs. drop-offs.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
               <LineChart data={completionTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                 <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                 <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                 <Legend wrapperStyle={{ fontSize: '12px' }}/>
                 <Line type="monotone" dataKey="completions" name="Completions" stroke="hsl(var(--accent))" strokeWidth={2} activeDot={{ r: 8 }} />
                 <Line type="monotone" dataKey="dropOffs" name="Drop-offs" stroke="hsl(var(--destructive))" strokeWidth={2} />
               </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      )}

       <Card>
        <CardHeader>
          <CardTitle>More Analytics</CardTitle>
          <CardDescription>Additional insights will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Demographic breakdowns, sentiment analysis, etc. (Placeholder)</p>
        </CardContent>
      </Card>
    </div>
  );
}

