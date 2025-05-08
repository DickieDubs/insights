

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Briefcase, FileText, UsersRound, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { use } from 'react';
import { getKpiData, getRecentCampaigns } from '@/lib/firebase/firestore-service';
import type { Campaign } from '@/types';
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

async function loadDashboardData() {
    const kpiData = await getKpiData();
    const recentCampaigns = await getRecentCampaigns(4); // Fetch 4 recent campaigns
    return { kpiData, recentCampaigns };
}


export default function DashboardOverview() {
  const { kpiData, recentCampaigns } = use(loadDashboardData());

  const kpiCardHoverEffect = "transition-all duration-200 ease-in-out hover:shadow-xl hover:scale-[1.02] hover:bg-card/95 dark:hover:bg-card/80";

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-semibold text-primary">Dashboard Overview</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/clients" className="block">
          <Card className={kpiCardHoverEffect}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpiData.totalClients}</div>
              {/* <p className="text-xs text-muted-foreground">+2 since last month</p> */}
            </CardContent>
          </Card>
        </Link>
        <Link href="/campaigns" className="block">
          <Card className={kpiCardHoverEffect}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpiData.totalCampaigns}</div>
              {/* <p className="text-xs text-muted-foreground">+5 active</p> */}
            </CardContent>
          </Card>
        </Link>
        <Link href="/surveys" className="block">
          <Card className={kpiCardHoverEffect}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpiData.totalSurveys}</div>
              {/* <p className="text-xs text-muted-foreground">+20 completed</p> */}
            </CardContent>
          </Card>
        </Link>
        <Link href="/surveys" className="block"> {/* Or /insights if more appropriate for respondents */}
          <Card className={kpiCardHoverEffect}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Respondents</CardTitle>
              <UsersRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpiData.totalRespondents.toLocaleString()}</div>
              {/* <p className="text-xs text-muted-foreground">Across all surveys</p> */}
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Other Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
             {recentCampaigns.length > 0 ? (
                <ul className="space-y-3">
                    {recentCampaigns.map((campaign) => (
                        <li key={campaign.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/80 dark:hover:bg-muted/50 transition-colors">
                            <div>
                                <Link href={`/campaigns/${campaign.id}`} className="font-medium hover:underline text-primary">{campaign.title}</Link>
                                <p className="text-sm text-muted-foreground">{campaign.clientName || 'N/A Client'} - {formatDate(campaign.startDate)}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                campaign.status === 'Planning' || campaign.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800' // Paused or Archived
                            }`}>{campaign.status}</span>
                        </li>
                    ))}
                </ul>
             ) : (
                 <p className="text-muted-foreground text-center py-4">No recent campaigns to display.</p>
             )}
          </CardContent>
        </Card>
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
             <Button asChild variant="outline">
               <Link href="/clients/new">
                 <Users className="mr-2 h-4 w-4" /> Add New Client
               </Link>
            </Button>
             <Button asChild variant="outline">
               <Link href="/campaigns/new">
                 <Briefcase className="mr-2 h-4 w-4" /> Create New Campaign
               </Link>
            </Button>
             <Button asChild variant="outline">
               <Link href="/surveys/new">
                 <FileText className="mr-2 h-4 w-4" /> Create New Survey
               </Link>
            </Button>
             <Button asChild variant="outline">
               <Link href="/brand">
                 <Sparkles className="mr-2 h-4 w-4" /> Manage Brand
               </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

