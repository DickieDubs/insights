

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Briefcase, FileText, UsersRound, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data - replace with real data fetching later
const kpiData = {
  totalClients: 12,
  totalCampaigns: 45,
  totalSurveys: 150,
  totalRespondents: 12345,
};

const recentCampaigns = [
  { id: 1, title: 'Spring Snack Launch', client: 'Gourmet Bites', status: 'Active' },
  { id: 2, title: 'Beverage Taste Test Q2', client: 'Liquid Refreshments', status: 'Completed' },
  { id: 3, title: 'New Cereal Concept', client: 'Morning Foods Inc.', status: 'Planning' },
  { id: 4, title: 'Frozen Meals Feedback', client: 'Quick Eats Co.', status: 'Active' },
];

export default function DashboardOverview() {
  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-2xl font-semibold text-primary">Dashboard Overview</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData.totalClients}</div>
            {/* <p className="text-xs text-muted-foreground">+2 since last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData.totalCampaigns}</div>
             {/* <p className="text-xs text-muted-foreground">+5 active</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData.totalSurveys}</div>
             {/* <p className="text-xs text-muted-foreground">+20 completed</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respondents</CardTitle>
             <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{kpiData.totalRespondents.toLocaleString()}</div>
            {/* <p className="text-xs text-muted-foreground">Across all surveys</p> */}
          </CardContent>
        </Card>
      </div>

      {/* Other Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Replace with actual component later */}
             {recentCampaigns.length > 0 ? (
                <ul className="space-y-2">
                    {recentCampaigns.map((campaign) => (
                        <li key={campaign.id} className="flex justify-between items-center p-2 rounded hover:bg-secondary">
                            <div>
                                <Link href={`/campaigns/camp_${campaign.id}`} className="font-medium hover:underline text-primary">{campaign.title}</Link> {/* Example link */}
                                <p className="text-sm text-muted-foreground">{campaign.client}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                                campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>{campaign.status}</span>
                        </li>
                    ))}
                </ul>
             ) : (
                 <p className="text-muted-foreground text-center py-4">No recent campaigns to display.</p>
             )}
          </CardContent>
        </Card>
        <Card>
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
               <Link href="/campaigns/new"> {/* Assuming '/campaigns/new' exists */}
                 <Briefcase className="mr-2 h-4 w-4" /> Create New Campaign
               </Link>
            </Button>
             <Button asChild variant="outline">
               <Link href="/surveys/new">
                 <FileText className="mr-2 h-4 w-4" /> Create New Survey
               </Link>
            </Button>
             {/* Add more relevant quick actions */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
