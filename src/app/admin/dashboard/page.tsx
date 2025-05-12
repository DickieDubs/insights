"use client";

import React from 'react'; // Added React import
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Activity,
  Link as LinkIcon,
  ChevronRight,
  Settings,
  ArrowRight,
  PlusCircle,
  ListChecks, // Added for Total Responses
  Star,       // Added for Average Rating
  ThumbsUp,   // Added for Recommendation Score
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getClients,
  getCampaigns,
  getSurveys,
  getSystemReport,
  getBrandInsightsReport,
  getSurveyAnalysisReport,
  Survey,
} from "@/services/cia-api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

interface SystemReportSummary {
  totalResponses?: number;
  averageRating?: number;
  recommendationScore?: number;
  totalClients?: number;
  activeCampaigns?: number;
  surveysConducted?: number;
}

export default function AdminDashboardPage() {
  const { data: clientsData, isLoading: isLoadingClients, isError: isClientsError, error: clientsError } = useQuery({
    queryKey: ["clientsCount"],
    queryFn: async () => {
      try {
        const clients = await getClients();
        console.log("Clients API Response:", clients); // Debugging
        return clients?.length || 0;
      } catch (error) {
        console.error("Error fetching clients:", error);
        throw error;
      }
    },
  });

  const { data: campaignsData, isLoading: isLoadingCampaigns, isError: isCampaignsError, error: campaignsError } = useQuery({
    queryKey: ["campaignsCount"],
    queryFn: async () => {
      try {
        const campaigns = await getCampaigns();
        console.log("Campaigns API Response:", campaigns); // Debugging
        // Assuming we only want active campaigns for the dashboard count
        const activeCampaigns = campaigns?.filter(c => c.status === 'active');
        return activeCampaigns?.length || 0;
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }
    },
  });

  const { data: surveysData, isLoading: isLoadingSurveys, isError: isSurveysError, error: surveysError } = useQuery({
    queryKey: ["surveysCount"],
    queryFn: async () => {
      try {
        const surveys = await getSurveys();
        console.log("Surveys API Response:", surveys); // Debugging
        return surveys?.length || 0;
      } catch (error) {
        console.error("Error fetching surveys:", error);
        throw error;
      }
    },
  });

  // Fetch system report which might contain aggregated stats
  const { data: systemReportData, isLoading: isLoadingSystemReport, isError: isSystemReportError, error: systemReportError } = useQuery<SystemReportSummary | null, Error>({
    queryKey: ["systemReportSummary"],
    queryFn: async () => {
      try {
        const report = await getSystemReport();
        console.log("System Report API Response:", report); // Debugging
        // Attempt to extract the specific metrics from the report's data field
        // Adjust keys ('totalResponses', 'averageRating', 'recommendationScore') based on actual API response structure
        const reportData = report?.data;
        return {
          totalResponses: reportData?.totalResponses ?? undefined,
          averageRating: reportData?.averageRating ?? undefined,
          recommendationScore: reportData?.recommendationScore ?? reportData?.nps ?? undefined, // Check for 'nps' too
          // Include counts from other queries if system report doesn't provide them
          totalClients: reportData?.totalClients ?? undefined,
          activeCampaigns: reportData?.activeCampaigns ?? undefined,
          surveysConducted: reportData?.surveysConducted ?? undefined,
        };
      } catch (error) {
        console.error("Error fetching system report:", error);
        throw error; // Let React Query handle the error state
      }
    },
  });


  console.log("Actual System Report Data:", systemReportData);
  // Combine fetched data for stats cards
  const totalResponses = systemReportData?.totalResponses;
  const averageRating = systemReportData?.averageRating;
  const recommendationScore = systemReportData?.recommendationScore;
  const surveysConducted = surveysData; // Use direct survey count

  const stats = [
    { title: "Total Responses", value: isLoadingSystemReport ? <LoadingSpinner iconClassName="h-4 w-4" /> : (isSystemReportError ? <Alert variant="destructive" className="p-1 text-xs"><AlertDescription>{systemReportError?.message || "Error"}</AlertDescription></Alert> : totalResponses?.toLocaleString() ?? 'N/A'), icon: ListChecks, href: "/admin/surveys", color: "text-sky-500", bgColor: "bg-sky-500/10" },
    { title: "Average Rating", value: isLoadingSystemReport ? <LoadingSpinner iconClassName="h-4 w-4" /> : (isSystemReportError ? <Alert variant="destructive" className="p-1 text-xs"><AlertDescription>{systemReportError?.message || "Error"}</AlertDescription></Alert> : averageRating?.toFixed(1) ?? 'N/A'), icon: Star, href: "/admin/reports", color: "text-amber-500", bgColor: "bg-amber-500/10" },
    { title: "NPS / Recommendation", value: isLoadingSystemReport ? <LoadingSpinner iconClassName="h-4 w-4" /> : (isSystemReportError ? <Alert variant="destructive" className="p-1 text-xs"><AlertDescription>{systemReportError?.message || "Error"}</AlertDescription></Alert> : recommendationScore ?? 'N/A'), icon: ThumbsUp, href: "/admin/reports", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { title: "Surveys Conducted", value: isLoadingSurveys ? <LoadingSpinner iconClassName="h-4 w-4" /> : (isSurveysError ? <Alert variant="destructive" className="p-1 text-xs"><AlertDescription>{surveysError?.message || "Error"}</AlertDescription></Alert> : surveysConducted?.toLocaleString() ?? 'N/A'), icon: FileText, href: "/admin/surveys", color: "text-purple-500", bgColor: "bg-purple-500/10" },
 ];


  // Placeholder for recent activities - replace with actual data fetching if needed
  const recentActivities = [
    {
      icon: Users,
      title: "New Client Signed Up: Example Corp",
      subtitle: "client_new@example.com",
      time: "2h ago",
    },
    {
      icon: Briefcase,
      title: "Campaign Launched: 'Summer Sale 2024'",
      subtitle: "Example Corp",
      time: "1d ago",
    },
    {
      icon: FileText,
      title: "Survey Completed: 'Product Feedback Q2'",
      subtitle: "Summer Sale 2024 Campaign",
      time: "3d ago",
    },
    {
      icon: BarChart3,
      title: "Report Generated: 'Q2 Performance Analysis'",
      subtitle: "All Clients Consolidated Report",
      time: "5d ago",
    },
  ];

  const quickLinks = [
    { title: "Manage Clients", href: "/admin/clients", icon: Users, variant: "ghost" as const },
    { title: "Manage Campaigns", href: "/admin/campaigns", icon: Briefcase, variant: "ghost" as const },
    { title: "Manage Surveys", href: "/admin/surveys", icon: FileText, variant: "ghost" as const },
    { title: "System Settings", href: "/admin/settings", icon: Settings, variant: "ghost" as const },
  ];

  return (
    <ProtectedLayout>
      <TooltipProvider>
        <PageHeader title="Admin Dashboard" />
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-xl border-l-4 border-primary overflow-hidden bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn("p-2 rounded-full", stat.bgColor)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground mb-1 flex items-center">
                    {/* Conditional rendering for value */}
                     {typeof stat.value === 'number' || typeof stat.value === 'string'
                      ? stat.value
                      : React.isValidElement(stat.value)
                      ? stat.value // Render loading spinner or error alert
                      : 'N/A'}
                  </div>
                  <Link href={stat.href} passHref legacyBehavior>
                    <Button variant="link" size="sm" className="p-0 text-xs text-primary hover:underline">
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Recent Activity Card */}
             <Card className="md:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-xl bg-card">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex-1 grid gap-1 min-w-0">
                  <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                    <Activity className="mr-3 h-6 w-6 text-primary flex-shrink-0" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Overview of latest platform activities.
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="outline" className="ml-auto flex-shrink-0">
                  <Link href="/admin/logs"> {/* Link to a potential future logs page */}
                    View All <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-1 max-h-80 overflow-y-auto pr-2"> {/* Added scroll */}
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1 p-2.5 bg-primary/10 rounded-full">
                      <activity.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0"> {/* Ensures truncation works */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-medium leading-tight text-foreground truncate cursor-default">
                            {activity.title}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs z-50" side="top">
                          <p>{activity.title}</p>
                        </TooltipContent>
                      </Tooltip>
                       <Tooltip>
                        <TooltipTrigger asChild>
                           <p className="text-xs text-muted-foreground truncate cursor-default">
                            {activity.subtitle}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs z-50" side="top">
                           <p>{activity.subtitle}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 pt-1">
                      {activity.time}
                    </div>
                  </div>
                ))}
                 {recentActivities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity to display.</p>
                 )}
              </CardContent>
            </Card>


            {/* Quick Links Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-xl bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <LinkIcon className="mr-3 h-6 w-6 text-primary flex-shrink-0" />
                  Quick Links
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Navigate to key sections quickly.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2">
                {quickLinks.map((link) => (
                  <Button
                    key={link.title}
                    variant={link.variant}
                    asChild
                    className="w-full justify-start text-left px-3 py-2 h-auto hover:bg-accent hover:text-accent-foreground" // Ensure hover styles apply
                  >
                    <Link href={link.href}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.title}
                    </Link>
                  </Button>
                ))}
                 {/* Explicit Add New Client Button */}
                 <Button
                    variant="default" // Primary action style
                    asChild
                    className="w-full justify-start text-left mt-2 px-3 py-2 h-auto"
                  >
                    <Link href="/admin/clients" onClick={(e) => {
                        // Ideally trigger dialog from clients page. For now, navigates.
                        console.log("Navigate to Clients page to add new client");
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New Client
                    </Link>
                  </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedLayout>
  );
}
